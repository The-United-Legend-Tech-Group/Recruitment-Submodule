'use client';

import { useState, useEffect } from 'react';
import { recruitmentApi } from '@/lib/api';
import { useMutation } from '@/lib/hooks/useApi';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Briefcase, Calendar, MapPin, DollarSign } from 'lucide-react';

export function JobPostingsWithAPI() {
  const [requisitions, setRequisitions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch published job requisitions
  useEffect(() => {
    const fetchRequisitions = async () => {
      try {
        const response = await recruitmentApi.getAllPublishedRequisitions();
        setRequisitions(response.data);
      } catch (error) {
        toast.error('Failed to load job postings');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequisitions();
  }, []);

  // Mutation for creating application
  const createApplication = useMutation(recruitmentApi.createApplication, {
    onSuccess: () => {
      toast.success('Application submitted successfully!');
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit application');
    },
  });

  const handleApply = async (requisitionId: string) => {
    try {
      await createApplication.execute({
        requisitionId: requisitionId,
        candidateId: 'current-user-id', // Replace with actual user ID from auth
      });
    } catch (error) {
      // Error already handled in mutation
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading job postings...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Available Job Postings</h2>
        <p className="text-gray-600">Browse and apply to open positions</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {requisitions.map((job) => (
          <Card key={job._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                </div>
              </div>
              <CardDescription>{job.department}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location || 'Not specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{job.employmentType}</span>
                </div>
                {job.salaryRange && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>
                      ${job.salaryRange.min.toLocaleString()} - ${job.salaryRange.max.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => handleApply(job._id)}
                  disabled={createApplication.loading}
                  className="w-full"
                >
                  {createApplication.loading ? 'Applying...' : 'Apply Now'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {requisitions.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No job postings available at the moment
        </div>
      )}
    </div>
  );
}
