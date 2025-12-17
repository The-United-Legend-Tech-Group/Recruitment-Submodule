'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Slider from '@mui/material/Slider';
import CircularProgress from '@mui/material/CircularProgress';
import StarIcon from '@mui/icons-material/Star';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import MessageIcon from '@mui/icons-material/Message';
import SendIcon from '@mui/icons-material/Send';
import InputAdornment from '@mui/material/InputAdornment';
import { useToast } from '@/lib/hooks/useToast';
import api from '@/lib/axios';

interface InterviewFeedbackProps {
    interviewId: string;
    interviewerId: string;
    onSubmitSuccess?: () => void;
}

export function InterviewFeedback({
    interviewId,
    interviewerId,
    onSubmitSuccess
}: InterviewFeedbackProps) {
    const toast = useToast();
    const [score, setScore] = useState<number>(0);
    const [comments, setComments] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (score < 1 || score > 10) {
            toast.error('Please provide a score between 1 and 10');
            return;
        }

        try {
            setIsSubmitting(true);
            await api.post(`/recruitment/Interview/Assessment/${interviewId}`, {
                interviewerId,
                score,
                comments: comments.trim() || undefined,
            });

            toast.success('Feedback submitted successfully!');

            // Reset form
            setScore(0);
            setComments('');

            if (onSubmitSuccess) {
                onSubmitSuccess();
            }
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || 'Failed to submit feedback';
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Card variant="outlined" sx={{ bgcolor: 'background.paper' }}>
            <CardContent sx={{ p: 3 }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 4 }}>
                    <StarIcon sx={{ color: 'warning.main', fontSize: 28 }} />
                    <Typography variant="h6" fontWeight={600}>Interview Feedback</Typography>
                </Stack>

                <Stack spacing={4} component="form" onSubmit={handleSubmit}>
                    {/* Score Input */}
                    <Box sx={{
                        p: 3,
                        bgcolor: 'action.hover',
                        borderRadius: 2,
                        border: '1px solid',
                        borderColor: 'divider',
                        color: 'text.primary'
                    }}>
                        <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 3 }}>
                            Score (1-10) <Box component="span" sx={{ color: 'error.main' }}>*</Box>
                        </Typography>
                        <Stack spacing={2}>
                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    type="number"
                                    size="medium"
                                    inputProps={{ min: 1, max: 10, step: 0.5 }}
                                    value={score || ''}
                                    onChange={(e) => setScore(parseFloat(e.target.value))}
                                    placeholder="0"
                                    required
                                    sx={{ width: 120 }}
                                />
                                <Typography variant="body2" color="text.secondary">
                                    Enter a score or use the slider below
                                </Typography>
                            </Stack>
                            <Box sx={{ px: 2, py: 1 }}>
                                <Slider
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    value={score || 1}
                                    onChange={(_, value) => setScore(value as number)}
                                    valueLabelDisplay="auto"
                                    marks={[
                                        { value: 1, label: 'Poor' },
                                        { value: 5.5, label: 'Average' },
                                        { value: 10, label: 'Excellent' }
                                    ]}
                                    sx={{
                                        '& .MuiSlider-markLabel': {
                                            color: 'text.secondary'
                                        }
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Box>

                    {/* Score indicator */}
                    {score > 0 && (
                        <Box sx={{
                            p: 2,
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'primary.main'
                        }}>
                            <Stack direction="row" spacing={2} alignItems="center" justifyContent="center">
                                <Stack direction="row" spacing={0.5}>
                                    {[...Array(10)].map((_, i) => (
                                        i < Math.floor(score) ? (
                                            <StarIcon key={i} sx={{ fontSize: 20, color: 'warning.main' }} />
                                        ) : (
                                            <StarBorderIcon key={i} sx={{ fontSize: 20, color: 'action.disabled' }} />
                                        )
                                    ))}
                                </Stack>
                                <Typography variant="h6" fontWeight={600}>
                                    {score.toFixed(1)} / 10
                                </Typography>
                            </Stack>
                        </Box>
                    )}

                    {/* Comments Input */}
                    <Box>
                        <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 2 }}>
                            <MessageIcon sx={{ fontSize: 20, color: 'text.secondary' }} />
                            <Typography variant="subtitle1" fontWeight={600}>
                                Comments (Optional)
                            </Typography>
                        </Stack>
                        <TextField
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={6}
                            value={comments}
                            onChange={(e) => setComments(e.target.value)}
                            placeholder="Share your thoughts about the candidate's performance, skills, and fit for the role..."
                            helperText={`${comments.length} characters`}
                            FormHelperTextProps={{ sx: { mt: 1 } }}
                            sx={{
                                overflowX: 'hidden'
                            }}
                            InputProps={{
                                sx: {
                                    '&.MuiOutlinedInput-root': {
                                        alignItems: 'flex-start',
                                        padding: '14px',
                                        boxSizing: 'border-box',
                                        overflow: 'hidden',
                                        minWidth: 0
                                    },
                                    '& .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'divider'
                                    },
                                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'primary.main'
                                    },
                                    '&:hover .MuiOutlinedInput-notchedOutline': {
                                        borderColor: 'text.secondary'
                                    },
                                    '& .MuiOutlinedInput-inputMultiline': {
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        boxSizing: 'border-box',
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word',
                                        width: '100%'
                                    },
                                    '& .MuiOutlinedInput-input': {
                                        overflowWrap: 'anywhere',
                                        wordBreak: 'break-word',
                                        width: '100%'
                                    },
                                    '& textarea': {
                                        wordWrap: 'break-word',
                                        wordBreak: 'break-word',
                                        whiteSpace: 'pre-wrap',
                                        overflowWrap: 'anywhere',
                                        maxHeight: '260px',
                                        overflowY: 'auto',
                                        overflowX: 'hidden',
                                        resize: 'vertical',
                                        boxSizing: 'border-box',
                                        width: '100%'
                                    }
                                }
                            }}
                        />
                    </Box>

                    {/* Submit Button */}
                    <Button
                        type="submit"
                        variant="contained"
                        color="primary"
                        size="large"
                        fullWidth
                        disabled={isSubmitting || score === 0}
                        startIcon={isSubmitting ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            bgcolor: 'primary.main',
                            color: 'primary.contrastText',
                            '&:hover': {
                                bgcolor: 'primary.dark'
                            },
                            '&.Mui-disabled': {
                                // keep visible label when disabled
                                bgcolor: 'action.disabledBackground',
                                color: 'text.secondary',
                                opacity: 1
                            }
                        }}
                    >
                        {isSubmitting ? 'Submitting Feedback...' : 'Submit Feedback'}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

