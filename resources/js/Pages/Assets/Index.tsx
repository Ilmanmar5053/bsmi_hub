import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, Plus, Edit, Trash2, Box, PackageOpen, Camera, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal, EmptyState } from '@/Components/Shared';
import { confirmAction } from '@/Utils/swal';
import { useForm } from '@inertiajs/react';

interface Asset {
    id: number;
    nama_barang: string;
    kategori_barang: string;
    nilai_aset: number | null;
    tipe_model: string;
    nomor_sku_serial: string;
    tanggal_pembelian: string;
    kepemilikan: string;
    pic_id: number | null;
    pic: { id: number; nama_lengkap: string } | null;
    foto_aset: string;
    lokasi: string;
    tanggal_stock_opname: string;
}

interface Props {
    assets: { data: Asset[]; meta: any };
    members: { id: number; nama_lengkap: string; no_induk_anggota: string; regional_cabang: string | null }[];
    regionals: string[];
    filters: { search: string; category: string; sort_by?: string; sort_direction?: string; };
    topAssets?: Asset[];
}

const CATEGORIES = ['Kendaraan', 'Elektronik', 'Komputer/Laptop', 'Perlengkapan', 'Lainnya'];
const LOCATIONS = ['Kantor Sekretariat', 'Rumah Pengurus', 'Rumah PIC', 'Tidak Diketahui'];

