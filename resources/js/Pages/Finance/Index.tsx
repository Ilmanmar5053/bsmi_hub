import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard, StatusBadge, Modal, SearchInput, formatRupiah, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, Download, ArrowUpRight, ArrowDownRight, Wallet, Trash2, Edit } from 'lucide-react';

interface Transaction {
    id: number;
    type: string;
    amount: string;
    category: string;
    description: string;
    date: string;
}

interface Props {
    transactions: { data: Transaction[]; meta: any };
    summary: { totalIncome: number; totalExpense: number; balance: number };
    filters: { type: string; month: string; search: string };
}

export default function FinanceIndex({ transactions, summary, filters }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'pemasukan', amount: '', category: '', description: '', date: ''
    });

    const incomeCategories = ['Iuran Anggota', 'Donasi', 'Bantuan Pemerintah', 'Lainnya'];
    const expenseCategories = ['Operasional', 'Program', 'Logistik', 'Gaji', 'Lainnya'];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/finance', { search, type: typeFilter, month: monthFilter }, { preserveState: true });
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus transaksi ini?')) {
            router.delete(`/finance/${id}`);
        }
    };

    const handleEdit = (trx: any) => {
        setData({
            type: trx.type || 'pemasukan',
            amount: trx.amount || '',
            category: trx.category || '',
            description: trx.description || '',
            date: trx.date || '',
            _method: 'put'
        } as any);
        setEditingId(trx.id);
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
            post(`/finance/${editingId}`, options);
        } else {
            post('/finance', options);
        }
    };

    return (
        <AppLayout>
            <Head title="Keuangan" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Keuangan</h1>
                    <p className="page-subtitle">Pemasukan dan pengeluaran organisasi.</p>
                </div>
                <div className="flex gap-2">
                    <a href="/finance/export" className="btn-secondary">
                        <Download size={16} /> Export
                    </a>
                    {canEdit && (
                        <button onClick={handleOpenAdd} className="btn-primary">
                            <Plus size={16} /> Transaksi Baru
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Pemasukan" value={formatRupiah(summary.totalIncome)} icon={<ArrowUpRight className="text-green-600" />} iconBg="bg-green-100" />
                <StatCard title="Total Pengeluaran" value={formatRupiah(summary.totalExpense)} icon={<ArrowDownRight className="text-red-600" />} iconBg="bg-red-100" />
                <StatCard title="Saldo Saat Ini" value={formatRupiah(summary.balance)} icon={<Wallet className="text-blue-600" />} iconBg="bg-blue-100" />
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput value={search} onChange={setSearch} placeholder="Cari keterangan..." />
                        </div>
                        <select className="form-input sm:w-48" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="">Semua Jenis</option>
                            <option value="pemasukan">Pemasukan</option>
                            <option value="pengeluaran">Pengeluaran</option>
                        </select>
                        <input type="month" className="form-input sm:w-48" value={monthFilter} onChange={e => setMonthFilter(e.target.value)} />
                        <button type="submit" className="btn-secondary">Filter</button>
                    </form>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Jenis</th>
                                <th>Kategori</th>
                                <th>Keterangan</th>
                                <th className="text-right">Jumlah</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.data.length > 0 ? transactions.data.map(trx => (
                                <tr key={trx.id}>
                                    <td>{formatDate(trx.date)}</td>
                                    <td><StatusBadge status={trx.type} /></td>
                                    <td>{trx.category}</td>
                                    <td>{trx.description}</td>
                                    <td className={`text-right font-medium ${trx.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                                        {trx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.amount)}
                                    </td>
                                    <td className="text-right space-x-2">
                                        {canEdit && (
                                            <>
                                                <button onClick={() => handleEdit(trx)} className="text-blue-600 hover:text-blue-800"><Edit size={16} /></button>
                                                <button onClick={() => handleDelete(trx.id)} className="text-red-600 hover:text-red-800"><Trash2 size={16} /></button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={<Wallet />} title="Tidak ada transaksi keuangan" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingId ? "Edit Transaksi" : "Tambah Transaksi"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Jenis Transaksi</label>
                            <select className="form-input" value={data.type} onChange={e => setData('type', e.target.value)}>
                                <option value="pemasukan">Pemasukan</option>
                                <option value="pengeluaran">Pengeluaran</option>
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Tanggal</label>
                            <input type="date" className="form-input" value={data.date} onChange={e => setData('date', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Kategori</label>
                            <select className="form-input" value={data.category} onChange={e => setData('category', e.target.value)} required>
                                <option value="">Pilih Kategori...</option>
                                {(data.type === 'pemasukan' ? incomeCategories : expenseCategories).map(c => (
                                    <option key={c} value={c}>{c}</option>
                                ))}
                            </select>
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Jumlah (Rp)</label>
                            <input type="number" className="form-input" value={data.amount} onChange={e => setData('amount', e.target.value)} required />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Keterangan</label>
                            <textarea className="form-input" rows={3} value={data.description} onChange={e => setData('description', e.target.value)} required></textarea>
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
