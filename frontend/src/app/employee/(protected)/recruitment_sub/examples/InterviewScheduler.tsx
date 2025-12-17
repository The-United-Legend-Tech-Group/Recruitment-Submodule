'use client';

import { useState } from 'react';
import { recruitmentApi, type CreateInterviewDto } from '@/lib/api';
import { useMutation } from '@/lib/hooks/useApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin } from 'lucide-react';

export function InterviewScheduler() {
  const [formData, setFormData] = useState<Partial<CreateInterviewDto>>({
    panel: [],
  });

  const createInterview = useMutation(recruitmentApi.createInterview, {
    onSuccess: () => {
      toast.success('Interview scheduled successfully!');
      setFormData({ panel: [] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to schedule interview');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicationId || !formData.scheduledDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    await createInterview.execute(formData as CreateInterviewDto);
  };

  const handleChange = (field: keyof CreateInterviewDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addPanelMember = () => {
    const memberId = (document.getElementById('panelMemberId') as HTMLInputElement)?.value;
    if (memberId && !formData.panel?.includes(memberId)) {
      setFormData(prev => ({
        ...prev,
        panel: [...(prev.panel || []), memberId],
      }));
      (document.getElementById('panelMemberId') as HTMLInputElement).value = '';
    }
  };

  const removePanelMember = (memberId: string) => {
    setFormData(prev => ({
      ...prev,
      panel: prev.panel?.filter(id => id !== memberId) || [],
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Schedule Interview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="applicationId">Application ID *</Label>
              <Input
                id="applicationId"
                value={formData.applicationId || ''}
                onChange={(e) => handleChange('applicationId', e.target.value)}
                placeholder="Enter application ID"
                required
              />
            </div>

            <div>
              <Label htmlFor="interviewType">Interview Type *</Label>
              <Input
                id="interviewType"
                value={formData.stage || ''}
                onChange={(e) => handleChange('stage', e.target.value)}
                placeholder="e.g., Technical, HR, Final"
                required
              />
            </div>

            <div>
              <Label htmlFor="scheduledDate">Scheduled Date & Time *</Label>
              <Input
                id="scheduledDate"
                type="datetime-local"
                value={formData.scheduledDate || ''}
                onChange={(e) => handleChange('scheduledDate', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-500" />
                <Input
                  id="location"
                  value={formData.method || ''}
                  onChange={(e) => handleChange('method', e.target.value)}
                  placeholder="Room 101 / Zoom Link"
                />
              </div>
            </div>
          </div>

          <div>
            <Label>Panel Members</Label>
            <div className="flex gap-2 mb-2">
              <Input
                id="panelMemberId"
                placeholder="Enter panel member ID"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPanelMember())}
              />
              <Button type="button" onClick={addPanelMember} variant="outline">
                Add
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.panel?.map((memberId) => (
                <div
                  key={memberId}
                  className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  <span>{memberId}</span>
                  <button
                    type="button"
                    onClick={() => removePanelMember(memberId)}
                    className="hover:text-blue-600"
                  >
                  </button>
                </div>
              ))}
            </div>
          </div>
          <Button type="submit" disabled={createInterview.loading} className="w-full">
            {createInterview.loading ? 'Scheduling...' : 'Schedule Interview'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
