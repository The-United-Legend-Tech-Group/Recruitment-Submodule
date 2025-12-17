'use client';

import { useState } from 'react';
import { recruitmentApi, type CreateOfferDto } from '@/lib/api';
import { useMutation } from '@/lib/hooks/useApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';

export function CreateOfferForm() {
  const [formData, setFormData] = useState<Partial<CreateOfferDto>>({
    benefits: [],
  });

  const createOffer = useMutation(recruitmentApi.createOffer, {
    onSuccess: () => {
      toast.success('Offer created successfully!');
      // Reset form
      setFormData({ benefits: [] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to create offer');
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.applicationId || !formData.candidateId || !formData.hrEmployeeId || !formData.role) {
      toast.error('Please fill in all required fields');
      return;
    }

    await createOffer.execute(formData as CreateOfferDto);
  };

  const handleChange = (field: keyof CreateOfferDto, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleBenefitsChange = (value: string) => {
    const benefitsArray = value.split(',').map(b => b.trim()).filter(b => b);
    setFormData(prev => ({ ...prev, benefits: benefitsArray }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create Job Offer</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="applicationId">Application ID *</Label>
              <Input
                id="applicationId"
                value={formData.applicationId || ''}
                onChange={(e) => handleChange('applicationId', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="candidateId">Candidate ID *</Label>
              <Input
                id="candidateId"
                value={formData.candidateId || ''}
                onChange={(e) => handleChange('candidateId', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="hrEmployeeId">HR Employee ID *</Label>
              <Input
                id="hrEmployeeId"
                value={formData.hrEmployeeId || ''}
                onChange={(e) => handleChange('hrEmployeeId', e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="role">Role *</Label>
              <Input
                id="role"
                value={formData.role || ''}
                onChange={(e) => handleChange('role', e.target.value)}
                required
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="benefits">Benefits (comma-separated)</Label>
              <Input
                id="benefits"
                value={formData.benefits?.join(', ') || ''}
                onChange={(e) => handleBenefitsChange(e.target.value)}
                placeholder="Health insurance, Dental, 401k"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="deadline">Offer Deadline</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline || ''}
                onChange={(e) => handleChange('deadline', e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="conditions">Conditions</Label>
            <Textarea
              id="conditions"
              value={formData.conditions || ''}
              onChange={(e) => handleChange('conditions', e.target.value)}
              rows={3}
              placeholder="Employment conditions..."
            />
          </div>

          <div>
            <Label htmlFor="insurances">Insurances</Label>
            <Textarea
              id="insurances"
              value={formData.insurances || ''}
              onChange={(e) => handleChange('insurances', e.target.value)}
              rows={2}
              placeholder="Insurance details..."
            />
          </div>

          <div>
            <Label htmlFor="content">Additional Content</Label>
            <Textarea
              id="content"
              value={formData.content || ''}
              onChange={(e) => handleChange('content', e.target.value)}
              rows={4}
              placeholder="Additional offer details..."
            />
          </div>

          <Button type="submit" disabled={createOffer.loading} className="w-full">
            {createOffer.loading ? 'Creating Offer...' : 'Create Offer'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
