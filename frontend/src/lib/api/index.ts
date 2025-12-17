// Export all API modules
export { recruitmentApi } from './recruitment';
export { offboardingApi } from './offboarding';
export { employeeApi, candidateApi } from './employee_subsystem';

// Export types
export type * from './recruitment';
export type * from './offboarding';
export type * from './employee_subsystem';

// Re-export axios instance if needed
export { default as api } from '@/lib/axios';
