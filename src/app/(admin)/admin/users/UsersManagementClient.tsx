'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import {
  getAllUsers,
  updateUserRole,
  subscribeToAdminStore,
} from '@/lib/admin-data';
import type { Profile, UserRole } from '@/types/database';
import {
  Users,
  Search,
  ArrowLeft,
  Shield,
  GraduationCap,
  BookOpen,
  Filter,
  CheckCircle2,
  UserCheck,
  Calendar,
  Mail,
} from 'lucide-react';

export function UsersManagementClient() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | UserRole>('all');
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Role Edit Modal State
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('learner');
  const [roleModalOpen, setRoleModalOpen] = useState(false);

  const refreshUsers = () => {
    setUsers(getAllUsers());
  };

  useEffect(() => {
    refreshUsers();
    const unsubscribe = subscribeToAdminStore(refreshUsers);
    return () => unsubscribe();
  }, []);

  const handleOpenRoleModal = (user: Profile) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setRoleModalOpen(true);
  };

  const handleSaveRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      const updated = updateUserRole(selectedUser.id, newRole);
      setAlertNotice({
        type: 'success',
        message: `Role for ${updated.name} has been updated to "${updated.role.toUpperCase()}".`,
      });
      setTimeout(() => setAlertNotice(null), 5000);
      setRoleModalOpen(false);
      refreshUsers();
    } catch (err) {
      setAlertNotice({
        type: 'error',
        message: (err as Error).message,
      });
    }
  };

  // Filtered and searched users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      // Role filter
      if (roleFilter !== 'all' && user.role !== roleFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = user.name.toLowerCase().includes(q);
        const matchesEmail = user.email.toLowerCase().includes(q);
        if (!matchesName && !matchesEmail) return false;
      }
      return true;
    });
  }, [users, roleFilter, searchQuery]);

  // Counts for tabs
  const learnerCount = users.filter((u) => u.role === 'learner').length;
  const professorCount = users.filter((u) => u.role === 'professor').length;
  const adminCount = users.filter((u) => u.role === 'admin').length;

  return (
    <div className="space-y-8 pb-16">
      {/* Header with Navigation */}
      <div>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 mb-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-600 rounded"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Admin Console</span>
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-700" />
              <span>User Management Directory</span>
            </h1>
            <p className="text-sm font-medium text-slate-600 mt-1 max-w-2xl">
              Inspect all registered accounts, verify roles, filter by role tier, and elevate or update administrative and instructor permissions.
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
              Total Registered
            </span>
            <span className="text-2xl font-black text-slate-900">{users.length} Users</span>
          </div>
        </div>
      </div>

      {/* Visual Feedback Notice */}
      {alertNotice && (
        <Alert
          variant={alertNotice.type}
          title={alertNotice.type === 'success' ? 'Role Updated' : 'Operation Failed'}
          onClose={() => setAlertNotice(null)}
        >
          {alertNotice.message}
        </Alert>
      )}

      {/* Search Bar & Filters Card */}
      <Card className="border-2 border-slate-300 shadow-sm">
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by user name or email..."
                className="w-full pl-10 pr-4 py-2.5 bg-white text-slate-950 font-medium rounded-lg border-2 border-slate-300 hover:border-slate-400 focus:border-blue-700 focus:ring-4 focus:ring-blue-100 focus-visible:outline-none transition-all placeholder:text-slate-500 text-sm"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs font-bold text-slate-500 hover:text-slate-900"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Role Filter Tabs */}
            <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  roleFilter === 'all'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-300'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All ({users.length})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('learner')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  roleFilter === 'learner'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Learners ({learnerCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('professor')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  roleFilter === 'professor'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Professors ({professorCount})
              </button>
              <button
                type="button"
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  roleFilter === 'admin'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admins ({adminCount})
              </button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Directory Table */}
      <Card className="border-2 border-slate-300 shadow-sm overflow-hidden">
        <CardContent className="p-0 overflow-x-auto">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <Users className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-800">No Users Found</h3>
              <p className="text-sm text-slate-500 mt-1">
                No registered users match your search query or role filter.
              </p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b-2 border-slate-200 text-slate-800 text-xs font-black uppercase tracking-wider">
                  <th className="py-3.5 px-6">User / Name</th>
                  <th className="py-3.5 px-6">Email Address</th>
                  <th className="py-3.5 px-6">Current Role</th>
                  <th className="py-3.5 px-6">Joined Date</th>
                  <th className="py-3.5 px-6 text-right">Role Management</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    {/* User Name & Avatar */}
                    <td className="py-4 px-6 font-bold text-slate-900">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border ${
                            user.role === 'admin'
                              ? 'bg-purple-100 text-purple-900 border-purple-300'
                              : user.role === 'professor'
                              ? 'bg-indigo-100 text-indigo-900 border-indigo-300'
                              : 'bg-blue-100 text-blue-900 border-blue-300'
                          }`}
                        >
                          {user.name.charAt(0)}
                        </div>
                        <div>
                          <div className="text-slate-900 font-extrabold">{user.name}</div>
                          {user.bio && (
                            <div className="text-xs text-slate-500 font-normal line-clamp-1 max-w-xs">
                              {user.bio}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Email */}
                    <td className="py-4 px-6 text-slate-700 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="font-mono text-xs">{user.email}</span>
                      </div>
                    </td>

                    {/* Role Badge */}
                    <td className="py-4 px-6">
                      <Badge variant={user.role} />
                    </td>

                    {/* Joined Date */}
                    <td className="py-4 px-6 text-xs text-slate-600 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{new Date(user.created_at).toLocaleDateString()}</span>
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-6 text-right">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenRoleModal(user)}
                        className="font-bold text-xs"
                      >
                        <UserCheck className="w-4 h-4 mr-1 text-slate-600" />
                        Change Role
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* CHANGE ROLE MODAL */}
      <Modal
        isOpen={roleModalOpen}
        onClose={() => setRoleModalOpen(false)}
        title="Update User Role"
        description={
          selectedUser
            ? `Modify role and access permissions for ${selectedUser.name}`
            : 'Modify user role.'
        }
      >
        <form onSubmit={handleSaveRole} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Selected User
            </div>
            <div className="font-extrabold text-slate-900 mt-0.5">{selectedUser?.name}</div>
            <div className="text-xs font-mono text-slate-600">{selectedUser?.email}</div>
          </div>

          <Select
            label="Assigned System Role"
            value={newRole}
            onChange={(e) => setNewRole(e.target.value as UserRole)}
            options={[
              {
                value: 'learner',
                label: 'Learner — Can enroll in workshops, attend classes, submit assignments, and study videos',
              },
              {
                value: 'professor',
                label: 'Professor — Can manage assigned classes, mark attendance, post assignments, and grade submissions',
              },
              {
                value: 'admin',
                label: 'Administrator — Full system access: workshops, schedules, users, payments, and financial analytics',
              },
            ]}
            helperText="Changing a user's role immediately grants or restricts access according to route security guards."
          />

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setRoleModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Confirm Role Change
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
