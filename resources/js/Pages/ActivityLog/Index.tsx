import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { SearchInput, EmptyState, formatDate } from '@/Components/Shared';
import { ShieldAlert, Activity, FileText, UserCircle2, ArrowRight } from 'lucide-react';

interface LogData {
    id: number;
    log_name: string;
    description: string;
    subject_type: string | null;
    subject_id: number | null;
    causer_type: string | null;
    causer_id: number | null;
    properties: any;
    created_at: string;
    causer: { name: string; email: string } | null;
}

interface Props {
    logs: {
        data: LogData[];
        links: any[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
    };
    filters: {
        search?: string;
        event?: string;
        date_start?: string;
        date_end?: string;
        per_page?: string;
    };
}

export default function ActivityLogIndex({ logs, filters }: Props) {
    const [search, setSearch] = useState(filters.search || '');
    const [eventFilter, setEventFilter] = useState(filters.event || '');
    const [dateStart, setDateStart] = useState(filters.date_start || '');
    const [dateEnd, setDateEnd] = useState(filters.date_end || '');
    const [perPage, setPerPage] = useState(filters.per_page || '25');
    const [expandedLog, setExpandedLog] = useState<number | null>(null);

    const handleFilter = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        router.get('/activity-logs', { 
            search, 
            event: eventFilter, 
            date_start: dateStart,
            date_end: dateEnd,
            per_page: perPage 
        }, { preserveState: true });
    };

    const handlePerPageChange = (value: string) => {
        setPerPage(value);
        router.get('/activity-logs', { 
            search, 
            event: eventFilter, 
            date_start: dateStart,
            date_end: dateEnd,
            per_page: value 
        }, { preserveState: true });
    };

    const getLogColor = (description: string, logName: string) => {
        if (logName === 'authentication') {
            if (description.includes('Failed')) return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800/50';
            if (description.includes('logged out')) return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
            return 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
        }
        if (logName === 'page_access') return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50';
        if (description === 'created') return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/50';
        if (description === 'updated') return 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
        if (description === 'deleted') return 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 dark:text-rose-400 border-rose-200 dark:border-rose-800/50';
        return 'text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700';
    };

    const getLogIcon = (description: string, logName: string) => {
        if (logName === 'authentication') return <ShieldAlert size={16} />;
        if (logName === 'page_access') return <Activity size={16} />;
        if (description === 'created') return <Activity size={16} />;
        if (description === 'updated') return <FileText size={16} />;
        return <Activity size={16} />;
    };

