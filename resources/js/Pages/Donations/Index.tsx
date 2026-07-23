import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Heart, Search, Filter, Eye, CheckCircle, XCircle, Trash2, Calendar, FileText, Image as ImageIcon, Package, Link as LinkIcon, Check, RefreshCw } from 'lucide-react';
import Modal from '@/Components/Modal';

export default function DonationIndex({ auth, donations, filters }: any) {
    const [search, setSearch] = useState(filters.search || '');
    const [statusFilter, setStatusFilter] = useState(filters.status || '');
    const [perPage, setPerPage] = useState(filters.per_page || '25');
    
    const [selectedDonation, setSelectedDonation] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    
    const canManageFinance = auth.permissions.includes('menu-finance');
    
    // Authorization for sensitive data
    const isAuthorizedForSensitiveData = auth.roles?.some((role: any) => 
        ['super_admin', 'bendahara', 'ketua'].includes(typeof role === 'string' ? role : role.name)
    ) || false;

    const maskData = (text: string, type: 'name' | 'phone' | 'address' | 'village') => {
        if (isAuthorizedForSensitiveData || !text) return text;
        if (type === 'name') {
            if (text.length <= 2) return '*'.repeat(text.length);
            return text[0] + '*'.repeat(text.length - 2) + text[text.length - 1];
        }
        if (type === 'phone') {
            if (text.length <= 4) return '*'.repeat(text.length);
            return text.substring(0, 4) + '*'.repeat(text.length - 6) + text.substring(text.length - 2);
        }
        if (type === 'address' || type === 'village') {
            return '*** Disamarkan ***';
        }
        return text;
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/donations', { search, status: statusFilter, per_page: perPage }, { preserveState: true });
    };

    // Auto search on perPage change
    React.useEffect(() => {
        if (perPage !== filters.per_page) {
            router.get('/donations', { search, status: statusFilter, per_page: perPage }, { preserveState: true });
        }
    }, [perPage]);

    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            only: ['donations'],
            onFinish: () => setIsRefreshing(false),
        });
    };

    const handleCopyLink = () => {
        const url = window.location.origin + '/konfirmasi-donasi';
        
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(url).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            });
        } else {
            // Fallback for non-HTTPS environments (like .test local domains)
            const textArea = document.createElement("textarea");
            textArea.value = url;
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";
            document.body.prepend(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (error) {
                console.error("Gagal menyalin link:", error);
                alert("Gagal menyalin link. Silakan copy manual URL ini: " + url);
            } finally {
                textArea.remove();
            }
        }
    };

    const handleUpdateStatus = (id: number, status: string) => {
        if (confirm(`Yakin ingin mengubah status donasi ini menjadi ${status}?`)) {
            router.put(`/donations/${id}`, { status }, { preserveScroll: true });
        }
    };

    const handleDelete = (id: number) => {
        if (confirm('Yakin ingin menghapus data donasi ini? Data yang dihapus tidak dapat dikembalikan.')) {
            router.delete(`/donations/${id}`);
        }
    };

    const formatRupiah = (number: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(number);
    };

    return (
        <AppLayout>
            <Head title="Manajemen Donasi" />

            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="page-title flex items-center gap-2">
                        <Heart className="text-theme-600" /> Manajemen Donasi
                    </h1>
                    <p className="page-subtitle">Kelola dan verifikasi konfirmasi donasi dari publik.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <button 
                        onClick={handleRefresh} 
                        disabled={isRefreshing}
                        className="btn-secondary text-sm flex items-center gap-1.5" 
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                        Refresh
                    </button>
                    <button onClick={handleCopyLink} className="btn-secondary text-sm flex items-center gap-1.5" title="Copy Link Form Donasi">
                        {copied ? <Check size={16} className="text-green-500" /> : <LinkIcon size={16} />}
                        {copied ? 'Tersalin!' : 'Copy Link'}
                    </button>
                    <a href="/konfirmasi-donasi" target="_blank" className="btn-primary text-sm flex items-center gap-1.5">
                        <Eye size={16} /> Lihat Form Publik
                    </a>
                </div>
            </div>

            <div className="card mb-6">
                <div className="card-body">
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                className="form-input pl-10 w-full" 
                                placeholder="Cari nama atau no. telp donatur..." 
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <select className="form-input sm:w-48" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                            <option value="">Semua Status</option>
                            <option value="pending">Menunggu Verifikasi</option>
                            <option value="received">Diterima</option>
                            <option value="distributed">Telah Disalurkan</option>
                        </select>
                        <select className="form-input sm:w-32" value={perPage} onChange={e => setPerPage(e.target.value)}>
                            <option value="25">25 Data</option>
                            <option value="50">50 Data</option>
                            <option value="all">Semua</option>
                        </select>
                        <button type="submit" className="btn-primary whitespace-nowrap">Terapkan Filter</button>
                    </form>
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs text-left">
                        <thead className="text-[11px] text-gray-500 uppercase bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                            <tr>
                                <th className="px-3 py-2 font-medium">Donatur</th>
                                <th className="px-3 py-2 font-medium">Alamat</th>
                                <th className="px-3 py-2 font-medium">Jenis & Nominal/Barang</th>
                                <th className="px-3 py-2 font-medium">Tujuan Program</th>
                                <th className="px-3 py-2 font-medium">Tanggal</th>
                                <th className="px-3 py-2 font-medium text-center">Status</th>
                                <th className="px-3 py-2 font-medium text-right w-24">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {donations.data.length > 0 ? donations.data.map((item: any) => (
                                <tr key={item.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-3 py-2">
                                        <div className="font-semibold text-gray-900 dark:text-white">{maskData(item.donor_name, 'name')}</div>
                                        <div className="text-[11px] text-gray-500">{maskData(item.donor_phone, 'phone')}</div>
                                    </td>
                                    <td className="px-3 py-2 max-w-[200px]">
                                        <div className="text-[11px] text-gray-700 dark:text-gray-300 truncate" title={item.address}>{maskData(item.address, 'address')}</div>
                                        <div className="text-[10px] text-gray-400 mt-0.5 truncate">{maskData(item.village, 'village')}, {item.district}, {item.city}</div>
                                    </td>
                                    <td className="px-3 py-2">
                                        {item.type === 'uang' ? (
                                            <span className="font-semibold text-theme-600 dark:text-theme-400">{formatRupiah(item.amount)}</span>
                                        ) : (
                                            <div className="flex items-start gap-1">
                                                <Package size={12} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-gray-700 dark:text-gray-300 line-clamp-2" title={item.goods_description}>{item.goods_description}</span>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-3 py-2">
                                        {item.program ? (
                                            <div className="text-xs text-gray-700 dark:text-gray-300 max-w-[150px] truncate" title={item.program.title}>{item.program.title}</div>
                                        ) : item.beneficiary ? (
                                            <div className="text-xs text-gray-700 dark:text-gray-300 max-w-[150px] truncate" title={item.beneficiary.name}>{item.beneficiary.name}</div>
                                        ) : (
                                            <span className="text-[10px] text-gray-400 italic">Umum</span>
                                        )}
                                    </td>
                                    <td className="px-3 py-2 whitespace-nowrap">
                                        <div className="text-xs text-gray-900 dark:text-gray-200">
                                            {new Date(item.created_at).toLocaleString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5 font-mono">
                                            {new Date(item.created_at).toLocaleString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' }).replace(/\./g, ':')}
                                        </div>
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium ${
                                            item.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                            item.status === 'received' ? 'bg-green-100 text-green-800' :
                                            'bg-blue-100 text-blue-800'
                                        }`}>
                                            {item.status === 'pending' ? 'Menunggu' : item.status === 'received' ? 'Diterima' : 'Disalurkan'}
                                        </span>
                                    </td>
                                    <td className="px-3 py-2 text-right">
                                        <div className="flex justify-end gap-1">
                                            <button 
                                                onClick={() => { 
                                                    if(isAuthorizedForSensitiveData) {
                                                        setSelectedDonation(item); 
                                                        setIsDetailModalOpen(true);
                                                    }
                                                }}
                                                disabled={!isAuthorizedForSensitiveData}
                                                className={`p-1 rounded transition-colors ${
                                                    isAuthorizedForSensitiveData 
                                                    ? 'text-gray-500 hover:text-theme-600 bg-gray-100 hover:bg-theme-50 dark:bg-gray-800 dark:hover:bg-theme-900/30'
                                                    : 'text-gray-300 bg-gray-50 cursor-not-allowed dark:bg-gray-800/50 dark:text-gray-600'
                                                }`}
                                                title={isAuthorizedForSensitiveData ? "Lihat Detail & Bukti" : "Akses Terbatas"}
                                            >
                                                <Eye size={14} />
                                            </button>
                                            {canManageFinance && (
                                                <button 
                                                    onClick={() => handleDelete(item.id)}
                                                    className="p-1 text-gray-500 hover:text-red-600 bg-gray-100 hover:bg-red-50 dark:bg-gray-800 dark:hover:bg-red-900/30 rounded transition-colors"
                                                    title="Hapus"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-3 py-8 text-center text-gray-500">
                                        <Heart size={24} className="mx-auto text-gray-300 mb-2" />
                                        Belum ada data donasi yang ditemukan.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {donations.links && donations.data.length > 0 && (
                <div className="flex justify-center mt-6">
                    <div className="inline-flex items-center gap-1 bg-white dark:bg-gray-800 p-1 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        {donations.links.map((link: any, index: number) => (
                            <button
                                key={index}
                                onClick={() => {
                                    if (link.url) router.get(link.url, { search, status: statusFilter, per_page: perPage }, { preserveState: true, preserveScroll: true });
                                }}
                                disabled={!link.url || link.active}
                                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                                    link.active 
                                    ? 'bg-theme-500 text-white' 
                                    : link.url 
                                        ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700' 
                                        : 'text-gray-400 cursor-not-allowed'
                                }`}
                                dangerouslySetInnerHTML={{ __html: link.label }}
                            />
                        ))}
                    </div>
                </div>
            )}

            <Modal show={isDetailModalOpen} onClose={() => setIsDetailModalOpen(false)} maxWidth="2xl">
                {selectedDonation && (
                    <div className="p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <FileText className="text-theme-600" /> Detail Konfirmasi Donasi
                            </h2>
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                selectedDonation.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                selectedDonation.status === 'received' ? 'bg-green-100 text-green-800' :
                                'bg-blue-100 text-blue-800'
                            }`}>
                                {selectedDonation.status === 'pending' ? 'Menunggu Verifikasi' : selectedDonation.status === 'received' ? 'Diterima' : 'Disalurkan'}
                            </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Informasi Donatur</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Nama</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor_name}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">No. Telp / WA</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{selectedDonation.donor_phone}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Alamat Lengkap</p>
                                            <p className="text-sm text-gray-900 dark:text-white">{selectedDonation.address}</p>
                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                {selectedDonation.village}, {selectedDonation.district}<br/>
                                                {selectedDonation.city}, {selectedDonation.province}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Data Donasi</h3>
                                    <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 space-y-3">
                                        <div>
                                            <p className="text-xs text-gray-500">Bentuk & Jumlah</p>
                                            <p className="font-bold text-lg text-theme-600 dark:text-theme-400">
                                                {selectedDonation.type === 'uang' ? formatRupiah(selectedDonation.amount) : selectedDonation.goods_description}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Tanggal Transfer / Penyerahan</p>
                                            <p className="font-medium text-gray-900 dark:text-white flex items-center gap-1">
                                                <Calendar size={14} className="text-gray-400" />
                                                {new Date(selectedDonation.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div>
                                <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">Bukti Transfer</h3>
                                <div className="bg-gray-100 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex items-center justify-center p-2 h-[350px]">
                                    {selectedDonation.receipt_path ? (
                                        <a href={selectedDonation.receipt_path} target="_blank" rel="noreferrer" className="w-full h-full cursor-zoom-in block">
                                            <img 
                                                src={selectedDonation.receipt_path} 
                                                alt="Bukti Donasi" 
                                                className="w-full h-full object-contain rounded-lg"
                                            />
                                        </a>
                                    ) : (
                                        <div className="text-center text-gray-400">
                                            <ImageIcon size={48} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-sm">Tidak ada bukti yang diunggah</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-center text-gray-500 mt-2">Klik gambar untuk memperbesar</p>
                            </div>
                        </div>

                        {canManageFinance && (
                            <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap gap-3 justify-end">
                                <button onClick={() => setIsDetailModalOpen(false)} className="btn-secondary">Tutup</button>
                                
                                {selectedDonation.status === 'pending' && (
                                    <>
                                        <button onClick={() => { setIsDetailModalOpen(false); handleUpdateStatus(selectedDonation.id, 'received'); }} className="btn-primary bg-green-600 hover:bg-green-700 focus:ring-green-500 border-transparent">
                                            <CheckCircle size={16} className="mr-1.5" /> Konfirmasi Diterima
                                        </button>
                                    </>
                                )}
                                
                                {selectedDonation.status === 'received' && (
                                    <button onClick={() => { setIsDetailModalOpen(false); handleUpdateStatus(selectedDonation.id, 'distributed'); }} className="btn-primary bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 border-transparent">
                                        <CheckCircle size={16} className="mr-1.5" /> Tandai Disalurkan
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
