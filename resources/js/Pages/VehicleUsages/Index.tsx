import React, { useState } from 'react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Search, Plus, Edit, Trash2, Car, Eye, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Modal, EmptyState } from '@/Components/Shared';
import { confirmAction } from '@/Utils/swal';
import { useForm } from '@inertiajs/react';
import { useEffect } from 'react';

interface Asset {
    id: number;
    nama_barang: string;
    tipe_model: string;
    vehicle_usages?: VehicleUsage[];
}

interface VehicleUsage {
    id: number;
    tanggal_pengajuan: string;
    nama_pengaju: string;
    asset_id: number;
    asset: Asset;
    pic_pemakai: string;
    no_telp: string;
    alasan_keperluan: string;
    tujuan: string;
    tanggal_mulai: string;
    km_awal: number;
    tanggal_selesai: string | null;
    km_akhir: number | null;
    ktp_path: string | null;
    status: string;
}

interface ActiveUsage {
    id: number;
    asset_id: number;
    tanggal_mulai: string;
    tanggal_selesai: string | null;
    status: string;
}

interface Props {
    usages: { data: VehicleUsage[]; meta: any };
    vehicles: Asset[];
    active_usages: ActiveUsage[];
    filters: { search: string; status: string; sort_by?: string; sort_direction?: string; };
}

const STATUSES = ['Diajukan', 'Disetujui', 'Sedang Dipakai', 'Menunggu Pengecekan', 'Selesai', 'Ditolak'];

