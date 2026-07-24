import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, SearchInput, EmptyState } from '@/Components/Shared';
import { Plus, Edit, Trash2, Users, Shield, Key, ChevronDown, ChevronUp, ChevronRight, Check, Eye } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

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
    filters: { search: string; sort_by?: string; sort_dir?: string };
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

const PERMISSION_GROUPS = [
    {
        title: "Dashboard & Profil",
        permissions: ['menu-dashboard', 'menu-organization']
    },
    {
        title: "Data Master & Keanggotaan",
        permissions: ['menu-members', 'menu-executives', 'menu-volunteers', 'menu-diklatsar']
    },
    {
        title: "Program & Publikasi",
        permissions: ['menu-programs', 'menu-beneficiaries', 'menu-news']
    },
    {
        title: "Arus Kas & Donasi",
        permissions: ['menu-finance', 'menu-donations', 'menu-dues']
    },
    {
        title: "Logistik & Aset",
        permissions: ['menu-logistics', 'menu-assets', 'menu-vehicle-usages']
    },
    {
        title: "Sistem & Laporan",
        permissions: ['menu-reports', 'menu-users', 'menu-activity-logs', 'menu-helpdesk-manage']
    }
];

const PERMISSION_LABELS: Record<string, string> = {
    'menu-dashboard': 'Dashboard',
    'menu-organization': 'Profil Organisasi',
    'menu-members': 'Data Anggota',
    'menu-executives': 'Data Pengurus',
    'menu-volunteers': 'Data Relawan',
    'menu-diklatsar': 'Modul Diklatsar',
    'menu-programs': 'Program Kerja',
    'menu-beneficiaries': 'Penerima Manfaat',
    'menu-news': 'Berita & Informasi',
    'menu-finance': 'Arus Kas',
    'menu-donations': 'Manajemen Donasi',
    'menu-dues': 'Manajemen Iuran',
    'menu-logistics': 'Logistik',
    'menu-assets': 'Manajemen Aset',
    'menu-vehicle-usages': 'Mobil Operasional',
    'menu-reports': 'Pelaporan',
    'menu-users': 'Manajemen Pengguna',
    'menu-activity-logs': 'Log Aktivitas',
    'menu-helpdesk-manage': 'Manajemen Pengaduan'
};

