import React from 'react';
import { UsersManagementClient } from './UsersManagementClient';

export const metadata = {
  title: 'User Directory | FSL Admin Console',
  description: 'Manage registered learners, professors, and administrators with role assignment controls and search filtering.',
};

export default function UsersPage() {
  return <UsersManagementClient />;
}
