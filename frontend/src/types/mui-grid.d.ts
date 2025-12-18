import * as React from 'react';

declare module '@mui/material/Grid' {
  // Allow the project-specific `size` prop used throughout the codebase
  // e.g. <Grid size={{ xs: 12, sm: 6 }}>
  interface GridProps {
    size?: any;
  }
}

export {};