export default function UsersIndex({ users, roles, permissions, filters }: Props) {
    const { props } = usePage<any>();
    const userRoles = props.auth?.roles || [];
    const canEdit = !userRoles.includes('anggota') && !userRoles.includes('relawan');

    const [search, setSearch] = useState(filters.search || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'name');
    const [sortDir, setSortDir] = useState(filters.sort_dir || 'asc');
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [showRoleDropdown, setShowRoleDropdown] = useState(false);
    
    const [previewUser, setPreviewUser] = useState<UserData | null>(null);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);

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
        router.get('/users', { search, sort_by: sortBy, sort_dir: sortDir }, { preserveState: true });
    };

    const handleSort = (column: string) => {
        let newDir = 'asc';
        if (sortBy === column) {
            newDir = sortDir === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortDir(newDir);
        router.get('/users', { search, sort_by: column, sort_dir: newDir }, { preserveState: true });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ChevronDown size={14} className="text-gray-400 inline ml-1 opacity-50" />;
        return sortDir === 'asc' ? <ChevronUp size={14} className="text-indigo-600 inline ml-1" /> : <ChevronDown size={14} className="text-indigo-600 inline ml-1" />;
    };

    const toggleGroup = (role: string) => {
        setExpandedGroups(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
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

    const handleDelete = async (user: UserData) => {
        if (await confirmAction(`Yakin ingin menghapus pengguna "${user.name}"? Tindakan ini tidak dapat dibatalkan.`)) {
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

    const groupedUsers = users.data.reduce((acc, user) => {
        const role = user.roles.length > 0 ? user.roles[0] : 'Tanpa Peran';
        if (!acc[role]) acc[role] = [];
        acc[role].push(user);
        return acc;
    }, {} as Record<string, UserData[]>);

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
                                <th onClick={() => handleSort('name')} className="cursor-pointer hover:bg-gray-50 transition-colors">Pengguna <SortIcon column="name" /></th>
                                <th>Peran (Role)</th>
                                <th onClick={() => handleSort('created_at')} className="cursor-pointer hover:bg-gray-50 transition-colors">Terdaftar <SortIcon column="created_at" /></th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(groupedUsers).length > 0 ? Object.entries(groupedUsers).map(([roleGroup, usersInGroup]) => (
                                <React.Fragment key={roleGroup}>
                                    <tr className="bg-gray-50/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => toggleGroup(roleGroup)}>
                                        <td colSpan={5} className="py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border-b border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2">
                                                {expandedGroups.includes(roleGroup) ? <ChevronDown size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}
                                                {ROLE_LABELS[roleGroup] || roleGroup}
                                                <span className="text-xs font-normal text-gray-400">({usersInGroup.length} pengguna)</span>
                                            </div>
                                        </td>
                                    </tr>
                                    {expandedGroups.includes(roleGroup) && usersInGroup.map((user, idx) => (
                                        <tr key={user.id}>
                                            <td className="text-gray-500">{idx + 1}</td>
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
                                            <td className="text-sm text-gray-500 whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
                                            </td>
                                            <td className="text-right space-x-2">
                                                <button onClick={() => { setPreviewUser(user); setIsPreviewOpen(true); }} className="p-1.5 rounded transition-colors text-gray-400 hover:text-theme-600 bg-white border border-gray-200 shadow-sm hover:border-theme-300 hover:bg-theme-50" title="Preview Data"><Eye size={16} /></button>
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => handleEdit(user)} className="p-1.5 rounded transition-colors text-gray-400 hover:text-blue-600 bg-white border border-gray-200 shadow-sm hover:border-blue-300 hover:bg-blue-50" title="Edit"><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(user)} className="p-1.5 rounded transition-colors text-gray-400 hover:text-red-600 bg-white border border-gray-200 shadow-sm hover:border-red-300 hover:bg-red-50" title="Hapus"><Trash2 size={16} /></button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </React.Fragment>
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

                    {/* Roles */}
                    <div>
                        <label className="form-label flex items-center gap-2 mb-2 text-gray-800 dark:text-gray-200">
                            <Users size={16} className="text-theme-600" /> Peran (Roles)
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {roles.map(role => {
                                const isChecked = data.roles.includes(role.name);
                                return (
                                    <button
                                        key={role.id}
                                        type="button"
                                        onClick={() => toggleRole(role.name)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                                            isChecked 
                                                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50' 
                                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                                        }`}
                                    >
                                        {ROLE_LABELS[role.name] || role.name}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Permissions */}
                    {data.roles.includes('super_admin') ? (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50 rounded-xl p-4 flex items-start gap-3">
                            <Shield className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" size={18} />
                            <div>
                                <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">Akses Penuh Administrator</h4>
                                <p className="text-xs text-emerald-600 dark:text-emerald-500 mt-1">Pengguna dengan peran Super Admin otomatis memiliki akses penuh ke seluruh modul sistem. Anda tidak perlu memilih hak akses secara manual.</p>
                            </div>
                        </div>
                    ) : (
                        <div>
                        <label className="form-label flex items-center gap-2 mb-3 text-gray-800 dark:text-gray-200">
                            <Shield size={16} className="text-theme-600" /> Hak Akses Tambahan (Permissions)
                        </label>
                        <div className="max-h-[350px] overflow-y-auto pr-2 space-y-4 custom-scrollbar">
                            {PERMISSION_GROUPS.map((group, idx) => {
                                const groupPerms = permissions.filter(p => group.permissions.includes(p.name));
                                if (groupPerms.length === 0) return null;

                                return (
                                    <div key={idx} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{group.title}</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {groupPerms.map(perm => {
                                                const isChecked = data.permissions.includes(perm.name);
                                                return (
                                                    <label key={perm.id} className={`flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${isChecked ? 'bg-white dark:bg-gray-800 border-theme-200 dark:border-theme-900/50 shadow-sm' : 'border-transparent hover:bg-gray-100 dark:hover:bg-gray-800'}`}>
                                                        <span className={`text-sm font-medium ${isChecked ? 'text-theme-700 dark:text-theme-400' : 'text-gray-600 dark:text-gray-400'}`}>
                                                            {PERMISSION_LABELS[perm.name] || perm.name}
                                                        </span>
                                                        <div className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer items-center justify-center rounded-full transition-colors duration-200 ease-in-out ${isChecked ? 'bg-theme-600' : 'bg-gray-200 dark:bg-gray-600'}`}>
                                                            <input
                                                                type="checkbox"
                                                                className="sr-only"
                                                                checked={isChecked}
                                                                onChange={(e) => {
                                                                    if (e.target.checked) {
                                                                        setData('permissions', [...data.permissions, perm.name]);
                                                                    } else {
                                                                        setData('permissions', data.permissions.filter(p => p !== perm.name));
                                                                    }
                                                                }}
                                                            />
                                                            <span aria-hidden="true" className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isChecked ? 'translate-x-2' : '-translate-x-2'}`} />
                                                        </div>
                                                    </label>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        {errors.permissions && <p className="form-error">{errors.permissions}</p>}
                    </div>
                    )}

                    {/* Selected permissions preview */}
                    {!data.roles.includes('super_admin') && data.permissions.length > 0 && (
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

            {/* Preview Modal */}
            <Modal isOpen={isPreviewOpen} onClose={() => setIsPreviewOpen(false)} title="Informasi Pengguna" size="md">
                {previewUser && (
                    <div className="p-6">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center flex-shrink-0 shadow-sm">
                                <span className="text-white font-bold text-2xl">
                                    {previewUser.name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{previewUser.name}</h3>
                                <p className="text-sm text-gray-500">{previewUser.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Peran (Role)</label>
                                <div className="flex flex-wrap gap-2">
                                    {previewUser.roles.length > 0 ? previewUser.roles.map(role => (
                                        <span key={role} className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[role] || 'bg-gray-100 text-gray-600'}`}>
                                            <Shield size={14} />
                                            {ROLE_LABELS[role] || role}
                                        </span>
                                    )) : (
                                        <span className="text-sm text-gray-400 italic">Belum ada peran</span>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Hak Akses Menu</label>
                                {previewUser.roles.includes('super_admin') ? (
                                    <div className="bg-emerald-50 text-emerald-700 p-3 rounded-lg text-sm flex items-center gap-2 font-medium">
                                        <Shield size={16} /> Akses Penuh (Administrator)
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                        {previewUser.permissions.length > 0 ? previewUser.permissions.map(p => (
                                            <span key={p} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 border border-gray-200 text-gray-700">
                                                {PERMISSION_LABELS[p] || p}
                                            </span>
                                        )) : (
                                            <span className="text-sm text-gray-400 italic">Tidak ada akses spesifik</span>
                                        )}
                                    </div>
                                )}
                            </div>
                            
                            <div>
                                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Terdaftar Sejak</label>
                                <p className="text-sm text-gray-700 font-medium">
                                    {new Date(previewUser.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(/\./g, ':')}
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end mt-8">
                            <button onClick={() => setIsPreviewOpen(false)} className="btn-secondary w-full sm:w-auto">Tutup</button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
