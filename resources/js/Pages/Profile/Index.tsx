import React, { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Building2, MapPin, Phone, Mail, Globe, Clock, Save, X, Edit, Upload } from 'lucide-react';

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

    const { data, setData, post, processing, errors } = useForm({
        _method: 'PUT',
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
                            <div className="relative group">
                                <div className="w-32 h-32 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-dashed border-gray-300 dark:border-gray-700">
                                    {previewLogo ? (
                                        <img src={previewLogo} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building2 size={40} className="text-gray-400" />
                                    )}
                                </div>
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
                            <div className="w-32 h-32 rounded-3xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center p-4 mb-4 shadow-inner">
                                {profile?.logo_url ? (
                                    <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                ) : (
                                    <Building2 size={48} className="text-gray-300" />
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
                    <div className="lg:col-span-2 space-y-6">
                        <div className="card">
                            <div className="card-header bg-red-50/50 dark:bg-red-900/10">
                                <h3 className="font-bold text-red-800 dark:text-red-400">Visi & Misi</h3>
                            </div>
                            <div className="card-body space-y-6">
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Visi</h4>
                                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed text-lg font-medium">
                                        {profile?.vision || '-'}
                                    </p>
                                </div>
                                <div className="h-px bg-gray-100 dark:bg-gray-800 w-full" />
                                <div>
                                    <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Misi</h4>
                                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                        {profile?.mission || '-'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <div className="card-header flex items-center gap-2">
                                <Clock size={18} className="text-gray-500" />
                                <h3 className="font-semibold text-gray-900 dark:text-white">Sejarah Singkat</h3>
                            </div>
                            <div className="card-body">
                                <div className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                                    {profile?.history || '-'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
