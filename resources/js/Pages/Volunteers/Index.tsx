import React, { useState } from 'react';
import { Head, Link, router, usePage, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatusBadge, Modal, formatDate, EmptyState } from '@/Components/Shared';
import { UserPlus, Eye, Check, X, Download, KeyRound } from 'lucide-react';

interface Volunteer {
    id: number;
    name: string;
    email: string;
    phone: string;
    skills: string;
    motivation: string;
    status: string;
    applied_date: string;
    job_category: string;
    job_type: string;
    id_card_path: string | null;
    address: string;
    birth_date: string;
    user_id: number | null;
    gender?: string;
    golongan_darah?: string;
    kesiapan_mobilisasi?: boolean;
    ukuran_baju?: string;
    emergency_contact?: string;
    emergency_phone?: string;
    regional_cabang?: string;
    pendidikan_terakhir?: string;
    jurusan?: string;
    status_keluarga?: string;
    agama?: string;
    jumlah_tanggungan?: string;
    review_notes?: string;
    reviewed_at?: string;
}

interface Props {
    volunteers: { data: Volunteer[]; meta: any };
    filters: { status: string };
}

export default function VolunteersIndex({ volunteers, filters }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [selectedVolunteer, setSelectedVolunteer] = useState<Volunteer | null>(null);
    const [resetPasswordVolunteer, setResetPasswordVolunteer] = useState<Volunteer | null>(null);

    const { data: pwData, setData: setPwData, post: postPw, processing: pwProcessing, errors: pwErrors, reset: resetPwForm } = useForm({
        password: '',
        password_confirmation: '',
    });

    const handleApprove = (id: number) => {
        if (confirm('Setujui relawan ini?')) {
            router.patch(`/volunteers/${id}/approve`, {}, {
                onSuccess: () => setSelectedVolunteer(null)
            });
        }
    };

    const handleReject = (id: number) => {
        if (confirm('Tolak relawan ini?')) {
            router.patch(`/volunteers/${id}/reject`, {}, {
                onSuccess: () => setSelectedVolunteer(null)
            });
        }
    };

    const handleCreateAccount = (id: number) => {
        if (confirm('Buat akun login (role relawan) untuk pengguna ini?')) {
            router.post(`/volunteers/${id}/create-account`, {}, {
                onSuccess: () => {
                    setSelectedVolunteer(null);
                }
            });
        }
    };

    const handleResetPassword = (e: React.FormEvent) => {
        e.preventDefault();
        if (!resetPasswordVolunteer) return;
        postPw(`/volunteers/${resetPasswordVolunteer.id}/reset-password`, {
            onSuccess: () => {
                setResetPasswordVolunteer(null);
                resetPwForm();
            }
        });
    };

    const tabs = [
        { label: 'Semua', value: '' },
        { label: 'Menunggu', value: 'pending' },
        { label: 'Disetujui', value: 'approved' },
        { label: 'Ditolak', value: 'rejected' }
    ];

    return (
        <AppLayout>
            <Head title="Manajemen Relawan" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Manajemen Relawan</h1>
                    <p className="page-subtitle">Kelola pendaftaran dan data relawan.</p>
                </div>
                <div className="flex gap-2">
                    <a 
                        href={`/volunteers/export${filters.status ? `?status=${filters.status}` : ''}`} 
                        className="btn-secondary"
                    >
                        <Download size={16} /> Unduh Data
                    </a>
                    <a href="/daftar-relawan" target="_blank" rel="noreferrer" className="btn-secondary">
                        <Eye size={16} /> Lihat Form Publik
                    </a>
                </div>
            </div>

            <div className="mb-6 border-b border-gray-200 dark:border-gray-800">
                <nav className="-mb-px flex space-x-8">
                    {tabs.map(tab => (
                        <Link
                            key={tab.value}
                            href={`/volunteers?status=${tab.value}`}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                (filters.status || '') === tab.value
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </Link>
                    ))}
                </nav>
            </div>

            <div className="card overflow-hidden">
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Nama</th>
                                <th>Kontak</th>
                                <th>Keahlian</th>
                                <th>Tgl Daftar</th>
                                <th>Status</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {volunteers.data.length > 0 ? volunteers.data.map(v => (
                                <tr key={v.id}>
                                    <td className="font-medium text-gray-900 dark:text-white">{v.name}</td>
                                    <td className="text-xs">
                                        <p>{v.phone}</p>
                                        <p className="text-gray-500">{v.email}</p>
                                    </td>
                                    <td className="text-sm truncate max-w-[200px]">{v.skills}</td>
                                    <td>{formatDate(v.applied_date)}</td>
                                    <td><StatusBadge status={v.status} /></td>
                                    <td className="text-right">
                                        <button onClick={() => setSelectedVolunteer(v)} className="btn-secondary py-1 px-2 text-xs">
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={<UserPlus />} title="Tidak ada data relawan" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={!!selectedVolunteer} onClose={() => setSelectedVolunteer(null)} title="Detail Relawan" size="lg">
                {selectedVolunteer && (
                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-500 mb-1">Nama Lengkap</p>
                                <p className="font-medium text-gray-900 dark:text-white">{selectedVolunteer.name}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Status</p>
                                <StatusBadge status={selectedVolunteer.status} />
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Jenis Kelamin</p>
                                <p className="font-medium">{selectedVolunteer.gender === 'L' ? 'Laki-laki' : selectedVolunteer.gender === 'P' ? 'Perempuan' : '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Tanggal Lahir</p>
                                <p className="font-medium">{formatDate(selectedVolunteer.birth_date)}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Email</p>
                                <p className="font-medium">{selectedVolunteer.email}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Telepon</p>
                                <p className="font-medium">{selectedVolunteer.phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Regional Cabang</p>
                                <p className="font-medium">{selectedVolunteer.regional_cabang || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Agama</p>
                                <p className="font-medium">{selectedVolunteer.agama || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Status Keluarga</p>
                                <p className="font-medium">{selectedVolunteer.status_keluarga || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Jumlah Tanggungan</p>
                                <p className="font-medium">{selectedVolunteer.jumlah_tanggungan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Pendidikan Terakhir</p>
                                <p className="font-medium">{selectedVolunteer.pendidikan_terakhir || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Jurusan</p>
                                <p className="font-medium">{selectedVolunteer.jurusan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Golongan Darah</p>
                                <p className="font-medium">{selectedVolunteer.golongan_darah || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Ukuran Baju</p>
                                <p className="font-medium">{selectedVolunteer.ukuran_baju || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Kesiapan Mobilisasi</p>
                                <p className="font-medium">{selectedVolunteer.kesiapan_mobilisasi ? 'Ya' : 'Tidak'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Kontak Darurat</p>
                                <p className="font-medium">{selectedVolunteer.emergency_contact || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Telepon Darurat</p>
                                <p className="font-medium">{selectedVolunteer.emergency_phone || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Kategori Pekerjaan</p>
                                <p className="font-medium">{selectedVolunteer.job_category || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Jenis Pekerjaan</p>
                                <p className="font-medium">{selectedVolunteer.job_type || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-1">Kartu Identitas</p>
                                {selectedVolunteer.id_card_path ? (
                                    <a href={selectedVolunteer.id_card_path} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1">
                                        <Eye size={14} /> Lihat Dokumen
                                    </a>
                                ) : (
                                    <p className="font-medium text-gray-400">Tidak ada</p>
                                )}
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-500 mb-1">Alamat</p>
                                <p className="font-medium">{selectedVolunteer.address || '-'}</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-100 dark:border-gray-800 pt-4 text-sm">
                            <p className="text-gray-500 mb-1">Keahlian / Pengalaman</p>
                            <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {selectedVolunteer.skills || '-'}
                            </p>
                        </div>
                        
                        <div className="text-sm">
                            <p className="text-gray-500 mb-1">Motivasi Bergabung</p>
                            <p className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                                {selectedVolunteer.motivation || '-'}
                            </p>
                        </div>

                        {selectedVolunteer.status === 'pending' && canEdit && (
                            <div className="flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800 pt-4">
                                <button onClick={() => handleReject(selectedVolunteer.id)} className="btn-danger">
                                    <X size={16} /> Tolak
                                </button>
                                <button onClick={() => handleApprove(selectedVolunteer.id)} className="btn-success">
                                    <Check size={16} /> Setujui
                                </button>
                            </div>
                        )}
                        {selectedVolunteer.status === 'approved' && !selectedVolunteer.user_id && selectedVolunteer.email && canEdit && (
                            <div className="flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800 pt-4">
                                <button onClick={() => handleCreateAccount(selectedVolunteer.id)} className="btn-primary bg-orange-600 hover:bg-orange-700 text-white">
                                    <UserPlus size={16} className="mr-1 inline" /> Buat Akun
                                </button>
                            </div>
                        )}
                        {selectedVolunteer.status === 'approved' && selectedVolunteer.user_id && canEdit && (
                            <div className="flex gap-3 justify-end border-t border-gray-100 dark:border-gray-800 pt-4">
                                <button
                                    onClick={() => { setSelectedVolunteer(null); resetPwForm(); setResetPasswordVolunteer(selectedVolunteer); }}
                                    className="btn-secondary flex items-center gap-2"
                                >
                                    <KeyRound size={16} /> Reset Password
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </Modal>

            {/* Reset Password Modal */}
            <Modal isOpen={!!resetPasswordVolunteer} onClose={() => { setResetPasswordVolunteer(null); resetPwForm(); }} title="Reset Password Relawan" size="sm">
                {resetPasswordVolunteer && (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div className="flex items-center gap-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl p-3 mb-2">
                            <KeyRound size={20} className="text-purple-600 flex-shrink-0" />
                            <div>
                                <p className="font-medium text-gray-900 dark:text-white text-sm">{resetPasswordVolunteer.name}</p>
                                <p className="text-xs text-gray-500">{resetPasswordVolunteer.email}</p>
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
                            <button type="button" onClick={() => { setResetPasswordVolunteer(null); resetPwForm(); }} className="btn-secondary">Batal</button>
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
