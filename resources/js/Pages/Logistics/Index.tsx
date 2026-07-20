import React, { useState } from 'react';
import { Head, useForm, router, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatusBadge, Modal, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, Package, ArrowRightLeft, Edit, Trash2, FileText } from 'lucide-react';

interface LogisticsItem {
    id: number;
    name: string;
    category: string;
    quantity: number;
    unit: string;
    condition: string;
    location: string;
    expiry_date: string | null;
}

interface LogisticsTransaction {
    id: number;
    item_name?: string;
    type: string;
    quantity: number;
    date: string;
    source?: string;
    destination?: string;
    donor_name?: string;
    beneficiary?: string;
    program?: string;
    notes?: string;
}

interface Props {
    items: { data: LogisticsItem[]; meta?: any };
    recentTransactions: LogisticsTransaction[];
}

export default function LogisticsIndex({ items, recentTransactions }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [isAddItemOpen, setIsAddItemOpen] = useState(false);
    const [isAddTxOpen, setIsAddTxOpen] = useState(false);
    const [editingItemId, setEditingItemId] = useState<number | null>(null);

    const formItem = useForm({
        name: '', category: 'lainnya', quantity: '', unit: '', condition: 'baik', location: '', expiry_date: ''
    });

    const formTx = useForm({
        logistics_item_id: '', type: 'masuk', quantity: '', date: '', source_destination: '', notes: ''
    });

    const handleEditItem = (item: any) => {
        formItem.setData({
            name: item.name || '',
            category: item.category || '',
            quantity: item.quantity.toString() || '',
            unit: item.unit || '',
            condition: item.condition || 'baik',
            location: item.location || '',
            expiry_date: item.expiry_date || '',
            _method: 'put'
        } as any);
        setEditingItemId(item.id);
        setIsAddItemOpen(true);
    };

    const handleOpenAddItem = () => {
        formItem.reset();
        formItem.setData('_method' as any, 'post');
        setEditingItemId(null);
        setIsAddItemOpen(true);
    };

    const submitItem = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsAddItemOpen(false);
                setEditingItemId(null);
                formItem.reset();
            }
        };

        if (editingItemId) {
            formItem.post(`/logistics/${editingItemId}`, options);
        } else {
            formItem.post('/logistics', options);
        }
    };

    const submitTx = (e: React.FormEvent) => {
        e.preventDefault();
        formTx.transform((data) => ({
            ...data,
            source: data.type === 'masuk' ? data.source_destination : '',
            destination: data.type === 'keluar' ? data.source_destination : '',
        }));
        formTx.post('/logistics/transaction', { onSuccess: () => { setIsAddTxOpen(false); formTx.reset(); } });
    };

    const handleDelete = (id: number) => {
        if (confirm('Hapus barang ini? Semua transaksi terkait akan terhapus juga.')) {
            router.delete(`/logistics/${id}`);
        }
    };

    return (
        <AppLayout>
            <Head title="Logistik & Inventaris" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Logistik & Inventaris</h1>
                    <p className="page-subtitle">Kelola stok barang dan bantuan.</p>
                </div>
                <div className="flex gap-2">
                    {canEdit && (
                        <>
                            <button onClick={() => setIsAddTxOpen(true)} className="btn-secondary">
                                <ArrowRightLeft size={16} /> Transaksi
                            </button>
                            <button onClick={handleOpenAddItem} className="btn-primary">
                                <Plus size={16} /> Tambah Barang
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
                <Link href="/logistics" className="px-4 py-2 border-b-2 border-theme-600 text-theme-600 font-medium text-sm flex items-center gap-2">
                    <Package size={16} /> Stok & Transaksi
                </Link>
                <Link href="/delivery-notes" className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm flex items-center gap-2 transition-colors">
                    <FileText size={16} /> Surat Jalan
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Daftar Barang */}
                <div className="card h-[600px] flex flex-col">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Stok Barang</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-0 table-container border-0 rounded-none">
                        <table className="data-table">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <th>Barang</th>
                                    <th>Stok</th>
                                    <th>Kondisi</th>
                                    <th className="text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.data.length > 0 ? items.data.map(item => (
                                    <tr key={item.id}>
                                        <td>
                                            <p className="font-medium text-gray-900 dark:text-white">{item.name}</p>
                                            <p className="text-xs text-gray-500">{item.category} • {item.location}</p>
                                        </td>
                                        <td>
                                            <span className="font-semibold text-lg">{item.quantity}</span>
                                            <span className="text-xs text-gray-500 ml-1">{item.unit}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${item.condition === 'baik' ? 'bg-green-100 text-green-700' :
                                                item.condition === 'rusak_ringan' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {item.condition === 'baik' ? 'Baik' : item.condition === 'rusak_ringan' ? 'Rusak Ringan' : 'Rusak Berat'}
                                            </span>
                                        </td>
                                        <td className="text-right space-x-2">
                                            {canEdit && (
                                                <>
                                                    <button onClick={() => handleEditItem(item)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                                </>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4}><EmptyState icon={<Package />} title="Belum ada barang" /></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Riwayat Transaksi */}
                <div className="card h-[600px] flex flex-col">
                    <div className="card-header flex justify-between items-center">
                        <h2 className="font-semibold text-lg">Riwayat Transaksi</h2>
                    </div>
                    <div className="flex-1 overflow-auto p-0 table-container border-0 rounded-none">
                        <table className="data-table">
                            <thead className="sticky top-0 z-10">
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Barang</th>
                                    <th>Jenis</th>
                                    <th className="text-right">Qty</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentTransactions.length > 0 ? recentTransactions.map(tx => (
                                    <tr key={tx.id}>
                                        <td>{formatDate(tx.date)}</td>
                                        <td>
                                            <p className="font-medium text-gray-900 dark:text-white truncate max-w-[150px]" title={tx.item_name}>{tx.item_name}</p>
                                            <p className="text-xs text-gray-500 truncate max-w-[150px]" title={tx.type === 'masuk' ? tx.source || tx.donor_name : tx.destination || tx.beneficiary || tx.program}>
                                                {tx.type === 'masuk' ? (tx.source || tx.donor_name || 'Sumber tidak diketahui') : (tx.destination || tx.beneficiary || tx.program || 'Tujuan tidak diketahui')}
                                            </p>
                                        </td>
                                        <td><StatusBadge status={tx.type} /></td>
                                        <td className={`text-right font-semibold ${tx.type === 'masuk' ? 'text-green-600' : 'text-orange-600'}`}>
                                            {tx.type === 'masuk' ? '+' : '-'}{tx.quantity}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr><td colSpan={4}><EmptyState icon={<ArrowRightLeft />} title="Belum ada transaksi" /></td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isAddItemOpen} onClose={() => setIsAddItemOpen(false)} title={editingItemId ? "Edit Barang" : "Tambah Barang"}>
                <form onSubmit={submitItem} className="space-y-4">
                    {Object.keys(formItem.errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            Terdapat kesalahan: {Object.values(formItem.errors).join(', ')}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Nama Barang</label>
                            <input type="text" className="form-input" value={formItem.data.name} onChange={e => formItem.setData('name', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Kategori</label>
                            <select className="form-input" value={formItem.data.category} onChange={e => formItem.setData('category', e.target.value)}>
                                <option value="makanan">Makanan</option>
                                <option value="pakaian">Pakaian</option>
                                <option value="obat">Obat-obatan</option>
                                <option value="peralatan">Peralatan</option>
                                <option value="lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Satuan (kg, dus, dll)</label>
                            <input type="text" className="form-input" value={formItem.data.unit} onChange={e => formItem.setData('unit', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Stok Awal</label>
                            <input type="number" className="form-input" value={formItem.data.quantity} onChange={e => formItem.setData('quantity', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Kondisi</label>
                            <select className="form-input" value={formItem.data.condition} onChange={e => formItem.setData('condition', e.target.value)}>
                                <option value="baik">Baik</option>
                                <option value="rusak_ringan">Rusak Ringan</option>
                                <option value="rusak_berat">Rusak Berat</option>
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Lokasi / Gudang</label>
                            <input type="text" className="form-input" value={formItem.data.location} onChange={e => formItem.setData('location', e.target.value)} />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Tanggal Kedaluwarsa (Opsional)</label>
                            <input type="date" className="form-input" value={formItem.data.expiry_date} onChange={e => formItem.setData('expiry_date', e.target.value)} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddItemOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={formItem.processing}>Simpan Barang</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} title="Transaksi Barang">
                <form onSubmit={submitTx} className="space-y-4">
                    {Object.keys(formTx.errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            Terdapat kesalahan: {Object.values(formTx.errors).join(', ')}
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Barang</label>
                            <select className="form-input" value={formTx.data.logistics_item_id} onChange={e => formTx.setData('logistics_item_id', e.target.value)} required>
                                <option value="">Pilih Barang...</option>
                                {items.data.map(item => <option key={item.id} value={item.id}>{item.name} ({item.quantity} {item.unit})</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Jenis Transaksi</label>
                            <select className="form-input" value={formTx.data.type} onChange={e => formTx.setData('type', e.target.value)}>
                                <option value="masuk">Masuk (Terima/Beli)</option>
                                <option value="keluar">Keluar (Distribusi/Pakai)</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Jumlah</label>
                            <input type="number" className="form-input" value={formTx.data.quantity} onChange={e => formTx.setData('quantity', e.target.value)} required min="1" />
                        </div>
                        <div>
                            <label className="form-label">Tanggal</label>
                            <input type="date" className="form-input" value={formTx.data.date} onChange={e => formTx.setData('date', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Sumber / Tujuan</label>
                            <input type="text" className="form-input" value={formTx.data.source_destination} onChange={e => formTx.setData('source_destination', e.target.value)} required />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Keterangan Tambahan</label>
                            <textarea className="form-input" rows={2} value={formTx.data.notes} onChange={e => formTx.setData('notes', e.target.value)}></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddTxOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={formTx.processing}>Simpan Transaksi</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
