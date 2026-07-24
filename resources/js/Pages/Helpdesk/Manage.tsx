import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { LifeBuoy, Settings, CheckCircle, Clock, Trash2, XCircle, Search, RefreshCw } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';
import { Modal } from '@/Components/Shared';

export default function HelpdeskManage({ tickets }: any) {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false);
    const [adminResponse, setAdminResponse] = useState('');

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['tickets'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleStatusChange = (ticketId: number, status: string) => {
        if (status === 'resolved') {
            setSelectedTicketId(ticketId);
            setAdminResponse('');
            setIsResponseModalOpen(true);
        } else {
            router.patch(`/helpdesk/${ticketId}/status`, { status }, {
                preserveScroll: true,
            });
        }
    };

    const submitResponse = () => {
        if (selectedTicketId) {
            router.patch(`/helpdesk/${selectedTicketId}/status`, { 
                status: 'resolved', 
                admin_response: adminResponse 
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    setIsResponseModalOpen(false);
                    setSelectedTicketId(null);
                }
            });
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'resolved': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'open': return 'Menunggu Respons';
            case 'in_progress': return 'Diproses';
            case 'resolved': return 'Selesai';
            case 'closed': return 'Ditutup';
            default: return status;
        }
    };

    return (
        <AppLayout>
            <Head title="Manajemen Pengaduan" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                            <Settings className="text-theme-600" size={32} />
                            Manajemen Pengaduan
                        </h1>
                        <p className="mt-2 text-gray-500 dark:text-gray-400">
                            Kelola tiket pengaduan dan pertanyaan dari pengguna sistem.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <button 
                            onClick={handleRefresh} 
                            disabled={isRefreshing}
                            className="bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm flex items-center gap-1.5 h-[38px] px-4 transition-colors" 
                            title="Refresh Data"
                        >
                            <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pengguna</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Subjek & Pesan</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Tanggal</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {tickets.data.map((ticket: any) => (
                                    <tr key={ticket.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-semibold text-gray-900 dark:text-white">{ticket.user?.name || 'User Dihapus'}</div>
                                            <div className="text-xs text-gray-500">{ticket.user?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 max-w-md">
                                            <div className="font-semibold text-gray-900 dark:text-white truncate">{ticket.subject}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{ticket.message}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusColor(ticket.status)}`}>
                                                {getStatusLabel(ticket.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                className="text-sm border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:border-theme-500 focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                                            >
                                                <option value="open">Menunggu Respons</option>
                                                <option value="in_progress">Diproses</option>
                                                <option value="resolved">Selesai</option>
                                                <option value="closed">Ditutup</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {tickets.data.length === 0 && (
                            <div className="p-12 text-center text-gray-500">
                                <LifeBuoy size={48} className="mx-auto mb-4 text-gray-300" />
                                <p>Belum ada tiket pengaduan masuk.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Modal isOpen={isResponseModalOpen} onClose={() => setIsResponseModalOpen(false)} title="Beri Tanggapan / Balasan" size="md">
                <div className="p-6">
                    <p className="text-sm text-gray-500 mb-4">Tambahkan catatan atau tanggapan Anda terkait penyelesaian pengaduan ini agar dapat dibaca oleh pengguna. Status akan otomatis berubah menjadi Ditutup setelah tanggapan dikirim.</p>
                    <textarea
                        className="form-input w-full min-h-[120px] resize-y mb-4"
                        placeholder="Tuliskan balasan/catatan Anda di sini..."
                        value={adminResponse}
                        onChange={(e) => setAdminResponse(e.target.value)}
                        required
                    />
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsResponseModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="button" onClick={submitResponse} disabled={!adminResponse.trim()} className="btn-primary">Kirim & Tutup Tiket</button>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
