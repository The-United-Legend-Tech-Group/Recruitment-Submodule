'use client';

import { useState, useEffect } from 'react';
import { recruitmentApi, offboardingApi } from '@/lib/api';
import { toast } from 'sonner';
import {
  Box,
  Stack,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  Chip,
  Grid,
  Paper,
  CircularProgress,
  Avatar
} from '@mui/material';
import {
  Shield as ShieldIcon,
  VpnKey as KeyIcon,
  PersonOff as UserXIcon,
  PersonAdd as UserCheckIcon,
  DnsRounded as ServerIcon,
  Storage as DatabaseIcon
} from '@mui/icons-material';

export function SystemAdminDashboard() {
  const [activeTab, setActiveTab] = useState<'provisioning' | 'revocation'>('provisioning');

  const pendingProvisioning = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@company.com',
      department: 'Engineering',
      startDate: '2025-12-10',
      systems: ['Email', 'SSO', 'Payroll', 'GitHub', 'Jira'],
    },
    {
      id: 2,
      name: 'Jane Smith',
      email: 'jane.smith@company.com',
      department: 'Product',
      startDate: '2025-12-12',
      systems: ['Email', 'SSO', 'Payroll', 'Figma', 'Confluence'],
    },
  ];

  const systemStats = [
    { label: 'Active Users', value: '248', icon: UserCheckIcon, color: '#10b981' },
    { label: 'Pending Provisioning', value: '5', icon: KeyIcon, color: '#3b82f6' },
    { label: 'Pending Revocation', value: '3', icon: UserXIcon, color: '#ef4444' },
    { label: 'System Uptime', value: '99.9%', icon: ServerIcon, color: '#a855f7' },
  ];

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h5" color="text.primary" gutterBottom>
          System Admin Dashboard
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Manage system access provisioning and revocation
        </Typography>
      </Box>

      {/* Stats */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 2 }}>
        {systemStats.map((stat) => (
          <Card variant="outlined" key={stat.label}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography variant="body2" color="text.secondary">
                    {stat.label}
                  </Typography>
                  <Typography variant="h4" sx={{ mt: 0.5 }}>
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar sx={{ bgcolor: stat.color, width: 48, height: 48 }}>
                  <stat.icon />
                </Avatar>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Tabs */}
      <Paper variant="outlined" sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          sx={{ px: 1 }}
        >
          <Tab
            icon={<UserCheckIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Access Provisioning"
            value="provisioning"
          />
          <Tab
            icon={<UserXIcon sx={{ fontSize: 18 }} />}
            iconPosition="start"
            label="Access Revocation"
            value="revocation"
          />
        </Tabs>
      </Paper>

      {/* Provisioning Tab */}
      {activeTab === 'provisioning' && (
        <Stack spacing={2}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Pending Access Provisioning
              </Typography>
              <Stack spacing={2}>
                {pendingProvisioning.map((user) => (
                  <Paper key={user.id} variant="outlined" sx={{ p: 2 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                      <Box>
                        <Typography variant="subtitle1">{user.name}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                          {user.department} · Start Date: {user.startDate}
                        </Typography>
                      </Box>
                      <Chip label="New Hire" color="primary" size="small" />
                    </Stack>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        Systems to provision:
                      </Typography>
                      <Stack direction="row" flexWrap="wrap" gap={1}>
                        {user.systems.map((system) => (
                          <Chip key={system} label={system} size="small" variant="outlined" />
                        ))}
                      </Stack>
                    </Box>

                    <Stack direction="row" spacing={1}>
                      <Button variant="contained" color="success" fullWidth size="small">
                        Provision All Access
                      </Button>
                      <Button variant="outlined" size="small">
                        Custom Setup
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Available Systems
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }, gap: 1.5 }}>
                {[
                  'Email (O365)',
                  'SSO',
                  'Payroll System',
                  'GitHub',
                  'Jira',
                  'Confluence',
                  'Slack',
                  'Salesforce',
                  'HubSpot',
                  'Figma',
                  'AWS Console',
                  'VPN Access',
                ].map((system) => (
                  <Paper variant="outlined" sx={{ p: 1.5, display: 'flex', alignItems: 'center', gap: 1 }} key={system}>
                    <DatabaseIcon fontSize="small" color="action" />
                    <Typography variant="body2">{system}</Typography>
                  </Paper>
                ))}
              </Box>
            </CardContent>
          </Card>
        </Stack>
      )}

      {/* Revocation Tab */}
      {activeTab === 'revocation' && (
        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Access Revocation (Coming Soon)
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
              System access revocation is now managed through the Termination Reviews tab
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Automated Scheduling */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Automated Access Management
          </Typography>
          <Stack spacing={2}>
            <Paper
              sx={{
                p: 2,
                bgcolor: 'action.hover',
                border: 1,
                borderColor: 'success.main'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <UserCheckIcon sx={{ color: 'success.main', mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Automatic Provisioning Enabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    System access is automatically provisioned on employee start date
                  </Typography>
                </Box>
                <Button size="small" color="success">
                  Configure
                </Button>
              </Stack>
            </Paper>

            <Paper
              sx={{
                p: 2,
                bgcolor: 'error.light',
                color: 'error.contrastText',
                border: 1,
                borderColor: 'error.main'
              }}
            >
              <Stack direction="row" spacing={2} alignItems="flex-start">
                <UserXIcon sx={{ color: 'error.main', mt: 0.5 }} />
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2" fontWeight="medium">
                    Automatic Revocation Enabled
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    System access is automatically revoked on employee exit date
                  </Typography>
                </Box>
                <Button size="small" color="error">
                  Configure
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </CardContent>
      </Card>

      {/* Activity Log */}
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <Stack spacing={1.5}>
            {[
              { action: 'Access provisioned', user: 'Alice Brown', system: 'All systems', time: '1 hour ago', type: 'provision' },
              { action: 'Access revoked', user: 'Bob Martin', system: 'All systems', time: '3 hours ago', type: 'revocation' },
              { action: 'Access provisioned', user: 'Carol Davis', system: 'Email, SSO', time: '5 hours ago', type: 'provision' },
              { action: 'Access modified', user: 'David Lee', system: 'GitHub', time: '1 day ago', type: 'modification' },
            ].map((activity, index) => (
              <Paper key={index} variant="outlined" sx={{ p: 1.5, bgcolor: 'action.hover', color: 'text.primary' }}>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      mt: 1,
                      bgcolor:
                        activity.type === 'provision'
                          ? 'success.main'
                          : activity.type === 'revocation'
                            ? 'error.main'
                            : 'primary.main',
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="body2">
                      {activity.action} for {activity.user}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {activity.system} · {activity.time}
                    </Typography>
                  </Box>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}
