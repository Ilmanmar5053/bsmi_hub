import React, { useState } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatusBadge, Modal, SearchInput, formatRupiah, EmptyState } from '@/Components/Shared';
import { Plus, Edit, Trash2, Heart } from 'lucide-react';
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
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        name: '', nik: '', phone: '', address: '', category: '', family_members: '1', description: ''
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
            _method: 'put'
        } as any);
        setEditingId(item.id);
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
                                        {canEdit && (
                                            <>
                                                <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
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
        </AppLayout>
    );
}