export default function VehicleUsagesIndex({ usages, vehicles, active_usages = [], filters }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');
    
    // Authorization for sensitive data
    const isAuthorizedForSensitiveData = roles.some((role: any) => 
        ['super_admin', 'bendahara', 'ketua'].includes(typeof role === 'string' ? role : role.name)
    );

    const maskData = (text: string, type: 'name' | 'phone') => {
        if (isAuthorizedForSensitiveData || !text) return text;
        if (type === 'name') {
            if (text.length <= 2) return '*'.repeat(text.length);
            return text[0] + '*'.repeat(text.length - 2) + text[text.length - 1];
        }
        if (type === 'phone') {
            if (text.length <= 4) return '*'.repeat(text.length);
            return text.substring(0, 4) + '*'.repeat(text.length - 6) + text.substring(text.length - 2);
        }
        return text;
    };

    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || '');
    const [sortBy, setSortBy] = useState(filters.sort_by || 'tanggal_pengajuan');
    const [sortDir, setSortDir] = useState(filters.sort_direction || 'desc');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);

    const { data, setData, post, processing, errors, reset } = useForm({
        tanggal_pengajuan: new Date().toISOString().split('T')[0],
        nama_pengaju: '',
        asset_id: '',
        pic_pemakai: '',
        no_telp: '',
        alasan_keperluan: '',
        tujuan: '',
        tanggal_mulai: '',
        km_awal: '',
        tanggal_selesai: '',
        km_akhir: '',
        status: 'Diajukan',
        ktp: null as File | null,
        _method: 'post'
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/vehicle-usages', { search, status, sort_by: sortBy, sort_direction: sortDir }, { preserveState: true });
    };

    const handleSort = (column: string) => {
        let newDir = 'asc';
        if (sortBy === column) {
            newDir = sortDir === 'asc' ? 'desc' : 'asc';
        }
        setSortBy(column);
        setSortDir(newDir);
        router.get('/vehicle-usages', { search, status, sort_by: column, sort_direction: newDir }, { preserveState: true });
    };

    const SortIcon = ({ column }: { column: string }) => {
        if (sortBy !== column) return <ArrowUpDown size={14} className="text-gray-400 inline ml-1 opacity-50" />;
        return sortDir === 'asc' ? <ArrowUp size={14} className="text-indigo-600 inline ml-1" /> : <ArrowDown size={14} className="text-indigo-600 inline ml-1" />;
    };

    const openCreate = () => {
        reset();
        setData('_method', 'post');
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEdit = (usage: VehicleUsage) => {
        setData({
            tanggal_pengajuan: usage.tanggal_pengajuan ? usage.tanggal_pengajuan.substring(0, 10) : '',
            nama_pengaju: usage.nama_pengaju || '',
            asset_id: usage.asset_id?.toString() || '',
            pic_pemakai: usage.pic_pemakai || '',
            no_telp: usage.no_telp || '',
            alasan_keperluan: usage.alasan_keperluan || '',
            tujuan: usage.tujuan || '',
            tanggal_mulai: usage.tanggal_mulai ? usage.tanggal_mulai.substring(0, 16) : '',
            km_awal: usage.km_awal?.toString() || '',
            tanggal_selesai: usage.tanggal_selesai ? usage.tanggal_selesai.substring(0, 16) : '',
            km_akhir: usage.km_akhir?.toString() || '',
            status: usage.status || 'Diajukan',
            ktp: null,
            _method: 'put'
        });
        setEditingId(usage.id);
        setIsModalOpen(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (editingId) {
            post(`/vehicle-usages/${editingId}`, {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
                forceFormData: true,
            });
        } else {
            post('/vehicle-usages', {
                onSuccess: () => {
                    setIsModalOpen(false);
                    reset();
                },
                forceFormData: true,
            });
        }
    };

    const handleDelete = async (id: number, name: string) => {
        if (await confirmAction(`Hapus pengajuan dari ${name}?`)) {
            router.delete(`/vehicle-usages/${id}`);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'Diajukan': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">Diajukan</span>;
            case 'Disetujui': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">Disetujui</span>;
            case 'Sedang Dipakai': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-100 text-indigo-800">Sedang Dipakai</span>;
            case 'Menunggu Pengecekan': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">Menunggu Pengecekan</span>;
            case 'Selesai': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Selesai</span>;
            case 'Ditolak': return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">Ditolak</span>;
            default: return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const isVehicleAvailable = (vehicleId: number) => {
        if (!data.tanggal_mulai) return true;
        
        const reqStart = new Date(data.tanggal_mulai).getTime();
        const reqEnd = data.tanggal_selesai ? new Date(data.tanggal_selesai).getTime() : reqStart;
    
        return !active_usages.some(usage => {
            if (editingId && usage.id === editingId) return false;
            if (usage.asset_id !== vehicleId) return false;
    
            const uStart = new Date(usage.tanggal_mulai).getTime();
            const uEnd = usage.tanggal_selesai ? new Date(usage.tanggal_selesai).getTime() : null;
    
            if (!uEnd) return reqEnd >= uStart;
            return reqStart <= uEnd && reqEnd >= uStart;
        });
    };

    // Auto-clear asset_id if it becomes unavailable due to date changes
    useEffect(() => {
        if (data.asset_id) {
            const isAvail = isVehicleAvailable(Number(data.asset_id));
            if (!isAvail) {
                setData('asset_id', '');
            }
        }
    }, [data.tanggal_mulai, data.tanggal_selesai]);

    const getVehicleStatusLabel = (vehicleId: number) => {
        if (isVehicleAvailable(vehicleId)) return '';
        
        const conflict = active_usages.find(u => u.asset_id === vehicleId && (editingId ? u.id !== editingId : true));
        if (conflict) {
            if (conflict.status === 'Diajukan') return ' (Kendaraan dalam proses pengajuan)';
            return ' (Kendaraan sedang dipakai)';
        }
        return '';
    };

    return (
        <AppLayout>
            <Head title="Layanan Mobil Operasional" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Layanan Mobil Operasional</h1>
                    <p className="page-subtitle">Manajemen data pemakaian ambulance dan mobil operasional BSMI.</p>
                </div>
                <button onClick={openCreate} className="btn-primary">
                    <Plus size={18} /> Ajukan Pemakaian
                </button>
            </div>

            {/* Dashboard Status Kendaraan */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                {vehicles.map(vehicle => {
                    const activeUsage = vehicle.vehicle_usages?.[0];
                    const isReady = !activeUsage;

                    return (
                        <div key={vehicle.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col justify-between">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className={`p-2 rounded-lg ${isReady ? 'bg-green-50 text-green-600' : 'bg-indigo-50 text-indigo-600'}`}>
                                        <Car size={20} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-sm">{vehicle.nama_barang}</h3>
                                        <p className="text-xs text-gray-500">{vehicle.tipe_model || 'Tidak ada tipe'}</p>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 text-[10px] font-semibold rounded-full whitespace-nowrap ${
                                    isReady ? 'bg-green-100 text-green-700' : 
                                    activeUsage?.status === 'Diajukan' ? 'bg-yellow-100 text-yellow-700' : 
                                    activeUsage?.status === 'Disetujui' ? 'bg-blue-100 text-blue-700' :
                                    activeUsage?.status === 'Menunggu Pengecekan' ? 'bg-purple-100 text-purple-700' :
                                    'bg-indigo-100 text-indigo-700'
                                }`}>
                                    {isReady ? 'Ready / Standby' : activeUsage?.status}
                                </span>
                            </div>
                            
                            {activeUsage ? (
                                <div className="text-xs text-gray-600 space-y-2 bg-gray-50/50 p-3 rounded-lg border border-gray-100/60">
                                    <div className="flex"><span className="text-gray-400 w-16">Oleh:</span> <span className="font-medium text-gray-800">{activeUsage.pic_pemakai}</span></div>
                                    <div className="flex"><span className="text-gray-400 w-16">Tujuan:</span> <span className="truncate" title={activeUsage.tujuan}>{activeUsage.tujuan}</span></div>
                                    <div className="flex"><span className="text-gray-400 w-16">Jadwal:</span> <span className="truncate">{activeUsage.tanggal_mulai.substring(0, 16).replace('T', ' ')} s/d {activeUsage.tanggal_selesai?.substring(0, 16).replace('T', ' ') || '-'}</span></div>
                                </div>
                            ) : (
                                <div className="text-xs text-gray-500 bg-green-50/30 p-3 rounded-lg border border-green-50 border-dashed text-center flex items-center justify-center h-[76px]">
                                    Kendaraan tersedia dan siap digunakan.
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <div className="card mb-6">
                <div className="card-header">
                    <form onSubmit={handleSearch} className="flex gap-2 flex-wrap">
                        <div className="relative">
                            <input
                                type="text"
                                className="form-input pl-10 pr-4 py-2 w-64"
                                placeholder="Cari nama, pic, tujuan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                            />
                            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        </div>
                        <select 
                            className="form-input py-2" 
                            value={status}
                            onChange={e => {
                                setStatus(e.target.value);
                                router.get('/vehicle-usages', { search, status: e.target.value, sort_by: sortBy, sort_direction: sortDir }, { preserveState: true });
                            }}
                        >
                            <option value="">Semua Status</option>
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button type="submit" className="btn-secondary">Cari</button>
                    </form>
                </div>

                <div className="p-0 border-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50/50 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th onClick={() => handleSort('tanggal_pengajuan')} className="px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors">Tgl Pengajuan <SortIcon column="tanggal_pengajuan" /></th>
                                    <th className="px-4 py-3">Pengaju / PIC</th>
                                    <th className="px-4 py-3">Kendaraan</th>
                                    <th className="px-4 py-3">Tujuan / Mulai Pakai</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3 text-right">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {usages.data.length > 0 ? usages.data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {item.tanggal_pengajuan ? item.tanggal_pengajuan.substring(0, 10) : '-'}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-900">{maskData(item.nama_pengaju, 'name')}</div>
                                            <div className="text-gray-500 text-xs mt-1">PIC: {maskData(item.pic_pemakai, 'name')} ({maskData(item.no_telp, 'phone')})</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900">{item.asset?.nama_barang}</div>
                                            <div className="text-gray-500 text-xs">{item.asset?.tipe_model || '-'}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-gray-900">{item.tujuan}</div>
                                            <div className="text-gray-500 text-xs mt-1 whitespace-nowrap">
                                                {item.tanggal_mulai ? item.tanggal_mulai.substring(0, 16).replace('T', ' ') : '-'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            {getStatusBadge(item.status)}
                                        </td>
                                        <td className="px-4 py-3 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => isAuthorizedForSensitiveData && openEdit(item)} 
                                                    disabled={!isAuthorizedForSensitiveData}
                                                    className={`p-1.5 transition-colors border rounded-md shadow-sm ${
                                                        isAuthorizedForSensitiveData 
                                                        ? 'text-gray-400 hover:text-theme-600 bg-white border-gray-200 hover:border-theme-300 hover:bg-theme-50' 
                                                        : 'text-gray-300 bg-gray-50 border-gray-100 cursor-not-allowed'
                                                    }`} 
                                                    title={isAuthorizedForSensitiveData ? "Edit Data" : "Akses Terbatas"}
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                {canEdit && (
                                                    <button onClick={() => handleDelete(item.id, item.nama_pengaju)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors bg-white border border-gray-200 rounded-md shadow-sm hover:border-red-300 hover:bg-red-50" title="Hapus Data">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12">
                                            <EmptyState icon={<Car />} title="Belum ada data" description="Belum ada pengajuan pemakaian kendaraan." />
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? 'Edit Pemakaian Mobil' : 'Ajukan Pemakaian Mobil'} size="lg">
                <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tgl Pengajuan *</label>
                            <input type="date" className="form-input" value={data.tanggal_pengajuan} onChange={e => setData('tanggal_pengajuan', e.target.value)} required />
                            {errors.tanggal_pengajuan && <p className="text-red-500 text-xs mt-1">{errors.tanggal_pengajuan}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select className="form-input" value={data.status} onChange={e => setData('status', e.target.value)}>
                                {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Pemohon *</label>
                            <input type="text" className="form-input" value={data.nama_pengaju} onChange={e => setData('nama_pengaju', e.target.value)} required />
                            {errors.nama_pengaju && <p className="text-red-500 text-xs mt-1">{errors.nama_pengaju}</p>}
                        </div>

                        <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                            <h4 className="font-semibold text-gray-800 mb-4">Informasi Kendaraan</h4>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Pilih Kendaraan *</label>
                            <select className="form-input" value={data.asset_id} onChange={e => setData('asset_id', e.target.value)} required>
                                <option value="">Pilih Kendaraan...</option>
                                {vehicles.map(v => {
                                    const isAvailable = isVehicleAvailable(v.id);
                                    return (
                                        <option key={v.id} value={v.id} disabled={!isAvailable}>
                                            {v.nama_barang} ({v.tipe_model || '-'}) {getVehicleStatusLabel(v.id)}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.asset_id && <p className="text-red-500 text-xs mt-1">{errors.asset_id}</p>}
                        </div>
                        
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tipe / Model (Otomatis)</label>
                            <input 
                                type="text" 
                                className="form-input bg-gray-50" 
                                value={vehicles.find(v => v.id.toString() === data.asset_id)?.tipe_model || ''} 
                                disabled 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">PIC Pemakai / Supir *</label>
                            <input type="text" className="form-input" value={data.pic_pemakai} onChange={e => setData('pic_pemakai', e.target.value)} required />
                            {errors.pic_pemakai && <p className="text-red-500 text-xs mt-1">{errors.pic_pemakai}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
                            <input type="text" className="form-input" value={data.no_telp} onChange={e => setData('no_telp', e.target.value)} required />
                            {errors.no_telp && <p className="text-red-500 text-xs mt-1">{errors.no_telp}</p>}
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tujuan Kota / Alamat *</label>
                            <input type="text" className="form-input" value={data.tujuan} onChange={e => setData('tujuan', e.target.value)} required />
                            {errors.tujuan && <p className="text-red-500 text-xs mt-1">{errors.tujuan}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Alasan Keperluan *</label>
                            <textarea className="form-input" rows={2} value={data.alasan_keperluan} onChange={e => setData('alasan_keperluan', e.target.value)} required></textarea>
                            {errors.alasan_keperluan && <p className="text-red-500 text-xs mt-1">{errors.alasan_keperluan}</p>}
                        </div>

                        <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                            <h4 className="font-semibold text-gray-800 mb-4">Waktu & Jarak Tempuh</h4>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam Mulai *</label>
                            <input type="datetime-local" className="form-input" value={data.tanggal_mulai} onChange={e => setData('tanggal_mulai', e.target.value)} required />
                            {errors.tanggal_mulai && <p className="text-red-500 text-xs mt-1">{errors.tanggal_mulai}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KM Awal *</label>
                            <input type="number" className="form-input" value={data.km_awal} onChange={e => setData('km_awal', e.target.value)} required />
                            {errors.km_awal && <p className="text-red-500 text-xs mt-1">{errors.km_awal}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal & Jam Selesai *</label>
                            <input type="datetime-local" className="form-input" value={data.tanggal_selesai} onChange={e => setData('tanggal_selesai', e.target.value)} required />
                            {errors.tanggal_selesai && <p className="text-red-500 text-xs mt-1">{errors.tanggal_selesai}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">KM Akhir</label>
                            <input type="number" className="form-input" value={data.km_akhir} onChange={e => setData('km_akhir', e.target.value)} />
                        </div>

                        <div className="col-span-2 border-t border-gray-100 pt-4 mt-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Upload KTP Pengguna (Opsional)</label>
                            <input type="file" accept="image/*" className="form-input file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-theme-50 file:text-theme-700 hover:file:bg-theme-100" onChange={e => setData('ktp', e.target.files ? e.target.files[0] : null)} />
                            {errors.ktp && <p className="text-red-500 text-xs mt-1">{errors.ktp}</p>}
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" disabled={processing} className="btn-primary">
                            {processing ? 'Menyimpan...' : 'Simpan Data'}
                        </button>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
