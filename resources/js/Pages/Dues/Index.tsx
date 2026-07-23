import React, { useState } from 'react';
import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard, StatusBadge, Modal, formatRupiah, formatDate, EmptyState } from '@/Components/Shared';
import { Plus, CheckCircle, CreditCard, XCircle } from 'lucide-react';
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
}

export default function DuesIndex({ periods, currentPeriod, payments, filters }: Props) {
    const [periodFilter, setPeriodFilter] = useState(filters.period_id || (currentPeriod?.id.toString() || ''));
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

    const monthNames = ["", "Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

    return (
        <AppLayout>
            <Head title="Manajemen Iuran" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Manajemen Iuran</h1>
                    <p className="page-subtitle">Kelola iuran wajib anggota BSMI.</p>
                </div>
                <button onClick={() => setIsAddModalOpen(true)} className="btn-primary">
                    <Plus size={16} /> Buat Periode Baru
                </button>
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="form-label">Periode Iuran</label>
                            <select className="form-input" value={periodFilter} onChange={e => setPeriodFilter(e.target.value)}>
                                <option value="">Pilih Periode...</option>
                                {periods.data.map(p => (
                                    <option key={p.id} value={p.id}>{monthNames[p.month]} {p.year}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex-1">
                            <label className="form-label">Status Pembayaran</label>
                            <select className="form-input" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                                <option value="">Semua Status</option>
                                <option value="paid">Lunas</option>
                                <option value="unpaid">Belum Lunas</option>
                            </select>
                        </div>
                        <button type="submit" className="btn-secondary h-[38px]">Tampilkan</button>
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
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Anggota</th>
                                <th>Nomor Anggota</th>
                                <th>Jumlah</th>
                                <th>Status</th>
                                <th>Tanggal Bayar</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.data.length > 0 ? payments.data.map(payment => (
                                <tr key={payment.id}>
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
                                    <td colSpan={6}>
                                        <EmptyState icon={<CreditCard />} title="Tidak ada data iuran" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
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
