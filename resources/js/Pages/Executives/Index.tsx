import React, { useState } from 'react';
import { Head, useForm, router, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, formatDate, EmptyState, SearchInput, SensitiveDataField } from '@/Components/Shared';
import { Plus, Edit, Trash2, UserCog, CheckCircle, XCircle, Eye, Phone, Mail, MapPin, ChevronDown, ChevronRight } from 'lucide-react';
import { confirmAction } from '@/Utils/swal';

interface Executive {
    id: number;
    member_id: number;
    regional_cabang?: string;
    member_name?: string;
    nama_lengkap: string;
    jabatan: string;
    bagian_divisi: string;
    periode_mulai: string;
    periode_selesai: string;
    status_aktif: boolean;
    profesi_utama?: string;
    golongan_darah?: string;
    kesiapan_mobilisasi?: boolean;
    ukuran_baju?: string;
    photo_url: string | null;
    notes?: string;
    member_no_hp?: string;
    member_email?: string;
    member_alamat?: string;
    member_nia?: string;
    member_gender?: string;
    member_pendidikan?: string;
    member_jurusan?: string;
    member_agama?: string;
    member_status_keluarga?: string;
    member_jumlah_tanggungan?: string;
}

interface Props {
    executives: { data: Executive[]; meta?: any };
    members?: { id: number; nama_lengkap: string; no_induk_anggota: string; profesi_utama?: string; golongan_darah?: string; kesiapan_mobilisasi?: boolean; ukuran_baju?: string; regional_cabang?: string; bagian_divisi?: string; }[];
    usedMemberIds?: Array<number>;
    filters?: any;
    regionalLogos?: Record<string, string>;
}

