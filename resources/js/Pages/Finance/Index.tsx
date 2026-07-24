import React, { useState } from 'react';
import { Head, Link, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard, StatusBadge, Modal, SearchInput, formatRupiah, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, Download, ArrowUpRight, ArrowDownRight, Wallet, Trash2, Edit, Upload, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

interface Transaction {
    id: number;
    type: string;
    amount: string;
    category: string;
    description: string;
    date: string;
}

interface BankAccount {
    id: number;
    account_number: string;
    bank_name: string;
    account_name: string;
    branch_name: string | null;
    logo_url: string | null;
}

interface Props {
    transactions: { data: Transaction[]; meta: any };
    summary: { totalIncome: number; totalExpense: number; balance: number };
    filters: { type: string; month: string; year: string; search: string; sort_by: string; sort_direction: string; };
    bankAccounts?: BankAccount[];
}

export default function FinanceIndex({ transactions, summary, filters, bankAccounts = [] }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [typeFilter, setTypeFilter] = useState(filters.type || '');
    const [monthFilter, setMonthFilter] = useState(filters.month || '');
    const [yearFilter, setYearFilter] = useState(filters.year || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'date');
    const [sortDir, setSortDir] = useState(filters.sort_direction || 'desc');
    const [search, setSearch] = useState(filters.search || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editingBankId, setEditingBankId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        type: 'pemasukan', amount: '', category: '', description: '', date: ''
    });

    const { data: bankData, setData: setBankData, post: postBank, processing: bankProcessing, errors: bankErrors, reset: resetBank } = useForm({
        account_number: '', bank_name: '', account_name: '', branch_name: '', logo: null as File | null, _method: 'post'
    });

    const { data: importData, setData: setImportData, post: postImport, processing: importProcessing, reset: resetImport, errors: importErrors } = useForm({
        file: null as File | null
    });

    const incomeCategories = ['Iuran Anggota', 'Donasi', 'Bantuan Pemerintah', 'Lainnya'];
    const expenseCategories = ['Operasional', 'Program', 'Logistik', 'Gaji', 'Lainnya'];

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/finance', { search, type: typeFilter, month: monthFilter, year: yearFilter, sort_by: sortBy, sort_direction: sortDir }, { preserveState: true });
    };

    const handleSort = (column: string) => {
        let newDir = 'asc';
        if (sortBy === column) {
            newDir = sortDir === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortDir(newDir);
        router.get('/finance', { search, type: typeFilter, month: monthFilter, year: yearFilter, sort_by: column, sort_direction: newDir }, { preserveState: true });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400 inline ml-1 opacity-50" />;
        return sortDir === 'asc' ? <ArrowUp size={14} className="text-theme-600 inline ml-1" /> : <ArrowDown size={14} className="text-theme-600 inline ml-1" />;
    };

    const handleDelete = async (id: number) => {
        if (await confirmAction('Yakin ingin menghapus transaksi ini?')) {
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

    const handleEditBank = (bank: BankAccount) => {
        setBankData({
            account_number: bank.account_number,
            bank_name: bank.bank_name,
            account_name: bank.account_name,
            branch_name: bank.branch_name || '',
            logo: null,
            _method: 'put'
        });
        setEditingBankId(bank.id);
        setIsBankModalOpen(true);
    };

    const handleOpenAddBank = () => {
        resetBank();
        setBankData('_method', 'post');
        setEditingBankId(null);
        setIsBankModalOpen(true);
    };

    const handleBankSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsBankModalOpen(false);
                setEditingBankId(null);
                resetBank();
            }
        };

        if (editingBankId) {
            postBank(`/bank-accounts/${editingBankId}`, options);
        } else {
            postBank('/bank-accounts', options);
        }
    };

    const handleDeleteBank = async (id: number) => {
        if (await confirmAction('Yakin ingin menghapus rekening ini?')) {
            router.delete(`/bank-accounts/${id}`);
        }
    };
    
    return (
        <AppLayout>
            <Head title="Arus Kas" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Arus Kas</h1>
                    <p className="page-subtitle">Pemasukan dan pengeluaran organisasi.</p>
                </div>
                <div className="flex gap-2">
                    <a href="/finance/export" className="btn-secondary">
                        <Download size={16} /> Export
                    </a>
                    {canEdit && (
                        <>
                            <button onClick={() => setIsImportModalOpen(true)} className="btn-secondary">
                                <Upload size={16} /> Import
                            </button>
                            <button onClick={handleOpenAdd} className="btn-primary">
                                <Plus size={16} /> Transaksi Baru
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Pemasukan" value={formatRupiah(summary.totalIncome)} icon={<ArrowUpRight className="text-green-600" />} iconBg="bg-green-100" />
                <StatCard title="Total Pengeluaran" value={formatRupiah(summary.totalExpense)} icon={<ArrowDownRight className="text-red-600" />} iconBg="bg-red-100" />
                <StatCard title="Saldo Saat Ini" value={formatRupiah(summary.balance)} icon={<Wallet className="text-blue-600" />} iconBg="bg-blue-100" />
            </div>

            {/* Rekening Organisasi Dashboard */}
            <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 mb-6">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2">
                        <Wallet className="text-theme-600" size={20} />
                        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Rekening Resmi Organisasi</h2>
                    </div>
                    {canEdit && (
                        <button onClick={handleOpenAddBank} className="btn-secondary text-xs">
                            <Plus size={14} /> Tambah Rekening
                        </button>
                    )}
                </div>
                {bankAccounts.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {bankAccounts.map(bank => (
                            <div key={bank.id} className="relative group p-4 rounded-xl border border-gray-100 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex items-center min-h-[100px]">
                                {/* Transparent watermark background */}
                                {bank.logo_url && (
                                    <div 
                                        className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] bg-no-repeat bg-center bg-contain mix-blend-multiply dark:mix-blend-screen scale-150 transform"
                                        style={{ backgroundImage: `url(${bank.logo_url})` }}
                                    />
                                )}
                                
                                <div className="flex w-full gap-4 relative z-10">
                                    {/* Left Side Logo */}
                                    {bank.logo_url ? (
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700">
                                            <img src={bank.logo_url} alt={bank.bank_name} className="max-w-full max-h-full object-contain" />
                                        </div>
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg bg-gray-50 dark:bg-gray-700/50 flex-shrink-0 flex items-center justify-center p-2 border border-gray-100 dark:border-gray-700">
                                            <Wallet className="text-gray-400" size={24} />
                                        </div>
                                    )}

                                    {/* Right Side Details */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-900 dark:text-white truncate">{bank.bank_name}</h3>
                                        <p className="text-sm font-mono text-gray-800 dark:text-gray-200 mt-0.5 font-semibold tracking-wide truncate">{bank.account_number}</p>
                                        <p className="text-xs text-gray-500 uppercase mt-1 truncate">A.n {bank.account_name}</p>
                                        {bank.branch_name && <p className="text-[10px] text-gray-400 mt-0.5 truncate">{bank.branch_name}</p>}
                                    </div>
                                </div>
                                
                                {canEdit && (
                                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-20">
                                        <button onClick={() => handleEditBank(bank)} className="p-1.5 text-gray-500 hover:text-theme-600 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                                            <Edit size={12} />
                                        </button>
                                        <button onClick={() => handleDeleteBank(bank.id)} className="p-1.5 text-gray-500 hover:text-red-600 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm rounded-md shadow-sm border border-gray-200 dark:border-gray-600">
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState icon={<Wallet size={32} />} title="Belum Ada Rekening" description="Tambahkan daftar rekening resmi organisasi di sini." />
                )}
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1">
                            <SearchInput value={search} onChange={setSearch} placeholder="Cari keterangan..." />
                        </div>
                        <select className="form-input sm:w-32" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                            <option value="">Semua Jenis</option>
                            <option value="pemasukan">Pemasukan</option>
                            <option value="pengeluaran">Pengeluaran</option>
                        </select>
                        <select className="form-input sm:w-32" value={monthFilter} onChange={e => setMonthFilter(e.target.value)}>
                            <option value="">Semua Bulan</option>
                            {[...Array(12)].map((_, i) => (
                                <option key={i+1} value={String(i+1).padStart(2, '0')}>{new Date(2000, i, 1).toLocaleString('id-ID', { month: 'long' })}</option>
                            ))}
                        </select>
                        <select className="form-input sm:w-32" value={yearFilter} onChange={e => setYearFilter(e.target.value)}>
                            <option value="">Semua Tahun</option>
                            {[...Array(5)].map((_, i) => {
                                const y = new Date().getFullYear() - i;
                                return <option key={y} value={y}>{y}</option>
                            })}
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
                                <th onClick={() => handleSort('date')} className="cursor-pointer hover:bg-gray-100 transition-colors">Tanggal <SortIcon column="date" /></th>
                                <th onClick={() => handleSort('type')} className="cursor-pointer hover:bg-gray-100 transition-colors">Jenis <SortIcon column="type" /></th>
                                <th onClick={() => handleSort('category')} className="cursor-pointer hover:bg-gray-100 transition-colors">Kategori <SortIcon column="category" /></th>
                                <th onClick={() => handleSort('description')} className="cursor-pointer hover:bg-gray-100 transition-colors">Keterangan <SortIcon column="description" /></th>
                                <th onClick={() => handleSort('amount')} className="text-right cursor-pointer hover:bg-gray-100 transition-colors">Jumlah <SortIcon column="amount" /></th>
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
                                    <td className="text-right">
                                        <span className={`font-semibold ${trx.type === 'pemasukan' ? 'text-green-600' : 'text-red-600'}`}>
                                            {trx.type === 'pemasukan' ? '+' : '-'} {formatRupiah(trx.amount)}
                                        </span>
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
                                        <EmptyState icon={<Wallet />} title="Tidak ada transaksi arus kas" />
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

            <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="Import Data Arus Kas">
                <form onSubmit={e => {
                    e.preventDefault();
                    postImport('/finance/import', {
                        onSuccess: () => {
                            setIsImportModalOpen(false);
                            resetImport();
                        }
                    });
                }} className="space-y-4">
                    <div className="bg-blue-50 border border-blue-100 text-blue-800 p-4 rounded-xl text-sm mb-4">
                        <p className="font-semibold mb-2">Panduan Import:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Gunakan template Excel yang disediakan agar format kolom sesuai.</li>
                            <li>Pastikan kolom Tanggal, Jenis (Pemasukan/Pengeluaran), Kategori, Nominal, dan Deskripsi terisi.</li>
                            <li>Format angka Nominal jangan menggunakan titik/koma ribuan secara manual di teks, gunakan format angka bawaan Excel atau angka biasa (contoh: 150000).</li>
                        </ul>
                        <div className="mt-3">
                            <a href="/finance/template" className="inline-flex items-center gap-1.5 text-blue-700 font-semibold hover:text-blue-900 bg-white px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors">
                                <Download size={14} /> Download Template Excel
                            </a>
                        </div>
                    </div>
                    
                    <div>
                        <label className="form-label">Pilih File Excel (.xlsx, .xls, .csv)</label>
                        <input type="file" accept=".xlsx,.xls,.csv" className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-theme-50 file:text-theme-700 hover:file:bg-theme-100" onChange={e => setImportData('file', e.target.files ? e.target.files[0] : null)} required />
                        {importErrors.file && <p className="text-red-500 text-xs mt-1">{importErrors.file}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsImportModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={importProcessing || !importData.file}>
                            {importProcessing ? 'Mengimport...' : 'Mulai Import'}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Modal Tambah/Edit Rekening */}
            <Modal isOpen={isBankModalOpen} onClose={() => setIsBankModalOpen(false)} title={editingBankId ? "Edit Rekening" : "Tambah Rekening Baru"} size="md">
                <form onSubmit={handleBankSubmit} className="p-6">
                    <div className="space-y-4">
                        <div>
                            <label className="form-label">No. Rekening</label>
                            <input type="text" className="form-input" value={bankData.account_number} onChange={e => setBankData('account_number', e.target.value)} required />
                            {bankErrors.account_number && <div className="text-red-500 text-xs mt-1">{bankErrors.account_number}</div>}
                        </div>
                        <div>
                            <label className="form-label">Nama Bank</label>
                            <input type="text" className="form-input" placeholder="Contoh: BSI / Mandiri" value={bankData.bank_name} onChange={e => setBankData('bank_name', e.target.value)} required />
                            {bankErrors.bank_name && <div className="text-red-500 text-xs mt-1">{bankErrors.bank_name}</div>}
                        </div>
                        <div>
                            <label className="form-label">Atas Nama (A.N)</label>
                            <input type="text" className="form-input" value={bankData.account_name} onChange={e => setBankData('account_name', e.target.value)} required />
                            {bankErrors.account_name && <div className="text-red-500 text-xs mt-1">{bankErrors.account_name}</div>}
                        </div>
                        <div>
                            <label className="form-label">Cabang Bank (Opsional)</label>
                            <input type="text" className="form-input" value={bankData.branch_name} onChange={e => setBankData('branch_name', e.target.value)} />
                            {bankErrors.branch_name && <div className="text-red-500 text-xs mt-1">{bankErrors.branch_name}</div>}
                        </div>
                        <div>
                            <label className="form-label">Logo Bank (Opsional)</label>
                            <input type="file" accept="image/*" className="form-input text-sm p-2" onChange={e => setBankData('logo', e.target.files?.[0] || null)} />
                            {bankErrors.logo && <div className="text-red-500 text-xs mt-1">{bankErrors.logo}</div>}
                            <p className="text-xs text-gray-400 mt-1">Gunakan gambar persegi (contoh: PNG transparan) untuk hasil terbaik.</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-6">
                        <button type="button" onClick={() => setIsBankModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={bankProcessing}>{editingBankId ? 'Simpan Perubahan' : 'Tambah Rekening'}</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
