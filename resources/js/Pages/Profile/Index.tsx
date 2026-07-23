import React, { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Building2, MapPin, Phone, Mail, Globe, Clock, Save, X, Edit, Upload, Eye, EyeOff, Target, BookOpen } from 'lucide-react';

interface Profile {
    id?: number;
    name: string;
    logo_url: string | null;
    vision: string;
    mission: string;
    address: string;
    phone: string;
    email: string;
    website: string;
    history: string;
    regional_logos_url?: Record<string, string>;
}

interface Props {
    profile: Profile | null;
}

export default function ProfileIndex({ profile }: Props) {
    const { props } = usePage<any>();
    const roles = props.auth?.roles || [];
    const isAnggotaOrRelawan = roles.includes('anggota') || roles.includes('relawan');
    const [isEditing, setIsEditing] = useState(!profile && !isAnggotaOrRelawan);
    const [previewLogo, setPreviewLogo] = useState<string | null>(profile?.logo_url || null);
    const [showRegionalLogos, setShowRegionalLogos] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        name: profile?.name || '',
        vision: profile?.vision || '',
        mission: profile?.mission || '',
        address: profile?.address || '',
        phone: profile?.phone || '',
        email: profile?.email || '',
        website: profile?.website || '',
        history: profile?.history || '',
        logo: null as File | null,
    });

    const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('logo', file);
            const reader = new FileReader();
            reader.onload = (e) => setPreviewLogo(e.target?.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/profil-organisasi', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => setIsEditing(false)
        });
    };

    return (
        <AppLayout>
            <Head title="Profil Organisasi" />

            <div className="page-header">
                <div>
                    <h1 className="page-title">Profil Organisasi</h1>
                    <p className="page-subtitle">Informasi identitas dan sejarah BSMI.</p>
                </div>
                {!isEditing && !isAnggotaOrRelawan && (
                    <button onClick={() => setIsEditing(true)} className="btn-primary">
                        <Edit size={16} /> Edit Profil
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="card max-w-4xl">
                    <form onSubmit={handleSubmit} className="card-body space-y-6">
                        {/* Logo Upload */}
                        <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 border-b border-gray-100 dark:border-gray-800 pb-6">
                            <div className="relative group w-32 h-32 flex-shrink-0">
                                {previewLogo ? (
                                    <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain rounded-2xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-105" />
                                ) : (
                                    <div className="w-full h-full rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                                        <Building2 size={40} className="text-gray-400" />
                                    </div>
                                )}
                                <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl cursor-pointer">
                                    <Upload className="text-white" />
                                    <input type="file" className="hidden" accept="image/*" onChange={handleLogoChange} />
                                </label>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                <div>
                                    <label className="form-label">Nama Organisasi</label>
                                    <input type="text" className="form-input text-lg font-semibold" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                </div>
                                <div>
                                    <label className="form-label">Email Resmi</label>
                                    <input type="email" className="form-input" value={data.email} onChange={e => setData('email', e.target.value)} />
                                </div>
                            </div>
                        </div>

                        {/* Kontak & Informasi Umum */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100 dark:border-gray-800">
                            <div>
                                <label className="form-label">Nomor Telepon</label>
                                <input type="text" className="form-input" value={data.phone} onChange={e => setData('phone', e.target.value)} />
                            </div>
                            <div>
                                <label className="form-label">Website</label>
                                <input type="text" className="form-input" value={data.website} onChange={e => setData('website', e.target.value)} placeholder="https://" />
                            </div>
                            <div className="md:col-span-2">
                                <label className="form-label">Alamat Lengkap</label>
                                <textarea className="form-input" rows={2} value={data.address} onChange={e => setData('address', e.target.value)}></textarea>
                            </div>
                        </div>

                        {/* Visi Misi Sejarah */}
                        <div className="space-y-6">
                            <div>
                                <label className="form-label text-red-600 font-semibold">Visi</label>
                                <textarea className="form-input" rows={3} value={data.vision} onChange={e => setData('vision', e.target.value)}></textarea>
                            </div>
                            <div>
                                <label className="form-label text-red-600 font-semibold">Misi</label>
                                <textarea className="form-input" rows={4} value={data.mission} onChange={e => setData('mission', e.target.value)}></textarea>
                            </div>
                            <div>
                                <label className="form-label font-semibold">Sejarah Singkat</label>
                                <textarea className="form-input" rows={5} value={data.history} onChange={e => setData('history', e.target.value)}></textarea>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                            {profile && (
                                <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary px-6">
                                    <X size={16} /> Batal
                                </button>
                            )}
                            <button type="submit" className="btn-primary px-8" disabled={processing}>
                                <Save size={16} /> Simpan Perubahan
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl">
                    {/* Left Column: Info card */}
                    <div className="card h-fit">
                        <div className="card-body flex flex-col items-center text-center border-b border-gray-100 dark:border-gray-800">
                            <div className="w-32 h-32 flex items-center justify-center mb-4">
                                {profile?.logo_url ? (
                                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain rounded-2xl drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]" />
                                ) : (
                                    <div className="w-full h-full rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4 shadow-inner">
                                        <Building2 size={48} className="text-gray-300" />
                                    </div>
                                )}
                            </div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{profile?.name}</h2>
                            <p className="text-sm text-gray-500">Indonesian Red Crescent</p>
                        </div>
                        <div className="card-body space-y-4">
                            <div className="flex items-start gap-3 text-sm">
                                <MapPin size={18} className="text-gray-400 mt-0.5 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{profile?.address || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Phone size={18} className="text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{profile?.phone || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail size={18} className="text-gray-400 flex-shrink-0" />
                                <span className="text-gray-700 dark:text-gray-300">{profile?.email || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Globe size={18} className="text-gray-400 flex-shrink-0" />
                                {profile?.website ? (
                                    <a href={profile.website} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">{profile.website}</a>
                                ) : (
                                    <span className="text-gray-500">-</span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Visi Misi Sejarah */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Visi & Misi Paper Card */}
                        <div className="relative bg-[#fdfbf7] dark:bg-amber-950/20 rounded shadow-md border border-amber-100 dark:border-amber-900/50 p-8 
                            before:absolute before:top-0 before:right-0 before:w-12 before:h-12 
                            before:bg-white dark:before:bg-gray-900 before:border-b before:border-l 
                            before:border-amber-100 dark:before:border-amber-900/50 before:shadow-[-4px_4px_4px_rgba(0,0,0,0.05)] before:rounded-bl-lg transition-transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-amber-100/50 dark:border-amber-900/30">
                                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-lg text-amber-700 dark:text-amber-400">
                                    <Target size={24} />
                                </div>
                                <h3 className="font-bold text-xl text-amber-800 dark:text-amber-500">Visi & Misi</h3>
                            </div>
                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-bold text-amber-600 dark:text-amber-600/80 uppercase tracking-wider mb-2">Visi</h4>
                                    <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base text-justify font-serif italic">
                                        "{profile?.vision || '-'}"
                                    </p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-amber-600 dark:text-amber-600/80 uppercase tracking-wider mb-2">Misi</h4>
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base text-justify font-serif">
                                        {profile?.mission || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Sejarah Singkat Paper Card */}
                        <div className="relative bg-[#f4f7f9] dark:bg-blue-950/20 rounded shadow-md border border-blue-100 dark:border-blue-900/50 p-8 
                            before:absolute before:top-0 before:right-0 before:w-12 before:h-12 
                            before:bg-white dark:before:bg-gray-900 before:border-b before:border-l 
                            before:border-blue-100 dark:before:border-blue-900/50 before:shadow-[-4px_4px_4px_rgba(0,0,0,0.05)] before:rounded-bl-lg transition-transform hover:-translate-y-1 hover:shadow-lg">
                            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-blue-100/50 dark:border-blue-900/30">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg text-blue-700 dark:text-blue-400">
                                    <BookOpen size={24} />
                                </div>
                                <h3 className="font-bold text-xl text-blue-800 dark:text-blue-500">Sejarah Singkat</h3>
                            </div>
                            <div>
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap text-base text-justify font-serif">
                                    {profile?.history || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {!isEditing && !isAnggotaOrRelawan && (
                <div className="card max-w-6xl mt-6">
                    <div className="card-header bg-gray-50/50 dark:bg-gray-800/10 flex justify-between items-center">
                        <div>
                            <h3 className="font-bold text-gray-800 dark:text-gray-200">Manajemen Logo Regional Cabang</h3>
                            <p className="text-sm text-gray-500 font-normal mt-1">Logo ini akan ditampilkan di sebelah judul halaman pada masing-masing modul regional.</p>
                        </div>
                        <button 
                            onClick={() => setShowRegionalLogos(!showRegionalLogos)}
                            className="btn-secondary flex items-center gap-2"
                        >
                            {showRegionalLogos ? <EyeOff size={16} /> : <Eye size={16} />}
                            {showRegionalLogos ? 'Sembunyikan Logo' : 'Tampilkan Logo'}
                        </button>
                    </div>
                    {showRegionalLogos && (
                        <div className="card-body border-t border-gray-100 dark:border-gray-800">
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                {[
                                    'BSMI Provinsi Banten',
                                    'BSMI Kabupaten Serang',
                                    'BSMI Kota Serang',
                                    'BSMI Kabupaten Tangerang',
                                    'BSMI Kota Tangerang',
                                    'BSMI Kota Tangerang Selatan',
                                    'BSMI Kabupaten Pandeglang',
                                    'BSMI Kota Cilegon',
                                    'BSMI Lebak'
                                ].map((regional) => (
                                    <div key={regional} className="flex flex-col items-center gap-3">
                                        <div className="relative group w-24 h-24 flex-shrink-0">
                                            {profile?.regional_logos_url?.[regional] ? (
                                                <img src={profile.regional_logos_url[regional]} alt={regional} className="w-full h-full object-contain rounded-xl drop-shadow-[0_4px_8px_rgba(0,0,0,0.1)] transition-transform duration-300 group-hover:scale-105" />
                                            ) : (
                                                <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                                                    <Building2 size={24} className="text-gray-400" />
                                                </div>
                                            )}
                                            <label className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl cursor-pointer">
                                                <Upload size={20} className="text-white" />
                                                <input type="file" className="hidden" accept="image/*" onChange={(e) => {
                                                    if (e.target.files?.[0]) {
                                                        router.post('/profil-organisasi/regional-logos', {
                                                            regional: regional,
                                                            logo: e.target.files[0],
                                                        }, { preserveScroll: true, forceFormData: true });
                                                    }
                                                }} />
                                            </label>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs font-semibold text-gray-700 dark:text-gray-300 leading-tight">{regional}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AppLayout>
    );
}
