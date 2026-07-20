import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, Edit, Trash2, UserCog, CheckCircle, XCircle } from 'lucide-react';

interface Executive {
    id: number;
    member_id: number;
    member_name?: string;
    nama_lengkap: string;
    jabatan: string;
    bagian_divisi: string;
    periode_mulai: string;
    periode_selesai: string;
    status_aktif: boolean;
    profesi_utama?: string;
    golongan_darah?: string;
    kesiapan_mobilisasi?: boolean;
    ukuran_baju?: string;
    photo_url: string;
}

interface Props {
    executives: { data: Executive[]; meta?: any };
    members: { id: number; nama_lengkap: string; no_induk_anggota: string }[];
}

export default function ExecutivesIndex({ executives, members = [] }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '', nama_lengkap: '', jabatan: '', bagian_divisi: '', periode_mulai: '', periode_selesai: '', status_aktif: true, profesi_utama: '', golongan_darah: '', kesiapan_mobilisasi: false, ukuran_baju: '', photo: null as File | null
    });

    const handleEdit = (exec: any) => {
        setData({
            member_id: exec.member_id || '',
            nama_lengkap: exec.member_name || exec.nama_lengkap || '',
            jabatan: exec.jabatan || '',
            bagian_divisi: exec.bagian_divisi || '',
            periode_mulai: exec.periode_mulai || '',
            periode_selesai: exec.periode_selesai || '',
            status_aktif: exec.status_aktif,
            profesi_utama: exec.profesi_utama || '',
            golongan_darah: exec.golongan_darah || '',
            kesiapan_mobilisasi: exec.kesiapan_mobilisasi || false,
            ukuran_baju: exec.ukuran_baju || '',
            photo: null,
            _method: 'put'
        } as any);
        setEditingId(exec.id);
        setIsAddModalOpen(true);
    };

    const handleOpenAdd = () => {
        reset();
        setData('_method' as any, 'post');
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
            }
        };

        if (editingId) {
            post(`/executives/${editingId}`, options);
        } else {
            post('/executives', options);
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data pengurus ini?')) {
            router.delete(`/executives/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Data Pengurus" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Data Pengurus</h1>
                    <p className="page-subtitle">Struktur kepengurusan BSMI.</p>
                </div>
                {canEdit && (
                    <button onClick={handleOpenAdd} className="btn-primary">
                        <Plus size={16} /> Tambah Pengurus
                    </button>
                )}
            </div>

            {executives.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {executives.data.map(exec => (
                        <div key={exec.id} className="card relative overflow-hidden group">
                            {/* Status border at top */}
                            <div className={`h-2 w-full absolute top-0 left-0 ${exec.status_aktif ? 'bg-red-600' : 'bg-gray-400'}`}></div>
                            
                            <div className="p-6 pt-8 text-center flex flex-col items-center">
                                <div className="relative mb-4">
                                    <img src={exec.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(exec.member_name || exec.nama_lengkap)}&background=fecaca&color=b91c1c`} alt={exec.member_name || exec.nama_lengkap} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                    {exec.status_aktif ? (
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5" title="Aktif">
                                            <CheckCircle size={20} className="text-green-500 bg-white rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5" title="Non-aktif">
                                            <XCircle size={20} className="text-gray-400 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{exec.member_name || exec.nama_lengkap}</h3>
                                <p className="text-red-600 font-medium text-sm mb-1">{exec.jabatan}</p>
                                <p className="text-xs text-gray-500 mb-4">{exec.bagian_divisi || '-'}</p>
                                
                                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-auto">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Masa Bakti</p>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        {formatDate(exec.periode_mulai)} - {exec.periode_selesai ? formatDate(exec.periode_selesai) : 'Sekarang'}
                                    </p>
                                </div>

                                {canEdit && (
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1">
                                        <button onClick={() => handleEdit(exec)} className="p-1.5 bg-white shadow-sm rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(exec.id)} className="p-1.5 bg-white shadow-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <EmptyState icon={<UserCog />} title="Belum ada data pengurus" />
                </div>
            )}

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingId ? "Edit Pengurus" : "Tambah Pengurus"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            Ada kesalahan input:
                            <ul className="list-disc ml-5 mt-1">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Anggota</label>
                            <select className="form-input" value={data.member_id} onChange={e => {
                                const selectedId = e.target.value;
                                const selectedMember = members.find(m => m.id.toString() === selectedId);
                                setData(data => ({ ...data, member_id: selectedId, nama_lengkap: selectedMember ? selectedMember.nama_lengkap : '' }));
                            }} required>
                                <option value="">Pilih Anggota...</option>
                                {members.map(m => (
                                    <option key={m.id} value={m.id}>{m.nama_lengkap} ({m.no_induk_anggota})</option>
                                ))}
                            </select>
                            {errors.nama_lengkap && <p className="text-red-500 text-xs mt-1">{errors.nama_lengkap}</p>}
                            {errors.member_id && <p className="text-red-500 text-xs mt-1">{errors.member_id}</p>}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="form-label">Jabatan (cth: Ketua Umum)</label>
                            <input type="text" className="form-input" value={data.jabatan} onChange={e => setData('jabatan', e.target.value)} required />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="form-label">Bagian/Divisi</label>
                            <input type="text" className="form-input" value={data.bagian_divisi} onChange={e => setData('bagian_divisi', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Periode Mulai</label>
                            <input type="date" className="form-input" value={data.periode_mulai} onChange={e => setData('periode_mulai', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Periode Selesai</label>
                            <input type="date" className="form-input" value={data.periode_selesai} onChange={e => setData('periode_selesai', e.target.value)} />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Profesi Utama</label>
                                <input type="text" className="form-input" value={data.profesi_utama} onChange={e => setData('profesi_utama', e.target.value)} />
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
                        <div className="col-span-2">
                            <label className="form-label">Foto Pengurus</label>
                            <input type="file" className="form-input" accept="image/*" onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)} />
                            {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                        </div>
                        <div className="col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" id="status_aktif" className="rounded border-gray-300 text-red-600 focus:ring-red-500" checked={data.status_aktif} onChange={e => setData('status_aktif', e.target.checked)} />
                            <label htmlFor="status_aktif" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Pengurus Aktif Saat Ini</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>Simpan</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
