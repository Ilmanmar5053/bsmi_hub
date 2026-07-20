import React from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Plus, Package, FileText, Eye, MapPin } from 'lucide-react';
import { EmptyState, Pagination } from '@/Components/Shared';

interface Props {
    deliveryNotes: {
        data: any[];
        links: any[];
    };
}

export default function DeliveryNotesIndex({ deliveryNotes }: Props) {
    const { props } = usePage<any>();
    const canManageLogistics = props.auth?.permissions?.includes('manage-logistics');

    return (
        <AppLayout>
            <Head title="Surat Jalan - Logistik" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Logistik & Inventaris</h1>
                    <p className="page-subtitle">Kelola stok barang dan bantuan.</p>
                </div>
                <div className="flex gap-2">
                    {canManageLogistics && (
                        <Link href="/delivery-notes/create" className="btn-primary flex items-center gap-2">
                            <Plus size={16} /> Buat Surat Jalan
                        </Link>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700 mb-6">
                <Link href="/logistics" className="px-4 py-2 border-b-2 border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 font-medium text-sm flex items-center gap-2 transition-colors">
                    <Package size={16} /> Stok & Transaksi
                </Link>
                <Link href="/delivery-notes" className="px-4 py-2 border-b-2 border-theme-600 text-theme-600 font-medium text-sm flex items-center gap-2">
                    <FileText size={16} /> Surat Jalan
                </Link>
            </div>

            <div className="card">
                <div className="card-header">
                    <h2 className="font-semibold text-lg">Daftar Surat Jalan (Pengeluaran Barang)</h2>
                </div>
                <div className="table-container">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>No. Surat Jalan</th>
                                <th>Tanggal</th>
                                <th>Tujuan</th>
                                <th>Driver / Plat</th>
                                <th>Jumlah Item</th>
                                <th className="text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {deliveryNotes.data.length > 0 ? (
                                deliveryNotes.data.map((note) => (
                                    <tr key={note.id}>
                                        <td className="font-medium text-gray-900 dark:text-white">
                                            {note.document_number}
                                        </td>
                                        <td>{note.date}</td>
                                        <td>
                                            <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                                                <MapPin size={14} className="shrink-0" />
                                                <span className="truncate max-w-[200px]" title={note.destination}>{note.destination}</span>
                                            </div>
                                        </td>
                                        <td>
                                            {note.driver_name ? (
                                                <div className="text-sm">
                                                    <div>{note.driver_name}</div>
                                                    <div className="text-xs text-gray-500">{note.vehicle_plate || '-'}</div>
                                                </div>
                                            ) : '-'}
                                        </td>
                                        <td>{note.total_items} Jenis Barang</td>
                                        <td className="text-right">
                                            <a 
                                                href={`/delivery-notes/${note.id}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center justify-center p-2 text-theme-600 bg-theme-50 hover:bg-theme-100 rounded-lg transition-colors dark:bg-theme-900/20 dark:hover:bg-theme-900/40"
                                                title="Cetak Surat Jalan"
                                            >
                                                <Eye size={16} />
                                            </a>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="py-8">
                                        <EmptyState
                                            icon={<FileText size={32} className="text-gray-400" />}
                                            title="Belum ada Surat Jalan"
                                            description="Daftar surat jalan pengeluaran barang akan tampil di sini."
                                        />
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {deliveryNotes.links && deliveryNotes.data.length > 0 && (
                    <div className="p-4 border-t border-gray-100 dark:border-gray-800">
                        <Pagination links={deliveryNotes.links} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