    return (
        <AppLayout>
            <Head title="Log Aktivitas" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Log Aktivitas Sistem</h1>
                    <p className="page-subtitle">Riwayat seluruh aktivitas pengguna dan perubahan data dalam sistem (Audit Trail).</p>
                </div>
            </div>

            <div className="card mb-6 border border-gray-200 dark:border-gray-800">
                <div className="card-body p-4 bg-gray-50/50 dark:bg-gray-900/50">
                    <form onSubmit={handleFilter} className="flex flex-col sm:flex-row gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Pencarian</label>
                            <SearchInput value={search} onChange={setSearch} placeholder="Cari nama, email, modul..." />
                        </div>
                        <div className="w-full sm:w-48">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Tipe Aksi</label>
                            <select className="form-input !py-2" value={eventFilter} onChange={e => { setEventFilter(e.target.value); setTimeout(handleFilter, 100); }}>
                                <option value="">Semua Aksi</option>
                                <option value="created">Created (Data Baru)</option>
                                <option value="updated">Updated (Perubahan Data)</option>
                                <option value="deleted">Deleted (Penghapusan)</option>
                                <option value="page_access">Page Access (Membuka Modul)</option>
                            </select>
                        </div>
                        <div className="w-full sm:w-40">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Tanggal Mulai</label>
                            <input type="date" className="form-input !py-2" value={dateStart} onChange={e => setDateStart(e.target.value)} />
                        </div>
                        <div className="w-full sm:w-40">
                            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 block">Tanggal Akhir</label>
                            <input type="date" className="form-input !py-2" value={dateEnd} onChange={e => setDateEnd(e.target.value)} />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="btn-primary w-full h-[42px]">Filter Data</button>
                        </div>
                    </form>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="table-container border-0 rounded-none">
                    <table className="data-table">
                        <thead className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                            <tr>
                                <th className="w-12 !py-2 !px-3 text-left font-semibold text-xs uppercase tracking-wider">No</th>
                                <th className="!py-2 !px-3 text-left font-semibold text-xs uppercase tracking-wider">Waktu</th>
                                <th className="!py-2 !px-3 text-left font-semibold text-xs uppercase tracking-wider">Pengguna</th>
                                <th className="!py-2 !px-3 text-left font-semibold text-xs uppercase tracking-wider">Modul / Log Name</th>
                                <th className="!py-2 !px-3 text-left font-semibold text-xs uppercase tracking-wider">Aktivitas</th>
                                <th className="text-center w-16 !py-2 !px-3 font-semibold text-xs uppercase tracking-wider">Detail</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {logs.data.length > 0 ? logs.data.map((log, i) => (
                                <React.Fragment key={log.id}>
                                    <tr className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                        <td className="text-gray-500 font-medium !py-2 !px-3 text-sm">{(logs.from || 1) + i}</td>
                                        <td className="!py-2 !px-3 text-sm">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-800 dark:text-gray-200">{formatDate(log.created_at)}</span>
                                                <span className="text-xs text-gray-500">{new Date(log.created_at).toLocaleTimeString('id-ID')}</span>
                                            </div>
                                        </td>
                                        <td className="!py-2 !px-3 text-sm">
                                            {log.causer ? (
                                                <div className="flex flex-col">
                                                    <span className="font-medium text-gray-800 dark:text-gray-200">{log.causer.name}</span>
                                                    <span className="text-xs text-gray-500">{log.causer.email}</span>
                                                </div>
                                            ) : (
                                                <span className="italic text-gray-400">System / Guest</span>
                                            )}
                                        </td>
                                        <td className="!py-2 !px-3 text-sm">
                                            <span className="font-medium text-gray-700 dark:text-gray-300">
                                                {log.log_name.toUpperCase().replace('_', ' ')}
                                            </span>
                                            {log.subject_type && (
                                                <span className="text-[10px] text-gray-500 ml-2">ID: {log.subject_id}</span>
                                            )}
                                        </td>
                                        <td className="!py-2 !px-3">
                                            <div className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase border ${getLogColor(log.description, log.log_name)}`}>
                                                {log.description}
                                            </div>
                                        </td>
                                        <td className="text-center !py-2 !px-3">
                                            {Object.keys(log.properties).length > 0 && (
                                                <button 
                                                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                                                    className="inline-flex items-center justify-center w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                                                    title="Detail"
                                                >
                                                    <Activity size={14} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                    {expandedLog === log.id && (
                                        <tr className="bg-slate-50 dark:bg-slate-900/50">
                                            <td colSpan={6} className="p-0">
                                                <div className="p-4 border-l-4 border-theme-500 m-4 rounded-r-lg bg-white dark:bg-gray-900 shadow-sm">
                                                    <h4 className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                                                        <FileText size={16} className="text-theme-500" />
                                                        Detail Perubahan Data
                                                    </h4>
                                                    
                                                    {log.properties.attributes && log.properties.old ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                            <div>
                                                                <p className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">Data Lama (Before)</p>
                                                                <pre className="text-xs bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 p-3 rounded-lg overflow-x-auto border border-rose-100 dark:border-rose-900/30">
                                                                    {JSON.stringify(log.properties.old, null, 2)}
                                                                </pre>
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-semibold text-emerald-500 uppercase tracking-wider mb-2">Data Baru (After)</p>
                                                                <pre className="text-xs bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 p-3 rounded-lg overflow-x-auto border border-emerald-100 dark:border-emerald-900/30">
                                                                    {JSON.stringify(log.properties.attributes, null, 2)}
                                                                </pre>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <pre className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 p-3 rounded-lg overflow-x-auto">
                                                            {JSON.stringify(log.properties, null, 2)}
                                                        </pre>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            )) : (
                                <tr>
                                    <td colSpan={6}>
                                        <EmptyState icon={<ShieldAlert />} title="Tidak ada log aktivitas" />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-900/50">
                    <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span>Tampilkan</span>
                        <select
                            className="form-input !py-1.5 !px-2 !w-20 text-sm"
                            value={perPage}
                            onChange={e => handlePerPageChange(e.target.value)}
                        >
                            <option value="10">10</option>
                            <option value="25">25</option>
                            <option value="50">50</option>
                            <option value="all">All</option>
                        </select>
                        <span>data per halaman</span>
                        {logs.total !== undefined && (
                            <span className="text-gray-400">• Total: <strong className="text-gray-600 dark:text-gray-300">{logs.total}</strong> log</span>
                        )}
                    </div>

                    {logs.links && logs.last_page && logs.last_page > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-1 mt-3 sm:mt-0">
                            {logs.links.map((link: any, idx: number) => (
                                <button
                                    key={idx}
                                    disabled={!link.url}
                                    onClick={() => link.url && router.get(link.url, {}, { preserveState: true })}
                                    className={`px-3 py-1.5 text-sm rounded transition-colors ${
                                        link.active
                                            ? 'bg-theme-600 text-white font-bold'
                                            : link.url
                                                ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                : 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </AppLayout>
    );
}