export default function ExecutivesIndex({ executives, members = [], usedMemberIds = [], filters, regionalLogos = {} }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const canEdit = !roles.includes('anggota') && !roles.includes('relawan');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [viewingExecutive, setViewingExecutive] = useState<Executive | null>(null);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [expandedGroups, setExpandedGroups] = useState<string[]>([]);
    const [search, setSearch] = useState(filters?.search || '');

    const toggleGroup = (regional: string) => {
        setExpandedGroups(prev => prev.includes(regional) ? prev.filter(r => r !== regional) : [...prev, regional]);
    };

    const { data, setData, post, processing, errors, reset } = useForm({
        member_id: '', regional_cabang: filters?.regional_cabang || '', nama_lengkap: '', jabatan: '', bagian_divisi: '', periode_mulai: '', periode_selesai: '', status_aktif: true, profesi_utama: '', golongan_darah: '', kesiapan_mobilisasi: false, ukuran_baju: '', photo: null as File | null
    });

    const handleEdit = (exec: any) => {
        setData({
            member_id: exec.member_id || '',
            regional_cabang: exec.regional_cabang || filters?.regional_cabang || '',
            nama_lengkap: exec.member_name || exec.nama_lengkap || '',
            jabatan: exec.jabatan || '',
            bagian_divisi: exec.bagian_divisi || '',
            periode_mulai: exec.periode_mulai || '',
            periode_selesai: exec.periode_selesai || '',
            status_aktif: exec.status_aktif,
            profesi_utama: exec.profesi_utama || '',
            golongan_darah: exec.golongan_darah || '',
            kesiapan_mobilisasi: exec.kesiapan_mobilisasi || false,
            ukuran_baju: exec.ukuran_baju || '',
            photo: null,
            _method: 'put'
        } as any);
        setEditingId(exec.id);
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
            post(`/executives/${editingId}`, options);
        } else {
            post('/executives', options);
        }
    };

    const handleDelete = async (id: number) => {
        if (await confirmAction('Yakin ingin menghapus data pengurus ini?')) {
            router.delete(`/executives/${id}?regional_cabang=${filters?.regional_cabang || ''}`);
        }
    };

    const handleSearch = (value: string) => {
        setSearch(value);
        router.get('/executives', { ...filters, search: value }, { preserveState: true, preserveScroll: true, replace: true });
    };

    return (
        <AppLayout>
            <Head title="Data Pengurus" />

            <div className="page-header flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    {filters?.regional_cabang && (props.organization as any)?.regional_logos_url?.[filters.regional_cabang] && (
                        <img 
                            src={(props.organization as any).regional_logos_url[filters.regional_cabang]} 
                            alt={filters.regional_cabang} 
                            className="w-14 h-14 object-contain drop-shadow-sm"
                        />
                    )}
                    <div>
                        <h1 className="page-title">Data Pengurus {filters?.regional_cabang ? `- ${filters.regional_cabang}` : '- Semua Cabang'}</h1>
                        <p className="page-subtitle">Struktur kepengurusan {filters?.regional_cabang || 'BSMI seluruh cabang'}.</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="w-full sm:w-64">
                        <SearchInput value={search} onChange={handleSearch} placeholder="Cari nama, jabatan..." />
                    </div>
                    {canEdit && (
                        <button onClick={handleOpenAdd} className="btn-primary whitespace-nowrap">
                            <Plus size={16} /> Tambah Pengurus
                        </button>
                    )}
                </div>
            </div>

            {executives.data.length > 0 || !filters?.regional_cabang ? (
                !filters?.regional_cabang ? (
                    <div className="card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <tr>
                                        <th className="px-4 py-2 font-medium w-12 text-center">No</th>
                                        <th className="px-4 py-2 font-medium">Pengurus</th>
                                        <th className="px-4 py-2 font-medium">Jabatan</th>
                                        <th className="px-4 py-2 font-medium">Masa Bakti</th>
                                        <th className="px-4 py-2 font-medium w-24">Status</th>
                                        <th className="px-4 py-2 font-medium w-24 text-right">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const uniqueRegionals = Array.from(new Set(executives.data.map(exec => exec.regional_cabang || 'Lainnya'))).sort();

                                        return uniqueRegionals.map(regional => {
                                            const regionalData = executives.data.filter(exec => (exec.regional_cabang || 'Lainnya') === regional);
                                            const logoPath = regionalLogos[regional] ? `/storage/${regionalLogos[regional]}` : null;
                                            const isExpanded = expandedGroups.includes(regional);
                                            
                                            return (
                                                <React.Fragment key={regional}>
                                                    <tr className="bg-gray-50/50 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors" onClick={() => toggleGroup(regional)}>
                                                        <td colSpan={canEdit ? 6 : 5} className="px-4 py-3 font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700">
                                                            <div className="flex items-center gap-3">
                                                                {isExpanded ? <ChevronDown size={18} className="text-gray-400" /> : <ChevronRight size={18} className="text-gray-400" />}
                                                                {logoPath ? (
                                                                    <img src={logoPath} alt={regional} className="w-8 h-8 rounded-full object-cover border border-gray-200 shadow-sm bg-white" />
                                                                ) : (
                                                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-xs shadow-sm">
                                                                        BSMI
                                                                    </div>
                                                                )}
                                                                <span className="text-sm">{regional}</span>
                                                                <span className="text-xs font-normal text-gray-400 ml-1">({regionalData.length} pengurus)</span>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                    
                                                    {isExpanded && (regionalData.length > 0 ? (
                                                        regionalData.map((exec, idx) => (
                                                            <tr key={exec.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                                                                <td className="px-4 py-1.5 text-center text-gray-500 text-sm font-medium">
                                                                    {idx + 1}
                                                                </td>
                                                                <td className="px-4 py-1.5">
                                                                    <div className="font-medium text-gray-900 dark:text-white leading-tight">{exec.member_name || exec.nama_lengkap}</div>
                                                                    <div className="text-[11px] text-gray-500">{exec.bagian_divisi || '-'}</div>
                                                                </td>
                                                                <td className="px-4 py-1.5 align-middle">
                                                                    <span className="font-medium text-red-600 leading-tight">{exec.jabatan}</span>
                                                                </td>
                                                                <td className="px-4 py-1.5 text-xs text-gray-600 dark:text-gray-400 align-middle">
                                                                    {formatDate(exec.periode_mulai)} - {exec.periode_selesai ? formatDate(exec.periode_selesai) : 'Sekarang'}
                                                                </td>
                                                                <td className="px-4 py-1.5 align-middle">
                                                                    {exec.status_aktif ? (
                                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Aktif</span>
                                                                    ) : (
                                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400">Non-aktif</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-4 py-1.5 align-middle">
                                                                    <div className="flex items-center justify-end gap-1">
                                                                        <button onClick={() => setViewingExecutive(exec)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded transition-colors" title="Lihat Profil"><Eye size={14}/></button>
                                                                        {canEdit && (
                                                                            <>
                                                                                <button onClick={() => handleEdit(exec)} className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Edit"><Edit size={14}/></button>
                                                                                <button onClick={() => handleDelete(exec.id)} className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors" title="Hapus"><Trash2 size={14}/></button>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={canEdit ? 6 : 5} className="px-4 py-4 text-center text-sm text-gray-400 dark:text-gray-500 italic border-b border-gray-100 dark:border-gray-800">
                                                                Data pengurus belum ditambahkan
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </React.Fragment>
                                            );
                                        });
                                    })()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {executives.data.map(exec => (
                        <div key={exec.id} className="card relative overflow-hidden group">
                            {/* Status border at top */}
                            <div className={`h-2 w-full absolute top-0 left-0 ${exec.status_aktif ? 'bg-red-600' : 'bg-gray-400'}`}></div>
                            
                            <div className="p-6 pt-8 text-center flex flex-col items-center">
                                <div className="relative mb-4">
                                    <img src={exec.photo_url || (exec.member_gender === 'P' ? '/images/avatars/female.png' : '/images/avatars/male.png')} alt={exec.member_name || exec.nama_lengkap} className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md" />
                                    {exec.status_aktif ? (
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5" title="Aktif">
                                            <CheckCircle size={20} className="text-green-500 bg-white rounded-full" />
                                        </div>
                                    ) : (
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5" title="Non-aktif">
                                            <XCircle size={20} className="text-gray-400 bg-white rounded-full" />
                                        </div>
                                    )}
                                </div>
                                
                                <h3 className="font-bold text-gray-900 dark:text-white text-lg">{exec.member_name || exec.nama_lengkap}</h3>
                                <p className="text-red-600 font-medium text-sm mb-1">{exec.jabatan}</p>
                                <p className="text-xs text-gray-500 mb-4">{exec.bagian_divisi || '-'}</p>
                                
                                <div className="w-full bg-gray-50 dark:bg-gray-800 rounded-lg p-3 mt-auto">
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold mb-1">Masa Bakti</p>
                                    <p className="text-xs font-medium text-gray-900 dark:text-white">
                                        {formatDate(exec.periode_mulai)} - {exec.periode_selesai ? formatDate(exec.periode_selesai) : 'Sekarang'}
                                    </p>
                                </div>

                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 z-10">
                                        <button onClick={() => setViewingExecutive(exec)} className="p-1.5 bg-white shadow-sm rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Lihat Profil"><Eye size={14} /></button>
                                        {canEdit && (
                                            <>
                                                <button onClick={() => handleEdit(exec)} className="p-1.5 bg-white shadow-sm rounded-lg text-blue-600 hover:bg-blue-50 transition-colors" title="Edit"><Edit size={14} /></button>
                                                <button onClick={() => handleDelete(exec.id)} className="p-1.5 bg-white shadow-sm rounded-lg text-red-600 hover:bg-red-50 transition-colors" title="Hapus"><Trash2 size={14} /></button>
                                            </>
                                        )}
                                    </div>
                            </div>
                        </div>
                    ))}
                    </div>
                )
            ) : (
                <div className="card">
                    <EmptyState icon={<UserCog />} title="Belum ada data pengurus" />
                </div>
            )}

            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={editingId ? "Edit Pengurus" : "Tambah Pengurus"}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {Object.keys(errors).length > 0 && (
                        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-4">
                            Ada kesalahan input:
                            <ul className="list-disc ml-5 mt-1">
                                {Object.values(errors).map((err, i) => (
                                    <li key={i}>{err}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <label className="form-label">Regional Cabang</label>
                            <select className="form-input" value={data.regional_cabang} onChange={e => setData('regional_cabang', e.target.value)}>
                                <option value="">Semua Regional (Pusat / Kosong)</option>
                                <option value="BSMI Provinsi Banten">BSMI Provinsi Banten</option>
                                <option value="BSMI Kabupaten Serang">BSMI Kabupaten Serang</option>
                                <option value="BSMI Kota Serang">BSMI Kota Serang</option>
                                <option value="BSMI Kabupaten Tangerang">BSMI Kabupaten Tangerang</option>
                                <option value="BSMI Kota Tangerang">BSMI Kota Tangerang</option>
                                <option value="BSMI Kota Tangerang Selatan">BSMI Kota Tangerang Selatan</option>
                                <option value="BSMI Kabupaten Pandeglang">BSMI Kabupaten Pandeglang</option>
                                <option value="BSMI Kota Cilegon">BSMI Kota Cilegon</option>
                                <option value="BSMI Lebak">BSMI Lebak</option>
                            </select>
                            {errors.regional_cabang && <p className="text-red-500 text-xs mt-1">{errors.regional_cabang}</p>}
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Anggota</label>
                            <select className="form-input" value={data.member_id} onChange={e => {
                                const selectedId = e.target.value;
                                const selectedMember = members.find(m => m.id.toString() === selectedId);
                                setData(data => ({ 
                                    ...data, 
                                    member_id: selectedId, 
                                    nama_lengkap: selectedMember ? selectedMember.nama_lengkap : '',
                                    profesi_utama: selectedMember?.profesi_utama || data.profesi_utama,
                                    golongan_darah: selectedMember?.golongan_darah || data.golongan_darah,
                                    kesiapan_mobilisasi: selectedMember?.kesiapan_mobilisasi !== undefined ? selectedMember.kesiapan_mobilisasi : data.kesiapan_mobilisasi,
                                    ukuran_baju: selectedMember?.ukuran_baju || data.ukuran_baju,
                                    regional_cabang: selectedMember?.regional_cabang || data.regional_cabang,
                                    bagian_divisi: selectedMember?.bagian_divisi || data.bagian_divisi,
                                }));
                            }} required>
                                <option value="">Pilih Anggota...</option>
                                {members.map(m => {
                                    const isUsed = usedMemberIds.includes(m.id) && data.member_id !== m.id.toString();
                                    return (
                                        <option key={m.id} value={m.id} disabled={isUsed}>
                                            {m.nama_lengkap} ({m.no_induk_anggota}) {isUsed ? '- (Sudah menjadi pengurus)' : ''}
                                        </option>
                                    );
                                })}
                            </select>
                            {errors.nama_lengkap && <p className="text-red-500 text-xs mt-1">{errors.nama_lengkap}</p>}
                            {errors.member_id && <p className="text-red-500 text-xs mt-1">{errors.member_id}</p>}
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="form-label">Jabatan (cth: Ketua Umum)</label>
                            <input type="text" className="form-input" value={data.jabatan} onChange={e => setData('jabatan', e.target.value)} required />
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <label className="form-label">Bagian/Divisi</label>
                            <input type="text" className="form-input" value={data.bagian_divisi} onChange={e => setData('bagian_divisi', e.target.value)} />
                        </div>
                        <div>
                            <label className="form-label">Periode Mulai</label>
                            <input type="date" className="form-input" value={data.periode_mulai} onChange={e => setData('periode_mulai', e.target.value)} required />
                        </div>
                        <div>
                            <label className="form-label">Periode Selesai</label>
                            <input type="date" className="form-input" value={data.periode_selesai} onChange={e => setData('periode_selesai', e.target.value)} />
                        </div>
                        <div className="col-span-2 grid grid-cols-2 gap-4">
                            <div>
                                <label className="form-label">Profesi Utama</label>
                                <select className="form-input" value={data.profesi_utama} onChange={e => setData('profesi_utama', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="Pelajar/Mahasiswa">Pelajar/Mahasiswa</option>
                                    <option value="Guru/Dosen">Guru/Dosen</option>
                                    <option value="Tenaga Medis">Tenaga Medis</option>
                                    <option value="PNS/TNI/Polri">PNS/TNI/Polri</option>
                                    <option value="Pegawai Swasta">Pegawai BUMN/Swasta</option>
                                    <option value="Wiraswasta/Pengusaha">Wiraswasta/Pengusaha</option>
                                    <option value="Pekerja Bebas/Freelance">Pekerja Bebas/Freelance</option>
                                    <option value="Ibu Rumah Tangga">Ibu Rumah Tangga</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Golongan Darah</label>
                                <select className="form-input" value={data.golongan_darah} onChange={e => setData('golongan_darah', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Kesiapan Mobilisasi</label>
                                <select className="form-input" value={data.kesiapan_mobilisasi ? '1' : '0'} onChange={e => setData('kesiapan_mobilisasi', e.target.value === '1')}>
                                    <option value="0">Tidak</option>
                                    <option value="1">Ya</option>
                                </select>
                            </div>
                            <div>
                                <label className="form-label">Ukuran Baju</label>
                                <select className="form-input" value={data.ukuran_baju} onChange={e => setData('ukuran_baju', e.target.value)}>
                                    <option value="">Pilih...</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="3XL">3XL</option>
                                </select>
                            </div>
                        </div>
                        <div className="col-span-2">
                            <label className="form-label">Foto Pengurus</label>
                            <input type="file" className="form-input" accept="image/*" onChange={e => setData('photo', e.target.files ? e.target.files[0] : null)} />
                            {errors.photo && <p className="text-red-500 text-xs mt-1">{errors.photo}</p>}
                        </div>
                        <div className="col-span-2 flex items-center gap-2 mt-2">
                            <input type="checkbox" id="status_aktif" className="rounded border-gray-300 text-red-600 focus:ring-red-500" checked={data.status_aktif} onChange={e => setData('status_aktif', e.target.checked)} />
                            <label htmlFor="status_aktif" className="text-sm text-gray-700 dark:text-gray-300 cursor-pointer">Pengurus Aktif Saat Ini</label>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary">Batal</button>
                        <button type="submit" className="btn-primary" disabled={processing}>Simpan</button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!viewingExecutive} onClose={() => setViewingExecutive(null)} title="Profil Pengurus" size="lg">
                {viewingExecutive && (
                    <div className="space-y-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                            <img 
                                src={viewingExecutive.photo_url || (viewingExecutive.member_gender === 'P' ? '/images/avatars/female.png' : '/images/avatars/male.png')} 
                                alt={viewingExecutive.nama_lengkap} 
                                className="w-32 h-32 rounded-xl object-cover border border-gray-200 dark:border-gray-700 shadow-sm"
                            />
                            <div className="text-center md:text-left flex-1">
                                <h3 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">
                                    {viewingExecutive.member_name || viewingExecutive.nama_lengkap}
                                </h3>
                                <p className="text-red-600 font-semibold text-lg">{viewingExecutive.jabatan}</p>
                                <p className="text-gray-500 mb-3">{viewingExecutive.regional_cabang || 'Pusat'}{viewingExecutive.bagian_divisi ? ` - ${viewingExecutive.bagian_divisi}` : ''}</p>
                                
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2">
                                    NIA: {viewingExecutive.member_nia || '-'}
                                </div>
                                
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 mt-2 ml-2">
                                    Masa Bakti: {formatDate(viewingExecutive.periode_mulai)} - {viewingExecutive.periode_selesai ? formatDate(viewingExecutive.periode_selesai) : 'Sekarang'}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Informasi Kontak</h4>
                                <div className="flex items-start gap-3">
                                    <Phone size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">No. HP / WhatsApp</div>
                                        <SensitiveDataField value={viewingExecutive.member_no_hp} />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <Mail size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">Email</div>
                                        <SensitiveDataField value={viewingExecutive.member_email} />
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                                    <div>
                                        <div className="text-xs text-gray-500">Alamat Domisili</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_alamat || '-'}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl space-y-3">
                                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Data Pribadi Lengkap</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                    <div>
                                        <div className="text-xs text-gray-500">Jenis Kelamin</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_gender === 'L' ? 'Laki-Laki' : viewingExecutive.member_gender === 'P' ? 'Perempuan' : '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Agama</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_agama || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Pendidikan Terakhir</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_pendidikan || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Jurusan</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_jurusan || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Status Keluarga</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_status_keluarga || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Jumlah Tanggungan</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.member_jumlah_tanggungan || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Profesi Utama</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.profesi_utama || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Golongan Darah</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.golongan_darah || '-'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Kesiapan Mobilisasi</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.kesiapan_mobilisasi ? 'Ya' : 'Tidak'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500">Ukuran Baju</div>
                                        <div className="font-medium text-gray-900 dark:text-white">{viewingExecutive.ukuran_baju || '-'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {viewingExecutive.notes && (
                            <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
                                <h4 className="font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-3">Catatan Tambahan</h4>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{viewingExecutive.notes}</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
                            <button type="button" onClick={() => setViewingExecutive(null)} className="btn-secondary">
                                Tutup
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
