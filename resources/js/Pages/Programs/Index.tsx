import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatusBadge, Modal, SearchInput, formatRupiah, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, Edit, Trash2, Calendar, MapPin, Users, Target } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

interface Program {
    id: number;
    title: string;
    description: string;
    category: string;
    status: string;
    start_date: string;
    end_date: string;
    budget: string;
    location: string;
    target_beneficiaries: number;
    progress_percentage?: number;
}

interface Props {
    programs: { data: Program[]; meta: any };
    filters: { status: string; category: string };
}

export default function ProgramsIndex({ programs, filters }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const isSuperAdmin = roles.includes('administrator');
    const canManagePrograms = isSuperAdmin || props.auth?.permissions?.includes('menu-programs');
    const canEdit = isSuperAdmin || (canManagePrograms && !roles.includes('anggota') && !roles.includes('relawan'));

    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        title: '', description: '', category: '', status: 'planned',
        start_date: '', end_date: '', budget: '', location: '', target_beneficiaries: ''
    });

    const categories = ['Kesehatan', 'Pendidikan', 'Bencana', 'Sosial', 'Lingkungan', 'Lainnya'];

    const tabs = [
        { label: 'Semua', value: '' },
        { label: 'Direncanakan', value: 'planned' },
        { label: 'Berlangsung', value: 'ongoing' },
        { label: 'Selesai', value: 'completed' }
    ];

    const handleFilter = (status: string, category: string) => {
        setStatusFilter(status);
        setCategoryFilter(category);
        router.get('/programs', { status, category }, { preserveState: true });
    };

    const handleDelete = async (id: number) => {
        if (await confirmAction('Yakin ingin menghapus program ini?')) {
            router.delete(`/programs/${id}`);
        }
    };

    const handleEdit = (program: any) => {
        setData({
            title: program.title || '',
            description: program.description || '',
            category: program.category || '',
            status: program.status || 'planned',
            start_date: program.start_date || '',
            end_date: program.end_date || '',
            budget: program.budget || '',
            location: program.location || '',
            target_beneficiaries: program.target_beneficiaries || '',
            _method: 'put'
        } as any);
        setEditingId(program.id);
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
            post(`/programs/${editingId}`, options);
        } else {
            post('/programs', options);
        }
    };

    return (
        <AppLayout>
            <Head title="Program Kerja" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Program Kerja</h1>
                    <p className="page-subtitle">Kelola program kerja yang diselenggarakan oleh BSMI.</p>
                </div>
                {canEdit && (
                    <button onClick={handleOpenAdd} className="btn-primary">
                        <Plus size={16} /> Buat Program Baru
                    </button>
                )}
            </div>

            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-px">
                <nav className="-mb-px flex space-x-6 overflow-x-auto">
                    {tabs.map(tab => (
                        <button
                            key={tab.value}
                            onClick={() => handleFilter(tab.value, categoryFilter)}
                            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                                statusFilter === tab.value
                                    ? 'border-red-500 text-red-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </nav>
                <div className="pb-2">
                    <select
                        className="form-input py-1.5 text-sm"
                        value={categoryFilter}
                        onChange={(e) => handleFilter(statusFilter, e.target.value)}
                    >
                        <option value="">Semua Kategori</option>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {programs.data.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {programs.data.map(program => (
                        <div key={program.id} className="card hover:shadow-md transition-shadow group flex flex-col h-full">
                            <div className="card-body flex flex-col flex-1">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                                        {program.category}
                                    </span>
                                    <StatusBadge status={program.status} />
                                </div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight">
                                    {program.title}
                                </h3>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                    {program.description}
                                </p>
                                
                                <div className="space-y-2 mt-auto">
                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>{formatDate(program.start_date)} - {formatDate(program.end_date)}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                        <MapPin size={14} className="text-gray-400" />
                                        <span className="truncate">{program.location || '-'}</span>
                                    </div>
                                    <div className="flex items-center text-xs text-gray-500 gap-2">
                                        <Target size={14} className="text-gray-400" />
                                        <span>Target: {program.target_beneficiaries || 0} Penerima Manfaat</span>
                                    </div>
                                </div>
                            </div>
                            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center rounded-b-2xl">
                                <div>
                                    <p className="text-[10px] text-gray-500 uppercase font-semibold">Anggaran</p>
                                    <p className="font-medium text-sm text-gray-900 dark:text-white">{formatRupiah(program.budget)}</p>
                                </div>
                                {canEdit && (
                                    <div className="flex gap-2">
                                        <button onClick={() => handleEdit(program)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => handleDelete(program.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="card">
                    <EmptyState icon={<Calendar />} title="Tidak ada program ditemukan" description="Coba ubah filter atau buat program baru." />
                </div>
            )}

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingId ? "Edit Program" : "Buat Program Baru"} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Judul Program</label>
                            <input type="text" className="form-input" value={data.title} onChange={e => setData('title', e.target.value)} required />
                            {errors.title && <div className="text-red-500 text-xs mt-1">{errors.title}</div>}
                        </div>
                        <div>
                            <label className="form-label">Kategori</label>
                            <select className="form-input" value={data.category} onChange={e => setData('category', e.target.value)} required>
                                <option value="">Pilih Kategori...</option>
                                {categories.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <div className="text-red-500 text-xs mt-1">{errors.category}</div>}
                        </div>
                        <div>
                            <label className="form-label">Status</label>
                            <select className="form-input" value={data.status} onChange={e => setData('status', e.target.value)} required>
                                <option value="planned">Direncanakan</option>
                                <option value="ongoing">Berlangsung</option>
                                <option value="completed">Selesai</option>
                            </select>
                            {errors.status && <div className="text-red-500 text-xs mt-1">{errors.status}</div>}
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Deskripsi</label>
                            <textarea className="form-input" rows={3} value={data.description} onChange={e => setData('description', e.target.value)}></textarea>
                            {errors.description && <div className="text-red-500 text-xs mt-1">{errors.description}</div>}
                        </div>
                        <div>
                            <label className="form-label">Tanggal Mulai</label>
                            <input type="date" className="form-input" value={data.start_date} onChange={e => setData('start_date', e.target.value)} required />
                            {errors.start_date && <div className="text-red-500 text-xs mt-1">{errors.start_date}</div>}
                        </div>
                        <div>
                            <label className="form-label">Tanggal Selesai</label>
                            <input type="date" className="form-input" value={data.end_date} onChange={e => setData('end_date', e.target.value)} />
                            {errors.end_date && <div className="text-red-500 text-xs mt-1">{errors.end_date}</div>}
                        </div>
                        <div>
                            <label className="form-label">Anggaran (Rp)</label>
                            <input type="number" className="form-input" value={data.budget} onChange={e => setData('budget', e.target.value)} />
                            {errors.budget && <div className="text-red-500 text-xs mt-1">{errors.budget}</div>}
                        </div>
                        <div>
                            <label className="form-label">Target Penerima Manfaat (Orang)</label>
                            <input type="number" className="form-input" value={data.target_beneficiaries} onChange={e => setData('target_beneficiaries', e.target.value)} />
                            {errors.target_beneficiaries && <div className="text-red-500 text-xs mt-1">{errors.target_beneficiaries}</div>}
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Lokasi</label>
                            <input type="text" className="form-input" value={data.location} onChange={e => setData('location', e.target.value)} />
                            {errors.location && <div className="text-red-500 text-xs mt-1">{errors.location}</div>}
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>Simpan Program</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
