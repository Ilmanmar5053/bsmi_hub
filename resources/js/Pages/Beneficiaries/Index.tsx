import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatusBadge, Modal, SearchInput, formatRupiah, EmptyState, SensitiveDataField } from '@/Components/Shared';
import { Plus, Edit, Trash2, Heart, Eye } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

interface Beneficiary {
    id: number;
    name: string;
    nik: string;
    phone: string;
    address: string;
    category: string;
    family_members: number;
    description: string;
    total_received: string;
    photo_path?: string;
}

interface Props {
    beneficiaries: { data: Beneficiary[]; meta: any };
    filters: { search: string; category: string };
}

export default function BeneficiariesIndex({ beneficiaries, filters }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [search, setSearch] = useState(filters.search || '');
    const [categoryFilter, setCategoryFilter] = useState(filters.category || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedBeneficiary, setSelectedBeneficiary] = useState<Beneficiary | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', nik: '', phone: '', address: '', category: '', family_members: '1', description: '', photo: null as File | null
    });

    const categories = [
        { value: 'dhuafa', label: 'Dhuafa' },
        { value: 'yatim_piatu', label: 'Yatim Piatu' },
        { value: 'lansia', label: 'Lansia' },
        { value: 'komunitas', label: 'Komunitas / Masjid' },
        { value: 'pendidikan', label: 'Pendidikan / Beasiswa' },
        { value: 'disabilitas', label: 'Disabilitas' },
        { value: 'panti_jompo', label: 'Panti Jompo / Panti Asuhan' },
        { value: 'lainnya', label: 'Lainnya' }
    ];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/beneficiaries', { search, category: categoryFilter }, { preserveState: true });
    };

    const handleDelete = async (id: number) => {
        if (await confirmAction('Yakin ingin menghapus data penerima manfaat ini?')) {
            router.delete(`/beneficiaries/${id}`);
        }
    };

    const handleEdit = (item: any) => {
        setData({
            name: item.name || '',
            nik: item.nik || '',
            phone: item.phone || '',
            address: item.address || '',
            category: item.category || '',
            family_members: item.family_members || '1',
            description: item.description || '',
            photo: null,
            _method: 'put'
        } as any);
        setEditingId(item.id);
        setIsAddModalOpen(true);
    };

    const handleView = (item: Beneficiary) => {
        setSelectedBeneficiary(item);
        setIsViewModalOpen(true);
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
            post(`/beneficiaries/${editingId}`, options);
        } else {
            post('/beneficiaries', options);
        }
    };

    return (
        <AppLayout>
            <Head title="Penerima Manfaat" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Penerima Manfaat</h1>
                    <p className="page-subtitle">Data individu atau kelompok penerima bantuan BSMI.</p>
                </div>
                {canEdit && (
                    <button onClick={handleOpenAdd} className="btn-primary">
                        <Plus size={16} /> Tambah Data
                    </button>
                )}
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, NIK, atau alamat..." />
                        </div>
                        <select className="form-input sm:w-64" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="">Semua Kategori</option>
                            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
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
                                <th>Nama & NIK</th>
                                <th>Kategori</th>
                                <th>Kontak & Alamat</th>
                                <th>Keluarga</th>
                                <th className="text-right">Total Bantuan</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {beneficiaries.data.length > 0 ? beneficiaries.data.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                        <p className="text-xs text-gray-500">NIK: {item.nik || '-'}</p>
                                    </td>
                                    <td>
                                        <span className="badge bg-orange-100 text-orange-700">
                                            {categories.find(c => c.value === item.category)?.label || item.category}
                                        </span>
                                    </td>
                                    <td>
                                        <p className="text-sm">{item.phone || '-'}</p>
                                        <p className="text-xs text-gray-500 truncate max-w-[200px]">{item.address}</p>
                                    </td>
                                    <td>{item.family_members} Orang</td>
                                    <td className="text-right font-medium text-green-600">
                                        {formatRupiah(item.total_received)}
                                    </td>
                                    <td className="text-right space-x-2">
                                        <button onClick={() => handleView(item)} className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200" title="Detail Data"><Eye size={16} /></button>
                                        {canEdit && (
                                            <>
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800" title="Edit Data"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800" title="Hapus Data"><Trash2 size={16} /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={<Heart />} title="Tidak ada data penerima manfaat" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingId ? "Edit Penerima Manfaat" : "Tambah Penerima Manfaat"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Nama Lengkap / Instansi</label>
                            <input type="text" className="form-input" value={data.name} onChange={e => setData('name', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Nomor Induk Kependudukan (NIK)</label>
                            <input type="text" className="form-input" value={data.nik} onChange={e => setData('nik', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Nomor Telepon</label>
                            <input type="text" className="form-input" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Kategori</label>
                            <select className="form-input" value={data.category} onChange={e => setData('category', e.target.value)} required>
                                <option value="">Pilih Kategori...</option>
                                {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Jumlah Tanggungan / Anggota</label>
                            <input type="number" className="form-input" value={data.family_members} onChange={e => setData('family_members', e.target.value)} min="1" required />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Foto Penerima Manfaat (Opsional)</label>
                            <input type="file" className="w-full text-sm text-gray-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-theme-50 file:text-theme-700 hover:file:bg-theme-100" accept="image/*" onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)} />
                            {errors.photo && <p className="text-xs text-red-500 mt-1">{errors.photo}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Alamat Lengkap</label>
                            <textarea className="form-input" rows={2} value={data.address} onChange={e => setData('address', e.target.value)} required></textarea>
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Deskripsi / Kondisi Khusus</label>
                            <textarea className="form-input" rows={2} value={data.description} onChange={e => setData('description', e.target.value)}></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>Simpan Data</button>
                    </div>
                </form>
            </Modal>

            {/* View Modal */}
            <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Detail Penerima Manfaat" size="lg">
                {selectedBeneficiary && (
                    <div className="p-4 space-y-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative">
                            <div className="relative group z-10">
                                <div className="w-32 h-32 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-600 cursor-pointer">
                                    {selectedBeneficiary.photo_path ? (
                                        <img src={selectedBeneficiary.photo_path} alt={selectedBeneficiary.name} className="w-full h-full object-cover group-hover:opacity-80 transition-opacity" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                                            <Heart size={40} />
                                        </div>
                                    )}
                                </div>
                                
                                {selectedBeneficiary.photo_path && (
                                    <div className="absolute top-full mt-4 md:top-0 md:left-full md:mt-0 md:ml-6 z-50 hidden group-hover:block w-[280px] sm:w-[350px] bg-white dark:bg-gray-800 p-2 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xl origin-left animate-in fade-in zoom-in-95 duration-200">
                                        <img src={selectedBeneficiary.photo_path} alt={selectedBeneficiary.name} className="w-full h-auto max-h-[400px] object-contain rounded-xl bg-gray-50 dark:bg-gray-900" />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">{selectedBeneficiary.name}</h3>
                                <span className="inline-block mt-1 px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                                    {categories.find(c => c.value === selectedBeneficiary.category)?.label || selectedBeneficiary.category}
                                </span>
                                <div className="mt-4 space-y-2">
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <span className="text-sm font-medium text-gray-500 w-24">NIK</span>
                                        <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {selectedBeneficiary.nik ? <SensitiveDataField value={selectedBeneficiary.nik} /> : '-'}
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-2">
                                        <span className="text-sm font-medium text-gray-500 w-24">Telepon</span>
                                        <div className="flex-1 text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {selectedBeneficiary.phone ? <SensitiveDataField value={selectedBeneficiary.phone} /> : '-'}
                                        </div>
                                    </div>
                                    <div className="flex items-start justify-center md:justify-start gap-2">
                                        <span className="text-sm font-medium text-gray-500 w-24">Alamat</span>
                                        <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{selectedBeneficiary.address || '-'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                            <div>
                                <p className="text-xs text-gray-500">Tanggungan Keluarga</p>
                                <p className="font-semibold text-gray-900 dark:text-white">{selectedBeneficiary.family_members} Orang</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Total Bantuan Diterima</p>
                                <p className="font-semibold text-green-600">{formatRupiah(selectedBeneficiary.total_received)}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-500 mb-1">Deskripsi / Kondisi Khusus</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                                    {selectedBeneficiary.description || 'Tidak ada deskripsi.'}
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex justify-end pt-2">
                            <button onClick={() => setIsViewModalOpen(false)} className="btn-secondary">Tutup</button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