export default function AssetsIndex({ assets, members, regionals, filters, topAssets = [] }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [search, setSearch] = useState(filters.search || '');
    const [category, setCategory] = useState(filters.category || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'created_at');
    const [sortDir, setSortDir] = useState(filters.sort_direction || 'desc');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [previewAsset, setPreviewAsset] = useState<Asset | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_barang: '',
        kategori_barang: '',
        nilai_aset: '',
        tipe_model: '',
        nomor_sku_serial: '',
        tanggal_pembelian: '',
        kepemilikan: '',
        pic_id: '',
        lokasi: '',
        tanggal_stock_opname: '',
        foto_aset: null as File | null,
        _method: 'post'
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/assets', { search, category, sort_by: sortBy, sort_direction: sortDir }, { preserveState: true });
    };

    const handleSort = (column: string) => {
        let newDir = 'asc';
        if (sortBy === column) {
            newDir = sortDir === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortDir(newDir);
        router.get('/assets', { search, category, sort_by: column, sort_direction: newDir }, { preserveState: true });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400 inline ml-1 opacity-50" />;
        return sortDir === 'asc' ? <ArrowUp size={14} className="text-indigo-600 inline ml-1" /> : <ArrowDown size={14} className="text-indigo-600 inline ml-1" />;
    };

    const openCreate = () => {
        reset();
        setData('_method', 'post');
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEdit = (asset: Asset) => {
        setData({
            nama_barang: asset.nama_barang || '',
            kategori_barang: asset.kategori_barang || '',
            nilai_aset: asset.nilai_aset?.toString() || '',
            tipe_model: asset.tipe_model || '',
            nomor_sku_serial: asset.nomor_sku_serial || '',
            tanggal_pembelian: asset.tanggal_pembelian || '',
            kepemilikan: asset.kepemilikan || '',
            pic_id: asset.pic_id?.toString() || '',
            lokasi: asset.lokasi || '',
            tanggal_stock_opname: asset.tanggal_stock_opname || '',
            foto_aset: null,
            _method: 'put'
        });
        setEditingId(asset.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            post(`/assets/${editingId}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
                forceFormData: true,
            });
        } else {
            post('/assets', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
                forceFormData: true,
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (await confirmAction(`Hapus aset ${name}?`)) {
            router.delete(`/assets/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Aset" />

            <div className="page-header flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="page-title">Manajemen Aset</h1>
                    <p className="page-subtitle">Kelola inventaris dan aset berharga milik organisasi.</p>
                </div>
                {canEdit && (
                    <button onClick={openCreate} className="btn-primary">
                        <Plus size={18} /> Tambah Aset
                    </button>
                )}
            </div>

            {/* Aset Bernilai Tinggi Dashboard */}
            {canEdit && topAssets && topAssets.length > 0 && (
                <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                    <div className="flex items-center gap-2 mb-6">
                        <PackageOpen className="text-theme-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Aset Bernilai Tinggi</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                        {topAssets.map(asset => (
                            <div key={asset.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-theme-50/50 hover:border-theme-100 transition-colors">
                                <div className="w-12 h-12 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                    {asset.foto_aset ? (
                                        <img src={asset.foto_aset} alt={asset.nama_barang} className="w-full h-full object-cover" />
                                    ) : (
                                        <Box className="text-gray-400" size={20} />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-semibold text-gray-900 truncate" title={asset.nama_barang}>{asset.nama_barang}</h3>
                                    <p className="text-[10px] text-gray-500 truncate mb-0.5" title={asset.kategori_barang}>
                                        {asset.kategori_barang}
                                    </p>
                                    <div className="text-xs font-bold text-theme-600">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(asset.nilai_aset || 0)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="card mb-6">
                <div className="card-header">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
                        <div className="relative">
                            <input
                                type="text"
                                className="form-input pl-10 pr-4 py-2 w-64"
                                placeholder="Cari nama barang/serial..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <select 
                            className="form-input py-2" 
                            value={category}
                            onChange={e => {
                                setCategory(e.target.value);
                                router.get('/assets', { search, category: e.target.value, sort_by: sortBy, sort_direction: sortDir }, { preserveState: true });
                            }}
                        >
                            <option value="">Semua Kategori</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button type="submit" className="btn-secondary">Cari</button>
                    </form>
                </div>

                <div className="p-0 border-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th onClick={() => handleSort('nama_barang')} className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">Informasi Aset <SortIcon column="nama_barang" /></th>
                                    <th onClick={() => handleSort('kategori_barang')} className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">Kategori & Detail <SortIcon column="kategori_barang" /></th>
                                    <th onClick={() => handleSort('regional_cabang')} className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">PIC / Lokasi <SortIcon column="regional_cabang" /></th>
                                    <th onClick={() => handleSort('tanggal_stock_opname')} className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">Tgl. Opname <SortIcon column="tanggal_stock_opname" /></th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {assets.data.length > 0 ? assets.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3">
                                            <div>
                                                <div className="font-semibold text-gray-900">{item.nama_barang}</div>
                                                {item.nilai_aset && (
                                                    <div className="text-theme-600 text-xs mt-0.5 font-medium">
                                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.nilai_aset)}
                                                    </div>
                                                )}
                                                <div className="text-gray-500 text-xs mt-1">S/N: {item.nomor_sku_serial || '-'}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100 mb-1">
                                                {item.kategori_barang}
                                            </span>
                                            <div className="text-gray-500 text-xs mt-1">Model: {item.tipe_model || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900 font-medium">{item.pic?.nama_lengkap || 'Belum ada PIC'}</div>
                                            <div className="text-gray-500 text-xs mt-1">{item.lokasi || '-'}</div>
                                            <div className="text-gray-400 text-xs">{item.kepemilikan || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900">{item.tanggal_stock_opname || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => setPreviewAsset(item)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors bg-white border border-gray-200 rounded-md shadow-sm hover:border-blue-300 hover:bg-blue-50" title="Detail Data">
                                                    <Eye size={16} />
                                                </button>
                                                {canEdit && (
                                                    <>
                                                        <button onClick={() => openEdit(item)} className="p-1.5 text-gray-400 hover:text-theme-600 transition-colors bg-white border border-gray-200 rounded-md shadow-sm hover:border-theme-300 hover:bg-theme-50" title="Edit Data">
                                                            <Edit size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(item.id, item.nama_barang)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 rounded-md shadow-sm hover:border-red-300 hover:bg-red-50" title="Hapus Data">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12">
                                            <EmptyState icon={<PackageOpen />} title="Tidak ada aset" description="Belum ada data aset yang tersimpan." />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Data Aset' : 'Tambah Aset'}>
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Barang *</label>
                            <input type="text" className="form-input" value={data.nama_barang} onChange={e => setData('nama_barang', e.target.value)} required />
                            {errors.nama_barang && <p className="text-red-500 text-xs mt-1">{errors.nama_barang}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori *</label>
                            <select className="form-input" value={data.kategori_barang} onChange={e => setData('kategori_barang', e.target.value)} required>
                                <option value="">Pilih Kategori...</option>
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.kategori_barang && <p className="text-red-500 text-xs mt-1">{errors.kategori_barang}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nilai Aset (Rp)</label>
                            <input type="number" className="form-input" value={data.nilai_aset} onChange={e => setData('nilai_aset', e.target.value)} placeholder="Contoh: 15000000" />
                            {errors.nilai_aset && <p className="text-red-500 text-xs mt-1">{errors.nilai_aset}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe / Model</label>
                            <input type="text" className="form-input" value={data.tipe_model} onChange={e => setData('tipe_model', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor SKU / Serial</label>
                            <input type="text" className="form-input" value={data.nomor_sku_serial} onChange={e => setData('nomor_sku_serial', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Pembelian/Penerimaan</label>
                            <input type="date" className="form-input" value={data.tanggal_pembelian} onChange={e => setData('tanggal_pembelian', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kepemilikan (Regional)</label>
                            <select className="form-input" value={data.kepemilikan} onChange={e => {
                                setData(prev => ({
                                    ...prev,
                                    kepemilikan: e.target.value,
                                    pic_id: '' // reset pic when regional changes
                                }));
                            }}>
                                <option value="">Semua Cabang/Regional</option>
                                {regionals.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Lokasi Aset</label>
                            <select className="form-input" value={data.lokasi} onChange={e => setData('lokasi', e.target.value)}>
                                <option value="">Pilih Lokasi...</option>
                                {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">PIC Penanggung Jawab</label>
                            <select className="form-input" value={data.pic_id} onChange={e => setData('pic_id', e.target.value)}>
                                <option value="">Tanpa PIC</option>
                                {members.filter(m => data.kepemilikan ? m.regional_cabang === data.kepemilikan : true).map(m => (
                                    <option key={m.id} value={m.id}>{m.nama_lengkap} ({m.no_induk_anggota})</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Terakhir Stock Opname</label>
                            <input type="date" className="form-input" value={data.tanggal_stock_opname} onChange={e => setData('tanggal_stock_opname', e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Foto Aset</label>
                            <input type="file" accept="image/*" className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-theme-50 file:text-theme-700 hover:file:bg-theme-100" onChange={e => setData('foto_aset', e.target.files ? e.target.files[0] : null)} />
                            {errors.foto_aset && <p className="text-red-500 text-xs mt-1">{errors.foto_aset}</p>}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!previewAsset} onClose={() => setPreviewAsset(null)} title="Detail Aset" size="md">
                {previewAsset && (
                    <div className="p-1">
                        <div className="w-full h-48 bg-gray-50 rounded-xl mb-6 overflow-hidden flex items-center justify-center border border-gray-200">
                            {previewAsset.foto_aset ? (
                                <img src={previewAsset.foto_aset} alt={previewAsset.nama_barang} className="w-full h-full object-contain" />
                            ) : (
                                <div className="text-center text-gray-400">
                                    <Box size={40} className="mx-auto mb-2" />
                                    <p className="text-sm font-medium">Tidak Ada Foto</p>
                                </div>
                            )}
                        </div>
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900 leading-tight">{previewAsset.nama_barang}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-600 border border-indigo-100">
                                    {previewAsset.kategori_barang}
                                </span>
                                {previewAsset.nilai_aset && (
                                    <span className="text-theme-600 font-bold text-sm">
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(previewAsset.nilai_aset)}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                            <div>
                                <p className="text-gray-500 mb-0.5">Nomor S/N</p>
                                <p className="font-medium text-gray-900">{previewAsset.nomor_sku_serial || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-0.5">Tipe / Model</p>
                                <p className="font-medium text-gray-900">{previewAsset.tipe_model || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-0.5">Lokasi</p>
                                <p className="font-medium text-gray-900">{previewAsset.lokasi || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-0.5">Kepemilikan</p>
                                <p className="font-medium text-gray-900">{previewAsset.kepemilikan || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-0.5">PIC Penanggung Jawab</p>
                                <p className="font-medium text-gray-900">{previewAsset.pic?.nama_lengkap || '-'}</p>
                            </div>
                            <div>
                                <p className="text-gray-500 mb-0.5">Tanggal Pembelian</p>
                                <p className="font-medium text-gray-900">{previewAsset.tanggal_pembelian || '-'}</p>
                            </div>
                        </div>

                        <div className="mt-8 pt-4 border-t border-gray-100 flex justify-end">
                            <button type="button" onClick={() => setPreviewAsset(null)} className="btn-secondary">Tutup</button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
