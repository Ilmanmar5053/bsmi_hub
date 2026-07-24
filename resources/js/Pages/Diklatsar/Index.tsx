import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, GraduationCap, CheckCircle2, Circle, ArrowRight, Printer, Settings, Edit, X, Save, FileBadge, Eye } from 'lucide-react';
import { Modal, EmptyState } from '@/Components/Shared';
import { confirmAction } from '@/Utils/swal';

interface Volunteer {
    id: number;
    name: string;
    email: string;
    phone: string;
    job_category: string;
    job_type: string;
    diklatsar_stage: number;
    applied_date: string;
    photo_url?: string;
}

interface DiklatsarModule {
    id: number;
    stage_number: number;
    title: string;
    description: string;
    schedule: string;
    speaker: string;
}

interface Props {
    volunteers: { data: Volunteer[]; meta: any };
    filters: { search: string };
    modules: DiklatsarModule[];
    certificateSetting: any;
    signatoryCandidates: string[];
}

const STAGES = [
    'Belum Mulai',
    'Materi 1',
    'Materi 2',
    'Materi 3',
    'Materi 4',
    'Materi 5',
    'Lulus / Pelantikan'
];

export default function DiklatsarIndex({ volunteers, filters, modules, signatoryCandidates }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const maskData = (text: string, type: 'name' | 'phone' | 'email', emailOwner: string) => {
        if (canEdit || props.auth?.user?.email === emailOwner || !text) return text;
        if (type === 'name') {
            if (text.length <= 2) return '*'.repeat(text.length);
            return text[0] + '*'.repeat(text.length - 2) + text[text.length - 1];
        }
        if (type === 'phone') {
            if (text.length <= 4) return '*'.repeat(text.length);
            return text.substring(0, 4) + '*'.repeat(text.length - 6) + text.substring(text.length - 2);
        }
        if (type === 'email') {
            const parts = text.split('@');
            if (parts.length !== 2) return text;
            const namePart = parts[0];
            const maskedName = namePart.length > 2 ? namePart[0] + '*'.repeat(namePart.length - 2) + namePart[namePart.length - 1] : '*'.repeat(namePart.length);
            return `${maskedName}@${parts[1]}`;
        }
        return text;
    };

    const [search, setSearch] = useState(filters.search || '');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isCertSettingsOpen, setIsCertSettingsOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<DiklatsarModule | null>(null);
    const [formData, setFormData] = useState({ title: '', description: '', schedule: '', speaker: '' });

    const [certFormData, setCertFormData] = useState({
        certificate_number: props.certificateSetting?.certificate_number || '',
        role_text: props.certificateSetting?.role_text || 'Peserta',
        description_text: props.certificateSetting?.description_text || '',
        year_text: props.certificateSetting?.year_text || '',
        organizer: props.certificateSetting?.organizer || '',
        location: props.certificateSetting?.location || '',
        day_text: props.certificateSetting?.day_text || '',
        date_text: props.certificateSetting?.date_text || '',
        signature_1_name: props.certificateSetting?.signature_1_name || '',
        signature_1_title: props.certificateSetting?.signature_1_title || '',
        signature_2_name: props.certificateSetting?.signature_2_name || '',
        signature_2_title: props.certificateSetting?.signature_2_title || '',
        signature_1_image: null as File | null,
        signature_2_image: null as File | null
    });

    const [selectedVolunteers, setSelectedVolunteers] = useState<number[]>([]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/diklatsar', { search }, { preserveState: true });
    };

    const handleAdvance = async (volunteer: Volunteer) => {
        if (await confirmAction(`Proses ${volunteer.name} ke tahap ${STAGES[volunteer.diklatsar_stage + 1]}?`)) {
            router.patch(`/diklatsar/${volunteer.id}/advance`);
        }
    };

    const handleBulkAdvance = async () => {
        if (selectedVolunteers.length === 0) return;
        if (await confirmAction(`Proses kenaikan tahap untuk ${selectedVolunteers.length} relawan yang dipilih?`)) {
            router.post('/diklatsar/bulk-advance', { volunteer_ids: selectedVolunteers }, {
                onSuccess: () => setSelectedVolunteers([])
            });
        }
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const ids = volunteers.data.filter(v => v.diklatsar_stage < 6).map(v => v.id);
            setSelectedVolunteers(ids);
        } else {
            setSelectedVolunteers([]);
        }
    };

    const toggleSelect = (id: number) => {
        setSelectedVolunteers(prev => 
            prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
        );
    };

    const openEdit = (mod: DiklatsarModule) => {
        setEditingModule(mod);
        setFormData({
            title: mod.title || '',
            description: mod.description || '',
            schedule: mod.schedule || '',
            speaker: mod.speaker || ''
        });
    };

    const handleSaveModule = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingModule) return;
        router.patch(`/diklatsar/modules/${editingModule.id}`, formData, {
            onSuccess: () => setEditingModule(null)
        });
    };

    const handleSaveCertSetting = (e: React.FormEvent) => {
        e.preventDefault();
        router.post('/diklatsar/certificate-setting', {
            ...certFormData,
            _method: 'put',
        }, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setIsCertSettingsOpen(false)
        });
    };

    return (
        <AppLayout>
            <Head title="Pendidikan & Latihan Dasar (Diklatsar)" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Pendidikan & Latihan Dasar Relawan BSMI</h1>
                    <p className="page-subtitle">Pantau progres pendidikan relawan yang telah disetujui.</p>
                </div>
                {canEdit && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsCertSettingsOpen(true)} className="btn-secondary">
                            <FileBadge size={16} /> Template Sertifikat
                        </button>
                        <button onClick={() => setIsSettingsOpen(true)} className="btn-secondary">
                            <Settings size={16} /> Pengaturan Materi
                        </button>
                    </div>
                )}
            </div>

            <div className="card mb-6">
                <div className="card-header flex justify-between items-center flex-wrap gap-4">
                    <form onSubmit={handleSearch} className="flex gap-2">
                        <div className="relative">
                            <input
                                type="text"
                                className="form-input pl-10 pr-4 py-2 w-64"
                                placeholder="Cari nama/email..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <button type="submit" className="btn-secondary">Cari</button>
                    </form>
                    
                    {canEdit && selectedVolunteers.length > 0 && (
                        <button onClick={handleBulkAdvance} className="btn-primary animate-fade-in-up">
                            Proses Kenaikan Tahap ({selectedVolunteers.length})
                        </button>
                    )}
                </div>

                <div className="p-0 border-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    {canEdit && (
                                        <th className="px-6 py-4 w-10">
                                            <input 
                                                type="checkbox" 
                                                className="rounded border-gray-300 text-theme-600 focus:ring-theme-500 cursor-pointer"
                                                onChange={toggleSelectAll}
                                                checked={volunteers.data.filter(v => v.diklatsar_stage < 6).length > 0 && selectedVolunteers.length === volunteers.data.filter(v => v.diklatsar_stage < 6).length}
                                            />
                                        </th>
                                    )}
                                    <th className="px-6 py-4">Relawan</th>
                                    <th className="px-6 py-4 min-w-[500px]">Progres Diklatsar</th>
                                    <th className="px-6 py-4 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {volunteers.data.length > 0 ? volunteers.data.map((v) => (
                                    <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                                        {canEdit && (
                                            <td className="px-6 py-4">
                                                {v.diklatsar_stage < 6 ? (
                                                    <input 
                                                        type="checkbox" 
                                                        className="rounded border-gray-300 text-theme-600 focus:ring-theme-500 cursor-pointer"
                                                        checked={selectedVolunteers.includes(v.id)}
                                                        onChange={() => toggleSelect(v.id)}
                                                    />
                                                ) : null}
                                            </td>
                                        )}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                {v.photo_url && (
                                                    <img src={v.photo_url} alt="" className="w-10 h-10 rounded-full bg-gray-100 object-cover" />
                                                )}
                                                <div>
                                                    <div className="font-medium text-gray-900 dark:text-white">{maskData(v.name, 'name', v.email)}</div>
                                                    <div className="text-gray-500 text-xs">{maskData(v.email, 'email', v.email)} • {maskData(v.phone, 'phone', v.email)}</div>
                                                    <div className="text-gray-400 text-xs mt-1">{v.job_category} - {v.job_type}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-1.5 w-full">
                                                {STAGES.map((stage, idx) => {
                                                    const isCompleted = idx <= v.diklatsar_stage;
                                                    const isCurrent = idx === v.diklatsar_stage;
                                                    return (
                                                        <React.Fragment key={idx}>
                                                            <div className="flex flex-col items-center gap-1.5 relative group">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${isCompleted ? 'bg-theme-600 text-white shadow-md shadow-theme-200' : 'bg-gray-100 text-gray-400'
                                                                    } ${isCurrent && idx < 6 ? 'ring-4 ring-theme-100' : ''}`}>
                                                                    {idx === 6 ? <GraduationCap size={16} /> : (isCompleted ? <CheckCircle2 size={16} /> : <Circle size={12} />)}
                                                                </div>
                                                                <span className="text-[10px] font-medium text-gray-500 text-center w-16 leading-tight hidden xl:block">
                                                                    {stage}
                                                                </span>
                                                            </div>
                                                            {idx < STAGES.length - 1 && (
                                                                <div className={`flex-1 h-1 rounded-full mx-1 ${idx < v.diklatsar_stage ? 'bg-theme-500' : 'bg-gray-200'}`}></div>
                                                            )}
                                                        </React.Fragment>
                                                    );
                                                })}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                {v.diklatsar_stage < 6 ? (
                                                    canEdit && (
                                                        <button onClick={() => handleAdvance(v)} className="btn-primary text-xs py-1.5 px-3">
                                                            Lanjut ke {STAGES[v.diklatsar_stage + 1]} <ArrowRight size={14} className="ml-1" />
                                                        </button>
                                                    )
                                                ) : (
                                                    <div className="flex gap-2">
                                                        {canEdit || props.auth?.user?.email === v.email ? (
                                                            <>
                                                                <a href={`/diklatsar/${v.id}/certificate/preview`} target="_blank" rel="noreferrer" className="btn-secondary text-xs py-1.5 px-3 flex items-center">
                                                                    <Eye size={14} className="mr-1" /> Preview Layout
                                                                </a>
                                                                <a href={`/diklatsar/${v.id}/certificate`} target="_blank" rel="noreferrer" className="btn-success text-xs py-1.5 px-3 flex items-center">
                                                                    <Printer size={14} className="mr-1" /> Cetak PDF
                                                                </a>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <button disabled className="btn-secondary text-xs py-1.5 px-3 flex items-center opacity-50 cursor-not-allowed" title="Akses Terbatas">
                                                                    <Eye size={14} className="mr-1" /> Preview Layout
                                                                </button>
                                                                <button disabled className="bg-gray-100 text-gray-400 border border-gray-200 rounded-lg text-xs py-1.5 px-3 flex items-center cursor-not-allowed" title="Akses Terbatas">
                                                                    <Printer size={14} className="mr-1" /> Cetak PDF
                                                                </button>
                                                            </>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                            Tidak ada relawan yang sedang proses Diklatsar. Pastikan ada relawan dengan status Disetujui.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} title="Pengaturan Materi Diklatsar" size="lg">
                <div className="space-y-4">
                    {modules.map((mod) => (
                        <div key={mod.id} className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                            {editingModule?.id === mod.id ? (
                                <form onSubmit={handleSaveModule} className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Judul Materi</label>
                                        <input type="text" className="form-input w-full" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} required />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Jadwal / Waktu</label>
                                            <input type="text" className="form-input w-full" value={formData.schedule} onChange={e => setFormData({ ...formData, schedule: e.target.value })} placeholder="Contoh: 12 Ags 2026, 09:00" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 mb-1">Pemateri</label>
                                            <input type="text" className="form-input w-full" value={formData.speaker} onChange={e => setFormData({ ...formData, speaker: e.target.value })} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-1">Deskripsi Singkat</label>
                                        <textarea className="form-input w-full text-sm" rows={2} value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                    </div>
                                    <div className="flex justify-end gap-2 mt-2">
                                        <button type="button" onClick={() => setEditingModule(null)} className="btn-secondary text-xs py-1.5 px-3">Batal</button>
                                        <button type="submit" className="btn-primary text-xs py-1.5 px-3">
                                            <Save size={14} className="mr-1" /> Simpan
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex justify-between items-start">
                                    <div>
                                        <div className="text-xs font-bold text-theme-600 mb-1">Materi {mod.stage_number}</div>
                                        <h3 className="font-semibold text-gray-900 mb-2">{mod.title}</h3>
                                        <div className="flex gap-4 mt-2 text-xs text-gray-500">
                                            <span><strong>Waktu:</strong> {mod.schedule || '-'}</span>
                                            <span><strong>Pemateri:</strong> {mod.speaker || '-'}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => openEdit(mod)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                        <Edit size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </Modal>
            <Modal isOpen={isCertSettingsOpen} onClose={() => setIsCertSettingsOpen(false)} title="Pengaturan Template Sertifikat" size="xl">
                <form onSubmit={handleSaveCertSetting} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">No. Sertifikat</label>
                            <input type="text" className="form-input w-full" value={certFormData.certificate_number} onChange={e => setCertFormData({ ...certFormData, certificate_number: e.target.value })} placeholder="001/LDKO/BSMI/2026" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Sebagai (Role)</label>
                            <input type="text" className="form-input w-full" value={certFormData.role_text} onChange={e => setCertFormData({ ...certFormData, role_text: e.target.value })} placeholder="Peserta" required />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Kalimat Keterangan</label>
                        <textarea className="form-input w-full text-sm" rows={3} value={certFormData.description_text} onChange={e => setCertFormData({ ...certFormData, description_text: e.target.value })} placeholder="Telah mengikuti dan dinyatakan LULUS dalam Pendidikan dan Latihan Dasar Kepalangmerahan..."></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tahun Ke</label>
                            <input type="text" className="form-input w-full" value={certFormData.year_text} onChange={e => setCertFormData({ ...certFormData, year_text: e.target.value })} placeholder="Misal: V" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Penyelenggara</label>
                            <input type="text" className="form-input w-full" value={certFormData.organizer} onChange={e => setCertFormData({ ...certFormData, organizer: e.target.value })} placeholder="BSMI Provinsi Banten" />
                        </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tempat</label>
                            <input type="text" className="form-input w-full" value={certFormData.location} onChange={e => setCertFormData({ ...certFormData, location: e.target.value })} placeholder="Misal: Serang" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Hari</label>
                            <input type="text" className="form-input w-full" value={certFormData.day_text} onChange={e => setCertFormData({ ...certFormData, day_text: e.target.value })} placeholder="Misal: Sabtu - Minggu" />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tanggal</label>
                            <input type="text" className="form-input w-full" value={certFormData.date_text} onChange={e => setCertFormData({ ...certFormData, date_text: e.target.value })} placeholder="12 - 13 Agustus 2026" />
                        </div>
                    </div>
                    <hr className="my-2 border-gray-100" />
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Penandatangan 1 (Kiri)</p>
                            <label className="block text-xs text-gray-500 mb-1">Jabatan</label>
                            <input type="text" className="form-input w-full text-xs mb-2" value={certFormData.signature_1_title} onChange={e => setCertFormData({ ...certFormData, signature_1_title: e.target.value })} placeholder="Ketua Umum" />
                            <label className="block text-xs text-gray-500 mb-1">Nama</label>
                            <input type="text" list="signatory-names" className="form-input w-full text-xs mb-2" value={certFormData.signature_1_name} onChange={e => setCertFormData({ ...certFormData, signature_1_name: e.target.value })} placeholder="Dr. M. Djazuli Ambari" />
                            <label className="block text-xs text-gray-500 mb-1">Upload TTD (PNG Transparan)</label>
                            <input type="file" accept="image/png" className="w-full text-xs" onChange={e => setCertFormData({ ...certFormData, signature_1_image: e.target.files?.[0] || null })} />
                            {props.certificateSetting?.signature_1_image && <span className="text-[10px] text-emerald-600 block mt-1">✓ Sudah ada tanda tangan tersimpan</span>}
                        </div>
                        <div className="p-3 bg-gray-50 border border-gray-100 rounded-lg">
                            <p className="text-xs font-semibold text-gray-600 mb-2">Penandatangan 2 (Kanan)</p>
                            <label className="block text-xs text-gray-500 mb-1">Jabatan</label>
                            <input type="text" className="form-input w-full text-xs mb-2" value={certFormData.signature_2_title} onChange={e => setCertFormData({ ...certFormData, signature_2_title: e.target.value })} placeholder="Komandan Relawan" />
                            <label className="block text-xs text-gray-500 mb-1">Nama</label>
                            <input type="text" list="signatory-names" className="form-input w-full text-xs mb-2" value={certFormData.signature_2_name} onChange={e => setCertFormData({ ...certFormData, signature_2_name: e.target.value })} placeholder="Rizky Febriansyah" />
                            <label className="block text-xs text-gray-500 mb-1">Upload TTD (PNG Transparan)</label>
                            <input type="file" accept="image/png" className="w-full text-xs" onChange={e => setCertFormData({ ...certFormData, signature_2_image: e.target.files?.[0] || null })} />
                            {props.certificateSetting?.signature_2_image && <span className="text-[10px] text-emerald-600 block mt-1">✓ Sudah ada tanda tangan tersimpan</span>}
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" className="btn-primary">
                            <Save size={16} className="mr-2" /> Simpan Pengaturan
                        </button>
                    </div>
                    
                    <datalist id="signatory-names">
                        {signatoryCandidates?.map((name, i) => (
                            <option key={i} value={name} />
                        ))}
                    </datalist>
                </form>
            </Modal>
        </AppLayout>
    );
}
