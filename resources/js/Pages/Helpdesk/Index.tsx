import React from 'react';
import { Head, useForm, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { LifeBuoy, Send, MessageSquare, Phone, Mail, MapPin, Settings } from 'lucide-react';
import { StatusBadge } from '@/Components/Shared';

export default function HelpdeskIndex({ organization, myTickets }: any) {
    const { data, setData, post, processing, reset, errors } = useForm({
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/helpdesk', {
            onSuccess: () => reset(),
        });
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
            <Head title="Pengaduan & Helpdesk Support" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                        <LifeBuoy className="text-theme-600" size={32} />
                        Pengaduan & Helpdesk Support
                    </h1>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">
                        Sampaikan pertanyaan, kendala, atau pengaduan terkait penggunaan sistem BSMI Hub.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Form Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                    <MessageSquare size={20} className="text-theme-600" />
                                    Buat Tiket Baru
                                </h2>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subjek Pengaduan / Pertanyaan</label>
                                    <input
                                        type="text"
                                        value={data.subject}
                                        onChange={e => setData('subject', e.target.value)}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                                        placeholder="Contoh: Kesulitan saat mengekspor data anggota"
                                        required
                                    />
                                    {errors.subject && <p className="mt-1 text-sm text-red-500">{errors.subject}</p>}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pesan / Deskripsi Kendala</label>
                                    <textarea
                                        value={data.message}
                                        onChange={e => setData('message', e.target.value)}
                                        rows={5}
                                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-2.5 text-sm focus:ring-theme-500 bg-white dark:bg-gray-700 dark:text-white"
                                        placeholder="Jelaskan secara detail kendala atau pertanyaan yang Anda alami..."
                                        required
                                    />
                                    {errors.message && <p className="mt-1 text-sm text-red-500">{errors.message}</p>}
                                </div>
                                <div className="flex justify-end pt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-6 py-2.5 text-sm font-medium text-white bg-theme-600 hover:bg-theme-700 disabled:opacity-50 rounded-xl shadow-sm shadow-theme-200 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Send size={16} />
                                        {processing ? 'Mengirim...' : 'Kirim Pengaduan'}
                                    </button>
                                </div>
                            </form>
                        </div>

                    {/* Right Column: Contact Info */}
                    <div className="space-y-6">
                        <div className="bg-gradient-to-br from-theme-600 to-theme-800 rounded-2xl shadow-lg overflow-hidden text-white relative">
                            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                                <LifeBuoy size={120} />
                            </div>
                            <div className="p-6 relative z-10">
                                <h3 className="text-xl font-bold mb-1">Kontak Helpdesk</h3>
                                <p className="text-theme-100 text-sm mb-6">Butuh bantuan cepat? Hubungi kami melalui saluran berikut.</p>

                                <div className="space-y-4">
                                    {organization?.phone && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                                <Phone size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-theme-100 uppercase tracking-wider mb-0.5">WhatsApp (Chat Only)</p>
                                                <a href={`https://wa.me/${organization.phone.replace(/\D/g,'')}`} target="_blank" rel="noreferrer" className="font-semibold hover:text-white transition-colors">
                                                    {organization.phone}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {organization?.email && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                                <Mail size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-theme-100 uppercase tracking-wider mb-0.5">Email Support</p>
                                                <a href={`mailto:${organization.email}`} className="font-semibold hover:text-white transition-colors">
                                                    {organization.email}
                                                </a>
                                            </div>
                                        </div>
                                    )}
                                    {organization?.address && (
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0 backdrop-blur-md">
                                                <MapPin size={18} />
                                            </div>
                                            <div>
                                                <p className="text-xs text-theme-100 uppercase tracking-wider mb-0.5">Kantor Sekretariat</p>
                                                <p className="font-medium text-sm leading-relaxed">
                                                    {organization.address}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section: History Card */}
                {myTickets.length > 0 && (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">Riwayat Pengaduan Saya</h2>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {myTickets.map((ticket: any) => (
                                <div key={ticket.id} className="p-6">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                        <h3 className="font-bold text-gray-900 dark:text-white">{ticket.subject}</h3>
                                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-lg border ${getStatusColor(ticket.status)}`}>
                                            {getStatusLabel(ticket.status)}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 whitespace-pre-wrap">
                                        {ticket.message}
                                    </p>
                                    <div className="text-xs text-gray-400">
                                        Dikirim pada: {new Date(ticket.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute:'2-digit' })}
                                    </div>
                                    {ticket.admin_response && (
                                        <div className="mt-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-100 dark:border-gray-700">
                                            <div className="flex items-center gap-2 mb-2">
                                                <MessageSquare size={16} className="text-theme-600" />
                                                <span className="text-theme-600 font-bold text-xs uppercase tracking-wider">Tanggapan Admin</span>
                                            </div>
                                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap italic text-justify">
                                                {ticket.admin_response}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
