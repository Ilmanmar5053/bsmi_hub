import React, { useState } from 'react';
import { Head } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
    FileText, Users, UserCog, Heart, Package, BarChart3,
    CreditCard, Download, Calendar, Filter
} from 'lucide-react';

interface FilterState {
    status?: string;
    division?: string;
    jabatan?: string;
    type?: string;
    start_date?: string;
    end_date?: string;
    category?: string;
    condition?: string;
    period_id?: string;
}

export default function ReportsIndex() {
    const [activeTab, setActiveTab] = useState('anggota');
    const [filters, setFilters] = useState<FilterState>({});
    const [isDownloading, setIsDownloading] = useState(false);

    const tabs = [
        { id: 'anggota', label: 'Data Anggota', icon: <Users size={18} /> },
        { id: 'pengurus', label: 'Data Pengurus', icon: <UserCog size={18} /> },
        { id: 'relawan', label: 'Data Relawan', icon: <Heart size={18} /> },
        { id: 'keuangan', label: 'Keuangan', icon: <BarChart3 size={18} /> },
        { id: 'iuran', label: 'Iuran', icon: <CreditCard size={18} /> },
        { id: 'logistik', label: 'Logistik', icon: <Package size={18} /> },
        { id: 'penerima_manfaat', label: 'Penerima Manfaat', icon: <Heart size={18} /> },
    ];

    const handleFilterChange = (key: keyof FilterState, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleDownload = () => {
        setIsDownloading(true);

        // Build query string from filters
        const queryParams = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value) queryParams.append(key, value);
        });

        const url = `/reports/export/${activeTab}?${queryParams.toString()}`;

        // Trigger download
        window.location.href = url;

        // Reset downloading state after a short delay
        setTimeout(() => setIsDownloading(false), 2000);
    };

    // Render specific filters based on active tab
    const renderFilters = () => {
        switch (activeTab) {
            case 'anggota':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Keanggotaan</label>
                            <select
                                className="form-input w-full"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="tidak aktif">Tidak Aktif</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Divisi / Bagian</label>
                            <select
                                className="form-input w-full"
                                value={filters.division || ''}
                                onChange={(e) => handleFilterChange('division', e.target.value)}
                            >
                                <option value="">Semua Divisi</option>
                                <option value="Kesehatan">Kesehatan</option>
                                <option value="Sosial">Sosial</option>
                                <option value="Penanggulangan Bencana">Penanggulangan Bencana</option>
                                <option value="Humas">Humas</option>
                                <option value="Diklat">Diklat</option>
                            </select>
                        </div>
                    </div>
                );
            case 'pengurus':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Kepengurusan</label>
                            <select
                                className="form-input w-full"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="aktif">Aktif</option>
                                <option value="tidak aktif">Tidak Aktif</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
                            <select
                                className="form-input w-full"
                                value={filters.jabatan || ''}
                                onChange={(e) => handleFilterChange('jabatan', e.target.value)}
                            >
                                <option value="">Semua Jabatan</option>
                                <option value="Ketua">Ketua</option>
                                <option value="Wakil Ketua">Wakil Ketua</option>
                                <option value="Sekretaris">Sekretaris</option>
                                <option value="Bendahara">Bendahara</option>
                                <option value="Ketua Bidang">Ketua Bidang</option>
                                <option value="Anggota Bidang">Anggota Bidang</option>
                            </select>
                        </div>
                    </div>
                );
            case 'relawan':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Relawan</label>
                            <select
                                className="form-input w-full md:w-1/2"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Menunggu Persetujuan</option>
                                <option value="approved">Diterima / Aktif</option>
                                <option value="rejected">Ditolak</option>
                            </select>
                        </div>
                    </div>
                );
            case 'keuangan':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                            <select
                                className="form-input w-full"
                                value={filters.type || ''}
                                onChange={(e) => handleFilterChange('type', e.target.value)}
                            >
                                <option value="">Semua Transaksi</option>
                                <option value="in">Pemasukan (In)</option>
                                <option value="out">Pengeluaran (Out)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                            <input
                                type="date"
                                className="form-input w-full"
                                value={filters.start_date || ''}
                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                            <input
                                type="date"
                                className="form-input w-full"
                                value={filters.end_date || ''}
                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                            />
                        </div>
                    </div>
                );
            case 'iuran':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                            <select
                                className="form-input w-full md:w-1/2"
                                value={filters.status || ''}
                                onChange={(e) => handleFilterChange('status', e.target.value)}
                            >
                                <option value="">Semua Status</option>
                                <option value="paid">Lunas / Sudah Bayar</option>
                                <option value="pending">Menunggu Konfirmasi</option>
                            </select>
                        </div>
                    </div>
                );
            case 'logistik':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Barang</label>
                            <select
                                className="form-input w-full"
                                value={filters.category || ''}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">Semua Kategori</option>
                                <option value="Obat-obatan">Obat-obatan</option>
                                <option value="Alat Medis">Alat Medis</option>
                                <option value="Peralatan Posko">Peralatan Posko</option>
                                <option value="Sembako">Sembako</option>
                                <option value="Seragam & Atribut">Seragam & Atribut</option>
                                <option value="Lainnya">Lainnya</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kondisi Barang</label>
                            <select
                                className="form-input w-full"
                                value={filters.condition || ''}
                                onChange={(e) => handleFilterChange('condition', e.target.value)}
                            >
                                <option value="">Semua Kondisi</option>
                                <option value="baik">Baik</option>
                                <option value="rusak ringan">Rusak Ringan</option>
                                <option value="rusak berat">Rusak Berat</option>
                                <option value="kadaluarsa">Kadaluarsa</option>
                            </select>
                        </div>
                    </div>
                );
            case 'penerima_manfaat':
                return (
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Penerima</label>
                            <select
                                className="form-input w-full md:w-1/2"
                                value={filters.category || ''}
                                onChange={(e) => handleFilterChange('category', e.target.value)}
                            >
                                <option value="">Semua Kategori</option>
                                <option value="Individu">Individu</option>
                                <option value="Keluarga">Keluarga</option>
                                <option value="Komunitas">Komunitas / Lembaga</option>
                                <option value="Fasilitas Umum">Fasilitas Umum</option>
                            </select>
                        </div>
                    </div>
                );
            default:
                return <p className="text-gray-500 text-sm">Tidak ada filter tambahan untuk laporan ini.</p>;
        }
    };

    return (
        <AppLayout>
            <Head title="Pusat Pelaporan - BSMI" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Pusat Pelaporan</h1>
                    <p className="page-subtitle">Unduh dan rekapitulasi data dari berbagai modul secara terpusat.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Navigation */}
                <div className="lg:col-span-1">
                    <div className="card p-4">
                        <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-4 px-2">Kategori Laporan</h3>
                        <nav className="space-y-1">
                            {tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => {
                                        setActiveTab(tab.id);
                                        setFilters({}); // Reset filters when changing tab
                                    }}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id
                                            ? 'bg-theme-50 text-theme-700 shadow-sm'
                                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                        }`}
                                >
                                    <div className={`${activeTab === tab.id ? 'text-theme-600' : 'text-gray-400'}`}>
                                        {tab.icon}
                                    </div>
                                    {tab.label}
                                </button>
                            ))}
                        </nav>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="card relative overflow-hidden min-h-[400px] flex flex-col">
                        <div className="absolute -bottom-16 -right-16 text-gray-300 opacity-10 pointer-events-none z-0">
                            <FileText size={280} strokeWidth={1} />
                        </div>

                        <div className="card-header border-b border-gray-100 pb-5 relative z-10">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                {tabs.find(t => t.id === activeTab)?.icon}
                                Laporan {tabs.find(t => t.id === activeTab)?.label}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Sesuaikan filter di bawah ini untuk membatasi data yang ingin diunduh.
                            </p>
                        </div>

                        <div className="p-6 relative z-10 flex-1 flex flex-col">
                            <div className="bg-slate-50 border border-slate-100 shadow-sm rounded-2xl p-6 mb-6 flex-1">
                                <div className="flex items-center gap-2 mb-6 text-slate-700 font-bold text-sm uppercase tracking-wide">
                                    <Filter size={16} className="text-slate-400" />
                                    Filter Data Laporan
                                </div>

                                <div className="max-w-3xl">
                                    {renderFilters()}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    onClick={handleDownload}
                                    disabled={isDownloading}
                                    className="btn-primary flex items-center gap-2 px-6 py-2.5 text-sm"
                                >
                                    {isDownloading ? (
                                        <>
                                            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                                            Memproses...
                                        </>
                                    ) : (
                                        <>
                                            <Download size={18} />
                                            Unduh Excel
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-start gap-4">
                        <div className="bg-blue-100 text-blue-600 p-2 rounded-xl mt-1">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h4 className="text-sm font-bold text-blue-900">Format Laporan</h4>
                            <p className="text-xs text-blue-700 mt-1 leading-relaxed">
                                Seluruh laporan akan diunduh dalam format <strong>Microsoft Excel (.xlsx)</strong>.
                                Anda dapat menggunakan filter yang disediakan untuk mendapatkan data yang spesifik.
                                Jika Anda tidak memilih filter apapun, maka sistem akan mengunduh seluruh data secara lengkap.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
