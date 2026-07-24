import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard, StatusBadge, Modal, formatRupiah, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, CheckCircle, CreditCard, XCircle, ArrowUpRight, ArrowDownRight, Wallet, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { confirmAction } from '@/Utils/swal';

interface Period {
    id: number;
    month: number;
    year: number;
    amount: string;
    due_date: string;
}

interface Payment {
    id: number;
    member_id: number;
    dues_period_id: number;
    amount: string;
    status: string;
    paid_at: string | null;
    member: {
        nama_lengkap: string;
        no_induk_anggota: string;
    };
}

interface Props {
    periods: { data: Period[]; meta?: any };
    currentPeriod?: Period;
    payments: { data: Payment[]; meta: any };
    filters: { period_id: string; status: string };
    dashboardStats: { total_paid: number; total_unpaid: number };
    chartData: any[];
}

export default function DuesIndex({ periods, currentPeriod, payments, filters, dashboardStats, chartData }: Props) {
    const [periodFilter, setPeriodFilter] = useState(filters.period_id || (currentPeriod?.id.toString() || ''));
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Sorting & Pagination States
    const [sortBy, setSortBy] = useState<string>('');
    const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
    const [perPage, setPerPage] = useState<number | 'all'>(10);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear(),
        amount: '50000',
        due_date: ''
    });

    const handleFilter = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/dues', { period_id: periodFilter, status: statusFilter }, { preserveState: true });
    };

    const handlePay = async (id: number) => {
        if (await confirmAction('Tandai iuran ini sebagai lunas?')) {
            const today = new Date().toISOString().split('T')[0];
            router.post(`/dues/${id}/pay`, { paid_date: today });
        }
    };

    const handleBulkPay = async () => {
        if (selectedIds.length === 0) return;
        if (await confirmAction(`Tandai ${selectedIds.length} iuran ini sebagai lunas?`)) {
            const today = new Date().toISOString().split('T')[0];
            router.post('/dues/bulk-pay', { payment_ids: selectedIds, paid_date: today }, {
                onSuccess: () => setSelectedIds([])
            });
        }
    };

    const handleUnpay = async (id: number) => {
        if (await confirmAction('Batalkan status lunas iuran ini? (Status akan kembali menjadi belum lunas)')) {
            router.post(`/dues/${id}/unpay`);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/dues', {
            onSuccess: () => {
                setIsAddModalOpen(false);
                reset();
            }
        });
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['payments', 'periods', 'currentPeriod', 'dashboardStats', 'chartData'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleSort = (column: string) => {
        if (sortBy === column) {
            setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortDir('asc');
        }
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400 inline ml-1 opacity-50" />;
        return sortDir === 'asc' ? <ArrowUp size={14} className="text-theme-600 inline ml-1" /> : <ArrowDown size={14} className="text-theme-600 inline ml-1" />;
    };

    // Data Processing
    let processedPayments = [...payments.data];
    if (sortBy) {
        processedPayments.sort((a: any, b: any) => {
            let valA = '';
            let valB = '';
            if (sortBy === 'anggota') { valA = a.member.nama_lengkap; valB = b.member.nama_lengkap; }
            else if (sortBy === 'nomor_anggota') { valA = a.member.no_induk_anggota; valB = b.member.no_induk_anggota; }
            else if (sortBy === 'jumlah') { valA = a.amount; valB = b.amount; }
            else if (sortBy === 'status') { valA = a.status; valB = b.status; }
            else if (sortBy === 'tanggal') { valA = a.paid_at || ''; valB = b.paid_at || ''; }
            
            if (valA < valB) return sortDir === 'asc' ? -1 : 1;
            if (valA > valB) return sortDir === 'asc' ? 1 : -1;
            return 0;
        });
    }

    const totalItems = processedPayments.length;
    const totalPages = perPage === 'all' ? 1 : Math.ceil(totalItems / (perPage as number));
    
    // Ensure current page is valid when data shrinks
    if (currentPage > totalPages && totalPages > 0) {
        setCurrentPage(totalPages);
    }

    let paginatedPayments = processedPayments;
    if (perPage !== 'all') {
        const start = (currentPage - 1) * (perPage as number);
        paginatedPayments = processedPayments.slice(start, start + (perPage as number));
    }

    const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return (
        <AppLayout>
            <Head title="Manajemen Iuran" />

            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title">Manajemen Iuran</h1>
                    <p className="page-subtitle">Kelola iuran wajib anggota BSMI.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                        className="btn-secondary text-sm flex items-center gap-1.5 h-[38px] px-4" 
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button onClick={() => setIsAddModalOpen(true)} className="btn-primary text-sm flex items-center gap-1.5 h-[38px] px-4">
                        <Plus size={16} /> Buat Periode Baru
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                <div className="flex flex-col gap-4">
                    <StatCard title="Lunas (Bulan Ini)" value={formatRupiah(dashboardStats?.total_paid || 0)} icon={<ArrowUpRight className="text-green-600" />} iconBg="bg-green-100" />
                    <StatCard title="Belum Lunas (Bulan Ini)" value={formatRupiah(dashboardStats?.total_unpaid || 0)} icon={<ArrowDownRight className="text-red-600" />} iconBg="bg-red-100" />
                </div>

                <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-base sm:text-lg font-bold text-gray-800 dark:text-white">Grafik Pembayaran Iuran</h2>
                            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">Perbandingan iuran lunas dan belum lunas — 6 Periode Terakhir</p>
                        </div>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400">Lunas</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></span>
                                <span className="text-[10px] sm:text-xs font-semibold text-gray-500 dark:text-gray-400">Belum Lunas</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[200px] sm:h-[240px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData || []} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="gradLunas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#10B981" stopOpacity={0.25}/>
                                        <stop offset="100%" stopColor="#10B981" stopOpacity={0.02}/>
                                    </linearGradient>
                                    <linearGradient id="gradBelumLunas" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.2}/>
                                        <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.02}/>
                                    </linearGradient>
                                </defs>

                                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#e5e7eb" strokeOpacity={0.5} />
                                <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 600, fill: '#9ca3af' }} dy={8} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#9ca3af' }} tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)} jt` : val >= 1000 ? `${(val / 1000).toFixed(0)} rb` : `${val}`} dx={-5} width={45} />
                                
                                <Tooltip
                                    content={({ active, payload, label }: any) => {
                                        if (!active || !payload?.length) return null;
                                        return (
                                            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 min-w-[150px]">
                                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                                                {payload.map((entry: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between gap-4 py-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                                            <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{entry.name}</span>
                                                        </div>
                                                        <span className="text-[10px] font-bold text-gray-800 dark:text-white">{formatRupiah(entry.value)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        );
                                    }}
                                    cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                />

                                <Area type="natural" dataKey="lunas" name="Lunas" stroke="#10B981" strokeWidth={2} fill="url(#gradLunas)" activeDot={{ r: 4, fill: '#10B981', stroke: '#fff', strokeWidth: 2 }} />
                                <Area type="natural" dataKey="belum_lunas" name="Belum Lunas" stroke="#F43F5E" strokeWidth={2} fill="url(#gradBelumLunas)" activeDot={{ r: 4, fill: '#F43F5E', stroke: '#fff', strokeWidth: 2 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="card mb-6">
                <div className="card-body p-4 sm:p-5">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="w-full sm:w-48">
                            <label className="form-label text-xs mb-1">Periode Iuran</label>
                            <select className="form-input text-sm py-1.5" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
                                <option value="">Pilih Periode...</option>
                                {periods.data.map(p => (
                                    <option key={p.id} value={p.id}>{monthNames[p.month]} {p.year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="w-full sm:w-48">
                            <label className="form-label text-xs mb-1">Status Pembayaran</label>
                            <select className="form-input text-sm py-1.5" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="paid">Lunas</option>
                                <option value="unpaid">Belum Lunas</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-secondary h-[34px] px-4 text-sm w-full sm:w-auto">Tampilkan</button>
                    </form>
                </div>
            </div>

            {currentPeriod && (
                <div className="mb-6 bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-red-800 font-semibold">Periode: {monthNames[currentPeriod.month]} {currentPeriod.year}</h2>
                        <p className="text-red-600 text-sm">Jatuh Tempo: {formatDate(currentPeriod.due_date)}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-red-800 font-bold text-xl">{formatRupiah(currentPeriod.amount)}</p>
                        <p className="text-red-600 text-sm">Tarif per Anggota</p>
                    </div>
                </div>
            )}

            <div className="card overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-center bg-gray-50/50 gap-4">
                    <div className="text-sm text-gray-500">
                        Tampilkan
                        <select 
                            className="mx-2 form-input py-1 px-2 w-20 inline-block text-sm" 
                            value={perPage} 
                            onChange={e => {
                                setPerPage(e.target.value === 'all' ? 'all' : Number(e.target.value));
                                setCurrentPage(1);
                            }}
                        >
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                            <option value="all">Semua</option>
                        </select>
                        data
                    </div>
                    {selectedIds.length > 0 && (
                        <button onClick={handleBulkPay} className="btn-success h-[34px] px-4 text-sm flex items-center gap-2">
                            <CheckCircle size={16} /> Tandai Lunas ({selectedIds.length})
                        </button>
                    )}
                </div>
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th className="w-10">
                                    <input 
                                        type="checkbox" 
                                        className="form-checkbox text-theme-600 rounded border-gray-300 focus:ring-theme-500"
                                        checked={paginatedPayments.filter(p => p.status === 'unpaid').length > 0 && paginatedPayments.filter(p => p.status === 'unpaid').every(p => selectedIds.includes(p.id))}
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                const unpaids = paginatedPayments.filter(p => p.status === 'unpaid').map(p => p.id);
                                                setSelectedIds([...new Set([...selectedIds, ...unpaids])]);
                                            } else {
                                                const unpaidsOnPage = paginatedPayments.filter(p => p.status === 'unpaid').map(p => p.id);
                                                setSelectedIds(selectedIds.filter(id => !unpaidsOnPage.includes(id)));
                                            }
                                        }}
                                    />
                                </th>
                                <th>No</th>
                                <th onClick={() => handleSort('anggota')} className="cursor-pointer hover:bg-gray-100 transition-colors">Anggota <SortIcon column="anggota" /></th>
                                <th onClick={() => handleSort('nomor_anggota')} className="cursor-pointer hover:bg-gray-100 transition-colors">Nomor Anggota <SortIcon column="nomor_anggota" /></th>
                                <th onClick={() => handleSort('jumlah')} className="cursor-pointer hover:bg-gray-100 transition-colors">Jumlah <SortIcon column="jumlah" /></th>
                                <th onClick={() => handleSort('status')} className="cursor-pointer hover:bg-gray-100 transition-colors">Status <SortIcon column="status" /></th>
                                <th onClick={() => handleSort('tanggal')} className="cursor-pointer hover:bg-gray-100 transition-colors">Tanggal Bayar <SortIcon column="tanggal" /></th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedPayments.length > 0 ? paginatedPayments.map((payment, index) => (
                                <tr key={payment.id}>
                                    <td className="w-10">
                                        {payment.status === 'unpaid' && (
                                            <input 
                                                type="checkbox" 
                                                className="form-checkbox text-theme-600 rounded border-gray-300 focus:ring-theme-500"
                                                checked={selectedIds.includes(payment.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedIds([...selectedIds, payment.id]);
                                                    } else {
                                                        setSelectedIds(selectedIds.filter(id => id !== payment.id));
                                                    }
                                                }}
                                            />
                                        )}
                                    </td>
                                    <td className="text-gray-500">{perPage === 'all' ? index + 1 : (currentPage - 1) * (perPage as number) + index + 1}</td>
                                    <td className="font-medium text-gray-900 dark:text-white">{payment.member.nama_lengkap}</td>
                                    <td>{payment.member.no_induk_anggota}</td>
                                    <td>{formatRupiah(payment.amount)}</td>
                                    <td><StatusBadge status={payment.status} /></td>
                                    <td>{formatDate(payment.paid_at)}</td>
                                    <td className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {payment.status !== 'paid' ? (
                                                <button onClick={() => handlePay(payment.id)} className="btn-success py-1 px-2 text-xs">
                                                    <CheckCircle size={14} /> Bayar
                                                </button>
                                            ) : (
                                                <button onClick={() => handleUnpay(payment.id)} className="btn-secondary py-1 px-2 text-xs flex items-center gap-1">
                                                    <XCircle size={14} /> Batal Lunas
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState icon={<CreditCard />} title="Tidak ada data iuran" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {totalPages > 1 && (
                    <div className="p-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Menampilkan {(currentPage - 1) * (perPage as number) + 1} hingga {Math.min(currentPage * (perPage as number), totalItems)} dari {totalItems} entri
                        </div>
                        <div className="flex gap-1">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1}
                                className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            {Array.from({length: totalPages}, (_, i) => i + 1).map(page => (
                                <button
                                    key={page}
                                    onClick={() => setCurrentPage(page)}
                                    className={`w-8 h-8 rounded text-sm font-medium border ${currentPage === page ? 'bg-theme-600 border-theme-600 text-white' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                                >
                                    {page}
                                </button>
                            ))}
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages}
                                className="p-1 rounded border border-gray-200 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Buat Periode Iuran">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 mb-4">
                        Membuat periode baru akan secara otomatis men-generate tagihan untuk semua anggota yang berstatus <b>Aktif</b>.
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Bulan</label>
                            <select className="form-input" value={data.month} onChange={e => setData('month', parseInt(e.target.value))}>
                                {monthNames.map((name, i) => i > 0 && <option key={i} value={i}>{name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="form-label">Tahun</label>
                            <input type="number" className="form-input" value={data.year} onChange={e => setData('year', parseInt(e.target.value))} required />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Nominal Iuran (Rp)</label>
                            <input type="number" className="form-input" value={data.amount} onChange={e => setData('amount', e.target.value)} required />
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Tanggal Jatuh Tempo</label>
                            <input type="date" className="form-input" value={data.due_date} onChange={e => setData('due_date', e.target.value)} required />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>Generate Tagihan</button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
