import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, SearchInput, EmptyState } from '@/Components/Shared';
import { Plus, Edit, Trash2, Users, Shield, Key, ChevronDown, ChevronUp, Check } from 'lucide-react';

interface UserData {
    id: number;
    name: string;
    email: string;
    roles: string[];
    permissions: string[];
    created_at: string;
}

interface RoleOption {
    id: number;
    name: string;
}

interface Props {
    users: { data: UserData[]; meta: any };
    roles: RoleOption[];
    permissions: RoleOption[];
    filters: { search: string };
}

const ROLE_LABELS: Record<string, string> = {
    super_admin:          'Super Admin',
    ketua:                'Ketua',
    sekretaris:           'Sekretaris',
    bendahara:            'Bendahara',
    koordinator_logistik: 'Koordinator Logistik',
    staff:                'Staff',
};

const ROLE_COLORS: Record<string, string> = {
    super_admin:          'bg-purple-100 text-purple-700',
    ketua:                'bg-red-100 text-red-700',
    sekretaris:           'bg-blue-100 text-blue-700',
    bendahara:            'bg-yellow-100 text-yellow-700',
    koordinator_logistik: 'bg-green-100 text-green-700',
    staff:                'bg-gray-100 text-gray-700',
};

export default function UsersIndex({ users, roles, permissions, filters }: Props) {
    const { props } = usePage<any>();
    const userRoles = props.auth?.roles || [];
    const canEdit = !userRoles.includes('anggota') && !userRoles.includes('relawan');

    const [search, setSearch] = useState(filters.search || '');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        roles: [] as string[],
        permissions: [] as string[],
        _method: 'post',
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/users', { search }, { preserveState: true });
    };

    const handleOpenAdd = () => {
        reset();
        setData('_method' as any, 'post');
        setEditingId(null);
        setShowRoleDropdown(false);
        setIsModalOpen(true);
    };

    const handleEdit = (user: UserData) => {
        setData({
            name: user.name,
            email: user.email,
            password: '',
            password_confirmation: '',
            roles: user.roles,
            permissions: user.permissions || [],
            _method: 'put',
        } as any);
        setEditingId(user.id);
        setShowRoleDropdown(false);
        setIsModalOpen(true);
    };

    const handleDelete = (user: UserData) => {
        if (confirm(`Yakin ingin menghapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
            router.delete(`/users/${user.id}`);
        }
    };

    const toggleRole = (roleName: string) => {
        const current = data.roles;
        if (current.includes(roleName)) {
            setData('roles', current.filter(r => r !== roleName));
        } else {
            setData('roles', [...current, roleName]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const url = editingId ? `/users/${editingId}` : '/users';
        post(url, {
            onSuccess: () => {
                setIsModalOpen(false);
                setEditingId(null);
                reset();
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Manajemen Pengguna" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Manajemen Pengguna</h1>
                    <p className="page-subtitle">Kelola akun pengguna dan hak akses sistem.</p>
                </div>
                {canEdit && (
                    <button onClick={handleOpenAdd} className="btn-primary">
                        <Plus size={16} /> Tambah Pengguna
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <div className="flex-1">
                            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau email pengguna..." />
                        </div>
                        <button type="submit" className="btn-secondary">Cari</button>
                    </form>
                </div>
            </div>

            {/* Table */}
            <div className="card overflow-hidden">
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th>Pengguna</th>
                                <th>Peran (Role)</th>
                                <th>Terdaftar</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.data.length > 0 ? users.data.map((user, i) => (
                                <tr key={user.id}>
                                    <td className="text-gray-500">{i + 1}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0">
                                                <span className="text-white font-bold text-sm">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="flex flex-wrap gap-1">
                                            {user.roles.length > 0 ? user.roles.map(role => (
                                                <span
                                                    key={role}
                                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}
                                                >
                                                    <Shield size={10} />
                                                    {ROLE_LABELS[role] || role}
                                                </span>
                                            )) : (
                                                <span className="text-xs text-gray-400 italic">Belum ada peran</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="text-sm text-gray-500">{user.created_at}</td>
                                    <td className="text-right space-x-2">
                                        {canEdit && (
                                            <>
                                                <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(user)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={16} /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={5}>
                                        <EmptyState icon={<Users />} title="Belum ada pengguna" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add/Edit Modal */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Pengguna' : 'Tambah Pengguna'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="form-label">Nama Lengkap</label>
                        <input
                            type="text"
                            className="form-input"
                            value={data.name}
                            onChange={e => setData('name', e.target.value)}
                            placeholder="Masukkan nama pengguna"
                            required
                        />
                        {errors.name && <p className="form-error">{errors.name}</p>}
                    </div>

                    {/* Email */}
                    <div>
                        <label className="form-label">Email</label>
                        <input
                            type="email"
                            className="form-input"
                            value={data.email}
                            onChange={e => setData('email', e.target.value)}
                            placeholder="email@contoh.com"
                            required
                        />
                        {errors.email && <p className="form-error">{errors.email}</p>}
                    </div>

                    {/* Password */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">
                                Password {editingId && <span className="text-gray-400 font-normal">(kosongkan jika tidak diubah)</span>}
                            </label>
                            <input
                                type="password"
                                className="form-input"
                                value={data.password}
                                onChange={e => setData('password', e.target.value)}
                                placeholder={editingId ? '••••••••' : 'Min. 8 karakter'}
                                required={!editingId}
                            />
                            {errors.password && <p className="form-error">{errors.password}</p>}
                        </div>
                        <div>
                            <label className="form-label">Konfirmasi Password</label>
                            <input
                                type="password"
                                className="form-input"
                                value={data.password_confirmation}
                                onChange={e => setData('password_confirmation', e.target.value)}
                                placeholder="Ulangi password"
                                required={!editingId}
                            />
                        </div>
                    </div>

                    {/* Permissions */}
                    <div>
                        <label className="form-label flex items-center gap-1 mb-2">
                            <Shield size={13} /> Hak Akses Tambahan (Permissions)
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                            {permissions.map(perm => (
                                <label key={perm.id} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 cursor-pointer p-1.5 hover:bg-white dark:hover:bg-gray-800 rounded">
                                    <input
                                        type="checkbox"
                                        className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                                        checked={data.permissions.includes(perm.name)}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setData('permissions', [...data.permissions, perm.name]);
                                            } else {
                                                setData('permissions', data.permissions.filter(p => p !== perm.name));
                                            }
                                        }}
                                    />
                                    <span className="truncate">{perm.name}</span>
                                </label>
                            ))}
                        </div>
                        {errors.permissions && <p className="form-error">{errors.permissions}</p>}
                    </div>

                    {/* Selected permissions preview */}
                    {data.permissions.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {data.permissions.map(p => (
                                <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                    <Shield size={10} />
                                    {p}
                                </span>
                            ))}
                        </div>
                    )}

                    <div className="flex justify-end gap-2 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
