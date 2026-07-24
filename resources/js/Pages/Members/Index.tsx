import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatusBadge, Modal, SearchInput, formatDate, EmptyState, SensitiveDataField } from '@/Components/Shared';
import { Plus, Download, Edit, Trash2, Users, Eye, ToggleLeft, ToggleRight, KeyRound, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

interface Member {
    id: number;
    no_induk_anggota: string;
    nama_lengkap: string;
    email: string;
    no_whatsapp: string;
    photo_url: string | null;
    bagian_divisi?: string;
    join_date: string;
    status_aktif: boolean;
    gender?: string;
    alamat_domisili?: string;
    birth_date?: string;
    golongan_darah?: string;
    profesi_utama?: string;
    kesiapan_mobilisasi?: boolean;
    ukuran_baju?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    notes?: string;
    user_id?: number;
    regional_cabang?: string;
    pendidikan_terakhir?: string;
    jurusan?: string;
    status_keluarga?: string;
    agama?: string;
    jumlah_tanggungan?: string;
    is_pengurus?: boolean;
}

interface Props {
    members: { data: Member[]; links?: any[]; current_page?: number; last_page?: number; per_page?: number; total?: number; from?: number; to?: number };
    filters: { search: string; status_aktif: string; bagian_divisi: string; per_page?: string; sort_by?: string; sort_direction?: string; regional_cabang?: string; };
    stats?: {
        total: number;
        gender: Record<string, number>;
        profesi: Record<string, number>;
        golongan_darah: Record<string, number>;
        regional: Record<string, number>;
    };
    eligibleVolunteers?: any[];
}

export default function MembersIndex({ members, filters, stats, eligibleVolunteers = [] }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status_aktif || '');
    const [divisionFilter, setDivisionFilter] = useState(filters.bagian_divisi || '');
    const [perPage, setPerPage] = useState(filters.per_page || '10');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'nama_lengkap');
    const [sortDir, setSortDir] = useState(filters.sort_direction || 'asc');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [viewingMember, setViewingMember] = useState<Member | null>(null);
    const [resetPasswordMember, setResetPasswordMember] = useState<Member | null>(null);
    const [selectedVolunteerId, setSelectedVolunteerId] = useState<number | null>(null);

    const { data: pwData, setData: setPwData, post: postPw, processing: pwProcessing, errors: pwErrors, reset: resetPwForm } = useForm({
        password: '',
        password_confirmation: '',
    });

    const { data, setData, post, processing, errors, reset } = useForm({
        no_induk_anggota: '', nama_lengkap: '', gender: '', email: '', no_whatsapp: '', bagian_divisi: '',
        join_date: '', status_aktif: true, alamat_domisili: '', birth_date: '',
        golongan_darah: '', profesi_utama: '', kesiapan_mobilisasi: false, ukuran_baju: '',
        regional_cabang: '', pendidikan_terakhir: '', jurusan: '', status_keluarga: '', agama: '', jumlah_tanggungan: '',
        photo: null as File | null,
        volunteer_id: '' as string | number,
    });

    const handleSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/members', { search, status_aktif: statusFilter, bagian_divisi: divisionFilter, per_page: perPage, sort_by: sortBy, sort_direction: sortDir }, { preserveState: true });
    };

    const handleSort = (column: string) => {
        let newDir = 'asc';
        if (sortBy === column) {
            newDir = sortDir === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortDir(newDir);
        router.get('/members', { search, status_aktif: statusFilter, bagian_divisi: divisionFilter, per_page: perPage, sort_by: column, sort_direction: newDir }, { preserveState: true });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400 inline ml-1 opacity-50" />;
        return sortDir === 'asc' ? <ArrowUp size={14} className="text-theme-600 inline ml-1" /> : <ArrowDown size={14} className="text-theme-600 inline ml-1" />;
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        router.get('/members', { search, status_aktif: statusFilter, bagian_divisi: divisionFilter, per_page: value }, { preserveState: true });
    };

    const handleDelete = async (id: number) => {
        if (await confirmAction('Yakin ingin menghapus anggota ini?')) {
            router.delete(`/members/${id}`);
        }
    };

    const handleToggleStatus = async (member: Member) => {
        const isActive = member.status_aktif;
        const label = isActive ? 'menonaktifkan' : 'mengaktifkan';
        if (await confirmAction(`Yakin ingin ${label} keanggotaan ${member.nama_lengkap}?`)) {
            router.patch(`/members/${member.id}/toggle-status`);
        }
    };

    const handleSelectVolunteer = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        const volId = val ? Number(val) : null;
        setSelectedVolunteerId(volId);

        if (volId) {
            const vol = eligibleVolunteers.find((v: any) => v.id === volId);
            if (vol) {
                setData(prev => ({
                    ...prev,
                    nama_lengkap: vol.name || '',
                    gender: vol.gender || '',
                    email: vol.email || '',
                    no_whatsapp: vol.phone || '',
                    alamat_domisili: vol.address || '',
                    birth_date: vol.birth_date || '',
                    golongan_darah: vol.golongan_darah || '',
                    regional_cabang: vol.regional_cabang || '',
                    profesi_utama: vol.occupation || '',
                    kesiapan_mobilisasi: !!vol.kesiapan_mobilisasi,
                    ukuran_baju: vol.ukuran_baju || '',
                    pendidikan_terakhir: vol.pendidikan_terakhir || '',
                    jurusan: vol.jurusan || '',
                    status_keluarga: vol.status_keluarga || '',
                    agama: vol.agama || '',
                    jumlah_tanggungan: vol.jumlah_tanggungan || '',
                    volunteer_id: vol.id,
                }) as any);
            }
        } else {
            setData(prev => ({
                ...prev,
                nama_lengkap: '',
                gender: '',
                email: '',
                no_whatsapp: '',
                alamat_domisili: '',
                birth_date: '',
                golongan_darah: '',
                regional_cabang: '',
                profesi_utama: '',
                kesiapan_mobilisasi: false,
                ukuran_baju: '',
                pendidikan_terakhir: '',
                jurusan: '',
                status_keluarga: '',
                agama: '',
                jumlah_tanggungan: '',
                volunteer_id: '',
            }) as any);
        }
    };

    const handleEdit = (member: any) => {
        setSelectedVolunteerId(null);
        setData({
            no_induk_anggota: member.no_induk_anggota,
            nama_lengkap: member.nama_lengkap,
            gender: member.gender || '',
            email: member.email || '',
            no_whatsapp: member.no_whatsapp || '',
            bagian_divisi: member.bagian_divisi || '',
            join_date: member.join_date || '',
            status_aktif: member.status_aktif !== undefined ? member.status_aktif : true,
            alamat_domisili: member.alamat_domisili || '',
            birth_date: member.birth_date || '',
            golongan_darah: member.golongan_darah || '',
            profesi_utama: member.profesi_utama || '',
            kesiapan_mobilisasi: member.kesiapan_mobilisasi || false,
            ukuran_baju: member.ukuran_baju || '',
            regional_cabang: member.regional_cabang || '',
            pendidikan_terakhir: member.pendidikan_terakhir || '',
            jurusan: member.jurusan || '',
            status_keluarga: member.status_keluarga || '',
            agama: member.agama || '',
            jumlah_tanggungan: member.jumlah_tanggungan || '',
            photo: null,
            volunteer_id: '',
            _method: 'put'
        } as any);
        setEditingId(member.id);
        setIsAddModalOpen(true);
    };

    const handleOpenAdd = () => {
        reset();
        setSelectedVolunteerId(null);
        setData({
            no_induk_anggota: '', nama_lengkap: '', gender: '', email: '', no_whatsapp: '', bagian_divisi: '',
            join_date: '', status_aktif: true, alamat_domisili: '', birth_date: '',
            golongan_darah: '', profesi_utama: '', kesiapan_mobilisasi: false, ukuran_baju: '',
            regional_cabang: '', pendidikan_terakhir: '', jurusan: '', status_keluarga: '', agama: '', jumlah_tanggungan: '',
            photo: null,
            volunteer_id: '',
            _method: 'post'
        } as any);
        setEditingId(null);
        setIsAddModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setEditingId(null);
                reset();
                setSelectedVolunteerId(null);
            }
        };

        if (editingId) {
            post(`/members/${editingId}`, options);
        } else {
            post('/members', options);
        }
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetPasswordMember) return;
        postPw(`/members/${resetPasswordMember.id}/reset-password`, {
            onSuccess: () => {
                setResetPasswordMember(null);
                resetPwForm();
            }
        });
    };

    return (
        <AppLayout>
            <Head title="Data Anggota" />

            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {filters?.regional_cabang && (props.organization as any)?.regional_logos_url?.[filters.regional_cabang] && (
                        <img 
                            src={(props.organization as any).regional_logos_url[filters.regional_cabang]} 
                            alt={filters.regional_cabang} 
                            className="w-14 h-14 object-contain drop-shadow-sm"
                        />
                    )}
                    <div>
                        <h1 className="page-title">Data Anggota {filters?.regional_cabang ? `- ${filters.regional_cabang}` : ''}</h1>
                        <p className="page-subtitle">Kelola data anggota BSMI {filters?.regional_cabang || 'seluruh cabang'}.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <a href="/members/export" className="btn-secondary">
                        <Download size={16} /> Export Excel
                    </a>
                    {canEdit && (
                        <button onClick={handleOpenAdd} className="btn-primary">
                            <Plus size={16} /> Tambah Anggota
                        </button>
                    )}
                </div>
            </div>

            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                    {/* Total Members */}
                    <div className="card !p-4 bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100 border border-red-100 dark:border-red-900/30 flex flex-col justify-center">
                        <h3 className="text-sm text-red-700 dark:text-red-400 font-medium mb-1">Total Anggota</h3>
                        <p className="text-3xl font-extrabold text-red-600 dark:text-red-400">{stats.total}</p>
                        <div className="mt-2 text-xs text-red-500 dark:text-red-400">Anggota Terdaftar</div>
                    </div>

                    {/* Jenis Kelamin */}
                    <div className="card !p-4">
                        <h3 className="text-sm text-gray-500 font-medium mb-3">Jenis Kelamin</h3>
                        <div className="flex flex-col gap-2 mt-1">
                            <div className="flex justify-between items-center text-sm border-b pb-2">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div> Laki-Laki</span>
                                <span className="font-bold">{stats.gender['L'] || 0}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-pink-500"></div> Perempuan</span>
                                <span className="font-bold">{stats.gender['P'] || 0}</span>
                            </div>
                        </div>
                    </div>

                    {/* Regional */}
                    <div className="card !p-4">
                        <h3 className="text-sm text-gray-500 font-medium mb-3">Regional Cabang</h3>
                        <div className="space-y-2 overflow-y-auto max-h-24 pr-1 scrollbar-thin">
                            {Object.keys(stats.regional).length === 0 && <p className="text-xs text-gray-400">Belum ada data</p>}
                            {Object.entries(stats.regional).sort(([,a], [,b]) => Number(b) - Number(a)).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-sm">
                                    <span className="truncate max-w-[120px]" title={key}>{key}</span>
                                    <span className="font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{val as React.ReactNode}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Profesi */}
                    <div className="card !p-4">
                        <h3 className="text-sm text-gray-500 font-medium mb-3">Profesi Utama</h3>
                        <div className="space-y-2 overflow-y-auto max-h-24 pr-1 scrollbar-thin">
                            {Object.keys(stats.profesi).length === 0 && <p className="text-xs text-gray-400">Belum ada data</p>}
                            {Object.entries(stats.profesi).sort(([,a], [,b]) => Number(b) - Number(a)).map(([key, val]) => (
                                <div key={key} className="flex justify-between items-center text-sm">
                                    <span className="truncate max-w-[120px]" title={key}>{key}</span>
                                    <span className="font-bold bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded text-xs">{val as React.ReactNode}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Golongan Darah */}
                    <div className="card !p-4">
                        <h3 className="text-sm text-gray-500 font-medium mb-3">Golongan Darah</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {['A', 'B', 'AB', 'O'].map(bg => (
                                <div key={bg} className="bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 px-2 py-1.5 rounded-lg border border-red-100 dark:border-red-900/30 flex justify-between items-center">
                                    <span className="font-bold text-sm">{bg}</span>
                                    <span className="text-xs font-semibold">{stats.golongan_darah[bg] || 0}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama atau nomor anggota..." />
                        </div>
                        <select className="form-input sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">Semua Status</option>
                            <option value="active">Aktif</option>
                            <option value="inactive">Tidak Aktif</option>
                        </select>
                        <select className="form-input sm:w-48" value={divisionFilter} onChange={e => setDivisionFilter(e.target.value)}>
                            <option value="">Semua Bagian/Divisi</option>
                            <option value="Medis & Kesehatan">Medis & Kesehatan</option>
                            <option value="Logistik">Logistik</option>
                            <option value="Humas">Humas</option>
                            <option value="Pendidikan">Pendidikan</option>
                            <option value="Dana">Dana</option>
                            <option value="Lainnya">Lainnya</option>
                        </select>
                        <button type="submit" className="btn-secondary">Filter</button>
                    </form>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No</th>
                                <th onClick={() => handleSort('nama_lengkap')} className="cursor-pointer hover:bg-gray-100 transition-colors">Anggota <SortIcon column="nama_lengkap" /></th>
                                <th onClick={() => handleSort('bagian_divisi')} className="cursor-pointer hover:bg-gray-100 transition-colors">Bagian/Divisi <SortIcon column="bagian_divisi" /></th>
                                <th>Kontak</th>
                                <th onClick={() => handleSort('join_date')} className="cursor-pointer hover:bg-gray-100 transition-colors">Bergabung <SortIcon column="join_date" /></th>
                                <th className="text-center">Status Pengurus</th>
                                <th onClick={() => handleSort('status_aktif')} className="cursor-pointer hover:bg-gray-100 transition-colors">Status Anggota <SortIcon column="status_aktif" /></th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {members.data.length > 0 ? members.data.map((member, i) => (
                                <tr key={member.id}>
                                    <td>{(members.from || 1) + i}</td>
                                    <td>
                                        <div className="flex items-center gap-3">
                                            <img src={member.photo_url || (member.gender === 'P' ? '/images/avatars/female.png' : '/images/avatars/male.png')} alt="" className="w-8 h-8 rounded-full bg-gray-100 object-cover" />
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-white">{member.nama_lengkap}</p>
                                                <p className="text-xs text-gray-500">{member.no_induk_anggota}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{member.bagian_divisi || '-'}</td>
                                    <td>
                                        <div className="text-xs">
                                            <p>{member.no_whatsapp || '-'}</p>
                                            <p className="text-gray-500">{member.email || '-'}</p>
                                        </div>
                                    </td>
                                    <td>{formatDate(member.join_date)}</td>
                                    <td className="text-center">
                                        {member.is_pengurus ? (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                Ya
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">
                                                Tidak
                                            </span>
                                        )}
                                    </td>
                                    <td><StatusBadge status={member.status_aktif ? 'active' : 'inactive'} /></td>
                                    <td className="text-right space-x-2">
                                        {!member.user_id && canEdit && (
                                            <button
                                                onClick={async () => {
                                                    if (!member.status_aktif) {
                                                        alert("Untuk membuat akun, pilih Anggota dengan status Aktif.");
                                                        return;
                                                    }
                                                    if (await confirmAction(`Buat akun login untuk ${member.nama_lengkap}? Password akan di-generate otomatis.`)) {
                                                        router.post(`/members/${member.id}/create-account`);
                                                    }
                                                }}
                                                className="text-orange-500 hover:text-orange-700 font-medium text-xs px-2 py-1 rounded bg-orange-50 border border-orange-100"
                                                title="Buat Akun Login"
                                            >
                                                Buat Akun
                                            </button>
                                        )}
                                        {member.user_id && canEdit && (
                                            <button
                                                onClick={() => { resetPwForm(); setResetPasswordMember(member); }}
                                                className="text-purple-500 hover:text-purple-700"
                                                title="Reset Password"
                                            >
                                                <KeyRound size={16} />
                                            </button>
                                        )}
                                        <button onClick={() => setViewingMember(member as any)} className="text-green-600 hover:text-green-800" title="Detail"><Eye size={16} /></button>
                                        {canEdit && (
                                            <>
                                                <button
                                                    onClick={() => handleToggleStatus(member as any)}
                                                    title={member.status_aktif ? 'Nonaktifkan' : 'Aktifkan'}
                                                    className={member.status_aktif ? 'text-green-500 hover:text-green-700' : 'text-gray-400 hover:text-green-600'}
                                                >
                                                    {member.status_aktif ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                                                </button>
                                                <button onClick={() => handleEdit(member)} className="text-blue-600 hover:text-blue-800" title="Edit"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800" title="Hapus"><Trash2 size={16} /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState icon={<Users />} title="Belum ada data anggota" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Tampilkan</span>
                        <select
                            className="form-input !py-1.5 !px-2 !w-20 text-sm"
                            value={perPage}
                            onChange={e => handlePerPageChange(e.target.value)}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="all">Semua</option>
                        </select>
                        <span>data per halaman</span>
                        {members.total !== undefined && (
                            <span className="text-gray-400">• Total: <strong className="text-gray-600 dark:text-gray-300">{members.total}</strong> anggota</span>
                        )}
                    </div>

                    {members.links && members.last_page && members.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-3 sm:mt-0">
                            {members.links.map((link: any, idx: number) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                                        link.active
                                            ? 'bg-theme-600 text-white font-bold'
                                            : link.url
                                                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingId ? "Edit Anggota" : "Tambah Anggota"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {!editingId && eligibleVolunteers && eligibleVolunteers.length > 0 && (
                            <div className="col-span-2">
                                <label className="form-label font-semibold text-amber-900 dark:text-amber-300">Pilih dari Relawan Lulus Diklatsar</label>
                                <select 
                                    className="form-input bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/30 text-amber-900 dark:text-amber-100"
                                    onChange={handleSelectVolunteer}
                                    value={selectedVolunteerId || ''}
                                >
                                    <option value="">-- Pilih Nama Relawan --</option>
                                    {eligibleVolunteers.map((v: any) => (
                                        <option key={v.id} value={v.id}>
                                            {v.name} ({v.email})
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                    Memilih relawan akan mengisi otomatis data di bawah ini berdasarkan form pendaftaran mereka.
                                </p>
                            </div>
                        )}
                        {!editingId && (!eligibleVolunteers || eligibleVolunteers.length === 0) && (
                            <div className="col-span-2 bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-850 rounded-xl p-3 text-xs text-slate-500">
                                Info: Saat ini tidak ada data Relawan Baru yang Aktif dan Lulus Diklatsar untuk didaftarkan sebagai anggota.
                            </div>
                        )}

                        <div>
                            <label className="form-label">No Induk Anggota</label>
                            <input type="text" className="form-input" value={data.no_induk_anggota} onChange={e => setData('no_induk_anggota', e.target.value)} required />
                            {errors.no_induk_anggota && <p className="form-error">{errors.no_induk_anggota}</p>}
                        </div>
                        <div>
                            <label className="form-label">Nama Lengkap</label>
                            <input type="text" className="form-input" value={data.nama_lengkap} onChange={e => setData('nama_lengkap', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Jenis Kelamin</label>
                            <select className="form-input" value={data.gender} onChange={e => setData('gender', e.target.value)}>
                                <option value="">Pilih...</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Tanggal Lahir</label>
                            <input type="date" className="form-input" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Email</label>
                            <input type="email" className="form-input" value={data.email} onChange={e => setData('email', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">No WhatsApp</label>
                            <input type="text" className="form-input" value={data.no_whatsapp} onChange={e => setData('no_whatsapp', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Alamat Domisili</label>
                            <textarea className="form-input" value={data.alamat_domisili} onChange={e => setData('alamat_domisili', e.target.value)} rows={2} />
                        </div>
                        <div>
                            <label className="form-label">Bagian/Divisi</label>
                            <select className="form-input" value={data.bagian_divisi} onChange={e => setData('bagian_divisi', e.target.value)}>
                                <option value="">Pilih Bagian/Divisi...</option>
                                <option value="Medis & Kesehatan">Medis & Kesehatan</option>
                                <option value="Logistik">Logistik</option>
                                <option value="Humas">Humas</option>
                                <option value="Pendidikan">Pendidikan</option>
                                <option value="Dana">Dana</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Regional Cabang</label>
                            <select className="form-input" value={data.regional_cabang} onChange={e => setData('regional_cabang', e.target.value)}>
                                <option value="">Pilih Regional...</option>
                                <option value="BSMI Kabupaten Serang">BSMI Kabupaten Serang</option>
                                <option value="BSMI Kota Serang">BSMI Kota Serang</option>
                                <option value="BSMI Kabupaten Tangerang">BSMI Kabupaten Tangerang</option>
                                <option value="BSMI Kota Tangerang">BSMI Kota Tangerang</option>
                                <option value="BSMI Kota Cilegon">BSMI Kota Cilegon</option>
                                <option value="BSMI Lebak">BSMI Lebak</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Tanggal Bergabung</label>
                            <input type="date" className="form-input" value={data.join_date} onChange={e => setData('join_date', e.target.value)} />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Profesi Utama</label>
                                <select className="form-input" value={data.profesi_utama} onChange={e => setData('profesi_utama', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                                    <option value="Guru/Dosen">Guru/Dosen</option>
                                    <option value="Tenaga Medis">Tenaga Medis</option>
                                    <option value="PNS/TNI/Polri">PNS/TNI/Polri</option>
                                    <option value="Pegawai Swasta">Pegawai BUMN/Swasta</option>
                                    <option value="Wiraswasta/Pengusaha">Wiraswasta/Pengusaha</option>
                                    <option value="Pekerja Bebas/Freelance">Pekerja Bebas/Freelance</option>
                                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Golongan Darah</label>
                                <select className="form-input" value={data.golongan_darah} onChange={e => setData('golongan_darah', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Kesiapan Mobilisasi</label>
                                <select className="form-input" value={data.kesiapan_mobilisasi ? '1' : '0'} onChange={e => setData('kesiapan_mobilisasi', e.target.value === '1')}>
                                    <option value="0">Tidak</option>
                                    <option value="1">Ya</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Ukuran Baju</label>
                                <select className="form-input" value={data.ukuran_baju} onChange={e => setData('ukuran_baju', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="3XL">3XL</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4 border-t border-gray-100 dark:border-gray-800 pt-4">
                            <div>
                                <label className="form-label">Pendidikan Terakhir</label>
                                <select className="form-input" value={data.pendidikan_terakhir} onChange={e => setData('pendidikan_terakhir', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="SMA/SMK Sederajat">SMA/SMK Sederajat</option>
                                    <option value="D1">D1</option>
                                    <option value="D2">D2</option>
                                    <option value="D3">D3</option>
                                    <option value="D4">D4</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Jurusan</label>
                                <input type="text" className="form-input" value={data.jurusan} onChange={e => setData('jurusan', e.target.value)} placeholder="Jurusan Pendidikan..." />
                            </div>
                            <div>
                                <label className="form-label">Status Keluarga</label>
                                <select className="form-input" value={data.status_keluarga} onChange={e => setData('status_keluarga', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="Belum Menikah">Belum Menikah</option>
                                    <option value="Menikah">Menikah</option>
                                    <option value="Cerai Hidup">Cerai Hidup</option>
                                    <option value="Cerai Mati">Cerai Mati</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Agama</label>
                                <select className="form-input" value={data.agama} onChange={e => setData('agama', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Protestan">Protestan</option>
                                    <option value="Katolik">Katolik</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Buddha">Buddha</option>
                                    <option value="Khonghucu">Khonghucu</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Jumlah Tanggungan</label>
                                <select className="form-input" value={data.jumlah_tanggungan} onChange={e => setData('jumlah_tanggungan', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="TK">TK0</option>
                                    <option value="K1">K1</option>
                                    <option value="K2">K2</option>
                                    <option value="K3">K3</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Foto Anggota (Opsional)</label>
                            <input type="file" className="form-input" accept="image/*" onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)} />
                            <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG. Maks 2MB.</p>
                            {errors.photo && <p className="form-error">{errors.photo}</p>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>Simpan</button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={!!viewingMember} onClose={() => setViewingMember(null)} title="Detail Anggota">
                {viewingMember && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <img src={viewingMember.photo_url || (viewingMember.gender === 'P' ? '/images/avatars/female.png' : '/images/avatars/male.png')} alt="Photo" className="w-20 h-20 rounded-full object-cover border border-gray-200" />
                            <div>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{viewingMember.nama_lengkap}</h3>
                                <p className="text-gray-500 font-medium">{viewingMember.no_induk_anggota}</p>
                                <div className="mt-2">
                                    <StatusBadge status={viewingMember.status_aktif ? 'active' : 'inactive'} />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Bagian/Divisi</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.bagian_divisi || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Regional Cabang</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.regional_cabang || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Bergabung Sejak</p>
                                <p className="font-medium text-gray-900 dark:text-white">{formatDate(viewingMember.join_date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Email</p>
                                <SensitiveDataField value={viewingMember.email} />
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">No. WhatsApp</p>
                                <SensitiveDataField value={viewingMember.no_whatsapp} />
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Profesi Utama</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.profesi_utama || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Pendidikan Terakhir</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.pendidikan_terakhir || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Jurusan</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.jurusan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Status Keluarga</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.status_keluarga || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Agama</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.agama || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Jumlah Tanggungan</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.jumlah_tanggungan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Golongan Darah</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.golongan_darah || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Kesiapan Mobilisasi</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.kesiapan_mobilisasi ? 'Ya' : 'Tidak'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Ukuran Baju</p>
                                <p className="font-medium text-gray-900 dark:text-white">{viewingMember.ukuran_baju || '-'}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                            <button onClick={() => setViewingMember(null)} className="btn-secondary">Tutup</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={!!resetPasswordMember} onClose={() => { setResetPasswordMember(null); resetPwForm(); }} title="Reset Password Anggota" size="sm">
                {resetPasswordMember && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-2">
                            <KeyRound size={20} className="text-purple-600 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{resetPasswordMember.nama_lengkap}</p>
                                <p className="text-xs text-gray-500">{resetPasswordMember.email}</p>
                            </div>
                        </div>
                        <div>
                            <label className="form-label">Password Baru <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Min. 6 karakter"
                                value={pwData.password}
                                onChange={e => setPwData('password', e.target.value)}
                                required
                            />
                            {pwErrors.password && <p className="text-red-500 text-xs mt-1">{pwErrors.password}</p>}
                        </div>
                        <div>
                            <label className="form-label">Konfirmasi Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                className="form-input"
                                placeholder="Ulangi password baru"
                                value={pwData.password_confirmation}
                                onChange={e => setPwData('password_confirmation', e.target.value)}
                                required
                            />
                            {pwErrors.password_confirmation && <p className="text-red-500 text-xs mt-1">{pwErrors.password_confirmation}</p>}
                        </div>
                        <div className="flex gap-3 justify-end pt-2">
                            <button type="button" onClick={() => { setResetPasswordMember(null); resetPwForm(); }} className="btn-secondary">Batal</button>
                            <button type="submit" disabled={pwProcessing} className="btn-primary bg-purple-600 hover:bg-purple-700">
                                {pwProcessing ? 'Menyimpan...' : 'Simpan Password'}
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </AppLayout>
    );
}
