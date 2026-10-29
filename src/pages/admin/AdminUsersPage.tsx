import React, { useState, useEffect } from 'react';
import { api } from '../../services/api.js';
import { User } from '../../types/index.js';
import { useAuth } from '../../context/AuthContext.js';
import {
  Users,
  Trash2,
  Shield,
  Store,
  UserCheck,
  Search,
  Plus,
  X,
  AlertTriangle,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  ShieldAlert,
} from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const { user: currentAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Role filters
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  // Add User Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addForm, setAddForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'customer',
    password: '',
  });
  const [addError, setAddError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);

  // Delete User Confirmation Modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Role Edit Modal
  const [roleEditUser, setRoleEditUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<'customer' | 'owner' | 'admin'>('customer');
  const [roleError, setRoleError] = useState<string | null>(null);
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const res = await api.getAdminUsers({
      q: searchTerm || undefined,
      role: roleFilter !== 'all' ? roleFilter : undefined,
    });
    if (res.success && res.data) {
      setUsers(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddError(null);

    if (addForm.name.trim().length < 2) {
      setAddError('Please provide a full name of at least 2 characters.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addForm.email.trim())) {
      setAddError('Please enter a valid email address.');
      return;
    }

    if (addForm.password.length < 6) {
      setAddError('Password must be at least 6 characters long.');
      return;
    }

    setIsAdding(true);
    const res = await api.createAdminUser(addForm);
    setIsAdding(false);

    if (res.success && res.data) {
      setUsers(prev => [res.data, ...prev]);
      setAddModalOpen(false);
      setAddForm({ name: '', email: '', phone: '', role: 'customer', password: '' });
    } else {
      setAddError(res.message || 'Failed to create user account.');
    }
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    // Frontend guard: cannot delete self
    if (userToDelete._id === currentAdmin?._id) {
      setDeleteError('You cannot delete your own administrator account while logged in.');
      return;
    }

    // Frontend guard: cannot delete last admin
    if (userToDelete.role === 'admin') {
      const adminCount = users.filter(u => u.role === 'admin').length;
      if (adminCount <= 1) {
        setDeleteError('Cannot delete the last remaining administrator account.');
        return;
      }
    }

    setIsDeleting(true);
    setDeleteError(null);

    const res = await api.deleteAdminUser(userToDelete._id);
    setIsDeleting(false);

    if (res.success) {
      setUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      setUserToDelete(null);
    } else {
      setDeleteError(res.message || 'Failed to delete user account.');
    }
  };

  const handleUpdateRole = async () => {
    if (!roleEditUser) return;
    setIsUpdatingRole(true);
    setRoleError(null);

    const res = await api.updateAdminUser(roleEditUser._id, { role: newRole });
    setIsUpdatingRole(false);

    if (res.success && res.data) {
      setUsers(prev => prev.map(u => (u._id === roleEditUser._id ? { ...u, role: newRole } : u)));
      setRoleEditUser(null);
    } else {
      setRoleError(res.message || 'Failed to update user role.');
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      case 'owner':
      case 'business_owner':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      default:
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-400 border border-sky-200 dark:border-sky-800';
    }
  };

  const adminCount = users.filter(u => u.role === 'admin').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Add User */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-neutral-900 dark:text-white">
            Platform User Accounts
          </h1>
          <p className="text-xs text-neutral-500">
            Supervise user registrations, assign administrative permissions, and moderate credentials
          </p>
        </div>

        <button
          onClick={() => {
            setAddError(null);
            setAddModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Add Account
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 rounded-2xl p-4 shadow-xs space-y-3">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search accounts by name, email, or phone..."
            className="w-full pl-9 pr-20 py-2 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 text-xs font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-neutral-100 dark:border-neutral-800">
          {[
            { id: 'all', label: 'All Roles' },
            { id: 'customer', label: 'Customers' },
            { id: 'owner', label: 'Business Owners' },
            { id: 'admin', label: 'Administrators' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                roleFilter === tab.id
                  ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900 shadow-xs'
                  : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-neutral-500">Loading user accounts...</p>
        </div>
      ) : users.length === 0 ? (
        <div className="py-20 text-center rounded-3xl border border-dashed border-neutral-200 dark:border-neutral-800 p-8 space-y-3 bg-white dark:bg-neutral-900">
          <Users className="w-10 h-10 mx-auto text-neutral-400" />
          <h3 className="font-bold text-base text-neutral-900 dark:text-white">
            No accounts found
          </h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            Try adjusting your search criteria or role filters to view registered users.
          </p>
        </div>
      ) : (
        <div className="rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200/80 dark:border-neutral-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 dark:bg-neutral-800/60 border-b border-neutral-100 dark:border-neutral-800 text-neutral-500 font-semibold">
                <tr>
                  <th className="py-3 px-4">User Details</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Phone Number</th>
                  <th className="py-3 px-4">Registration Date</th>
                  <th className="py-3 px-4 text-right">Account Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                {users.map(u => {
                  const isCurrent = u._id === currentAdmin?._id;
                  const isSoleAdmin = u.role === 'admin' && adminCount <= 1;

                  return (
                    <tr key={u._id} className="hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-neutral-900 dark:text-white">
                            {u.name}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-neutral-400 block">{u.email}</span>
                      </td>

                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setRoleEditUser(u);
                            setNewRole(
                              u.role === 'business_owner' ? 'owner' : (u.role as any)
                            );
                            setRoleError(null);
                          }}
                          className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider hover:opacity-80 transition-opacity ${getRoleBadge(
                            u.role
                          )}`}
                          title="Click to change account role"
                        >
                          {u.role === 'business_owner' ? 'owner' : u.role} ✎
                        </button>
                      </td>

                      <td className="py-3 px-4 text-neutral-600 dark:text-neutral-400">
                        {u.phone || '—'}
                      </td>

                      <td className="py-3 px-4 text-neutral-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCurrent ? (
                            <span className="text-[11px] text-neutral-400 italic">
                              Active session
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setUserToDelete(u);
                                setDeleteError(null);
                              }}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-600 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                              title={
                                isSoleAdmin
                                  ? 'Cannot delete last administrator'
                                  : 'Delete user account'
                              }
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Create User Account
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {addError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{addError}</span>
              </div>
            )}

            <form onSubmit={handleCreateUser} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={addForm.name}
                  onChange={e => setAddForm({ ...addForm, name: e.target.value })}
                  placeholder="e.g. Vikramaditya Sen"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={addForm.email}
                  onChange={e => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="e.g. vikram@localhub.platform"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={addForm.phone}
                  onChange={e => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Account Role <span className="text-red-500">*</span>
                </label>
                <select
                  value={addForm.role}
                  onChange={e => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="customer">Customer</option>
                  <option value="owner">Business Owner</option>
                  <option value="admin">Platform Administrator</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                  Password <span className="text-red-500">*</span> (min 6 characters)
                </label>
                <input
                  type="password"
                  required
                  value={addForm.password}
                  onChange={e => setAddForm({ ...addForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100 dark:border-neutral-800">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  disabled={isAdding}
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAdding}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
                >
                  {isAdding ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Role Edit Modal */}
      {roleEditUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white">
                Modify Account Role
              </h3>
              <button
                onClick={() => setRoleEditUser(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400">
              Adjust permissions for{' '}
              <strong className="text-neutral-900 dark:text-white">{roleEditUser.name}</strong> (
              {roleEditUser.email})
            </p>

            {roleError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                {roleError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1 text-neutral-700 dark:text-neutral-300">
                Select Role
              </label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as any)}
                className="w-full p-2.5 text-xs rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="customer">Customer</option>
                <option value="owner">Business Owner</option>
                <option value="admin">Platform Administrator</option>
              </select>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setRoleEditUser(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateRole}
                disabled={isUpdatingRole}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-sky-600 hover:bg-sky-700 text-white shadow-xs transition-colors"
              >
                {isUpdatingRole ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-500" />
                Delete Account
              </h3>
              <button
                onClick={() => setUserToDelete(null)}
                className="text-neutral-400 hover:text-neutral-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-400 leading-relaxed">
              Are you sure you want to permanently delete the account for{' '}
              <strong className="text-neutral-900 dark:text-white">
                {userToDelete.name}
              </strong>{' '}
              ({userToDelete.email})? This action cannot be reversed.
            </p>

            {/* Safeguard warnings */}
            {userToDelete._id === currentAdmin?._id && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Safeguard: You cannot delete your own account while logged in.</span>
              </div>
            )}

            {userToDelete.role === 'admin' && adminCount <= 1 && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  Safeguard: This is the last authorized administrator account. Deletion is prohibited.
                </span>
              </div>
            )}

            {deleteError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs">
                {deleteError}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-100 dark:border-neutral-800">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                disabled={isDeleting}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteUser}
                disabled={
                  isDeleting ||
                  userToDelete._id === currentAdmin?._id ||
                  (userToDelete.role === 'admin' && adminCount <= 1)
                }
                className="px-4 py-2 rounded-xl text-xs font-bold bg-red-600 hover:bg-red-700 text-white shadow-xs transition-colors disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Permanently Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
