import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Heart, MapPin, User, DollarSign, Image as ImageIcon, Loader2 } from 'lucide-react';
import { FlashMessage } from '@/Components/Shared';
import ApplicationLogo from '@/Components/ApplicationLogo';
import Modal from '@/Components/Modal';

interface Province { id: string; name: string; }
interface City { id: string; name: string; }
interface District { id: string; name: string; }
interface Village { id: string; name: string; }

export default function DonationForm({ flash, organization }: { flash: any, organization: any }) {
    const { data, setData, post, processing, errors } = useForm({
        donor_name: '',
        donor_phone: '',
        address: '',
        province: '',
        city: '',
        district: '',
        village: '',
        type: 'uang' as 'uang' | 'barang',
        amount: '',
        goods_description: '',
        date: new Date().toISOString().split('T')[0],
        receipt: null as File | null,
    });

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [villages, setVillages] = useState<Village[]>([]);
    
    const [selectedProvId, setSelectedProvId] = useState('');
    const [selectedCityId, setSelectedCityId] = useState('');
    const [selectedDistId, setSelectedDistId] = useState('');

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        fetch('https://www.emsifa.com/api-wilayah-indonesia/api/provinces.json')
            .then(res => res.json())
            .then(data => setProvinces(data))
            .catch(err => console.error(err));
    }, []);

    useEffect(() => {
        if (selectedProvId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/regencies/${selectedProvId}.json`)
                .then(res => res.json())
                .then(data => setCities(data))
                .catch(err => console.error(err));
        } else {
            setCities([]);
        }
    }, [selectedProvId]);

    useEffect(() => {
        if (selectedCityId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/districts/${selectedCityId}.json`)
                .then(res => res.json())
                .then(data => setDistricts(data))
                .catch(err => console.error(err));
        } else {
            setDistricts([]);
        }
    }, [selectedCityId]);

    useEffect(() => {
        if (selectedDistId) {
            fetch(`https://www.emsifa.com/api-wilayah-indonesia/api/villages/${selectedDistId}.json`)
                .then(res => res.json())
                .then(data => setVillages(data))
                .catch(err => console.error(err));
        } else {
            setVillages([]);
        }
    }, [selectedDistId]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setData('receipt', file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/konfirmasi-donasi', {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                setShowSuccessModal(true);
            }
        });
    };

    return (
        <div className="min-h-screen relative py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-900 overflow-hidden">
            {/* Palestine Flag Gradient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-gradient-to-br from-black via-theme-800 to-green-800 opacity-90"></div>
                {/* Diagonal White/Red accents mimicking the flag */}
                <div className="absolute top-0 left-0 w-full h-full opacity-30">
                    <div className="absolute top-0 right-0 w-[80%] h-[150%] bg-white transform rotate-45 translate-x-1/2 -translate-y-1/4 rounded-full blur-3xl"></div>
                    <div className="absolute top-0 left-0 w-1/2 h-[150%] bg-theme-600 transform -rotate-45 -translate-x-1/2 -translate-y-1/4 blur-3xl"></div>
                </div>
            </div>

            {/* Palestine Badge Top Right */}
            <div className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex flex-col items-center gap-1.5 opacity-90 hover:opacity-100 transition-opacity">
                <div className="flex gap-1 items-center bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 shadow-lg">
                    <span className="text-xl leading-none">🇵🇸</span>
                    <span className="text-white font-bold text-xs tracking-widest uppercase">Free Palestine</span>
                </div>
            </div>

            <div className="relative z-10">
                <Head title="Konfirmasi Donasi" />
                
                {flash?.error && (
                    <FlashMessage flash={{ error: flash.error }} />
                )}

                <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-8 relative z-20">
                    <div className="w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                        {organization?.logo_url ? (
                            <img 
                                src={organization.logo_url} 
                                alt="Logo BSMI" 
                                className="w-full h-full object-contain rounded-xl filter drop-shadow-[0_4px_6px_rgba(0,0,0,0.4)] drop-shadow-[0_-1px_1px_rgba(255,255,255,0.2)]" 
                            />
                        ) : (
                            <Heart className="w-16 h-16 mx-auto text-white drop-shadow-md" />
                        )}
                    </div>
                    <h1 className="text-3xl font-extrabold text-white mb-2 drop-shadow-md">Konfirmasi Donasi Publik</h1>
                    <p className="text-gray-100 font-medium drop-shadow-md">Terima kasih atas kepedulian Anda. Silakan isi form di bawah ini untuk mengonfirmasi donasi Anda.</p>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700 relative z-20">
                    <form onSubmit={submit} className="p-6 sm:p-8 space-y-8">
                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
                                <User size={18} className="text-theme-500" /> Data Diri Donatur
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="form-label">Nama Lengkap / Instansi <span className="text-red-500">*</span></label>
                                    <input type="text" required className="form-input" value={data.donor_name} onChange={e => setData('donor_name', e.target.value)} placeholder="Contoh: Hamba Allah" />
                                    {errors.donor_name && <p className="mt-1 text-sm text-red-500">{errors.donor_name}</p>}
                                </div>
                                <div>
                                    <label className="form-label">Nomor Telepon/WhatsApp <span className="text-red-500">*</span></label>
                                    <input type="text" required className="form-input" value={data.donor_phone} onChange={e => setData('donor_phone', e.target.value)} placeholder="08123456789" />
                                    {errors.donor_phone && <p className="mt-1 text-sm text-red-500">{errors.donor_phone}</p>}
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
                                <MapPin size={18} className="text-theme-500" /> Alamat Lengkap
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="form-label">Detail Jalan / Rumah <span className="text-red-500">*</span></label>
                                    <textarea required rows={2} className="form-input" value={data.address} onChange={e => setData('address', e.target.value)} placeholder="Jl. Merdeka No. 1, RT 01/RW 02"></textarea>
                                    {errors.address && <p className="mt-1 text-sm text-red-500">{errors.address}</p>}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Provinsi <span className="text-red-500">*</span></label>
                                        <select required className="form-input" value={selectedProvId} onChange={e => {
                                            setSelectedProvId(e.target.value);
                                            setData('province', e.target.options[e.target.selectedIndex].text);
                                            setSelectedCityId(''); setSelectedDistId('');
                                        }}>
                                            <option value="">Pilih Provinsi</option>
                                            {provinces.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Kabupaten/Kota <span className="text-red-500">*</span></label>
                                        <select required disabled={!selectedProvId} className="form-input disabled:opacity-50" value={selectedCityId} onChange={e => {
                                            setSelectedCityId(e.target.value);
                                            setData('city', e.target.options[e.target.selectedIndex].text);
                                            setSelectedDistId('');
                                        }}>
                                            <option value="">Pilih Kab/Kota</option>
                                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Kecamatan <span className="text-red-500">*</span></label>
                                        <select required disabled={!selectedCityId} className="form-input disabled:opacity-50" value={selectedDistId} onChange={e => {
                                            setSelectedDistId(e.target.value);
                                            setData('district', e.target.options[e.target.selectedIndex].text);
                                        }}>
                                            <option value="">Pilih Kecamatan</option>
                                            {districts.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Desa/Kelurahan <span className="text-red-500">*</span></label>
                                        <select required disabled={!selectedDistId} className="form-input disabled:opacity-50" onChange={e => setData('village', e.target.options[e.target.selectedIndex].text)}>
                                            <option value="">Pilih Desa/Kelurahan</option>
                                            {villages.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-lg font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2 mb-4 flex items-center gap-2">
                                <DollarSign size={18} className="text-theme-500" /> Detail Donasi
                            </h2>
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="form-label">Bentuk Donasi <span className="text-red-500">*</span></label>
                                        <select className="form-input" value={data.type} onChange={e => setData('type', e.target.value as 'uang'|'barang')}>
                                            <option value="uang">Uang</option>
                                            <option value="barang">Barang</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="form-label">Tanggal Transfer / Penyerahan <span className="text-red-500">*</span></label>
                                        <input type="date" required className="form-input" value={data.date} onChange={e => setData('date', e.target.value)} />
                                    </div>
                                </div>
                                
                                {data.type === 'uang' ? (
                                    <div>
                                        <label className="form-label">Jumlah Donasi (Rp) <span className="text-red-500">*</span></label>
                                        <input type="number" min="1000" required className="form-input" value={data.amount} onChange={e => setData('amount', e.target.value)} placeholder="Contoh: 50000" />
                                        {errors.amount && <p className="mt-1 text-sm text-red-500">{errors.amount}</p>}
                                    </div>
                                ) : (
                                    <div>
                                        <label className="form-label">Deskripsi Barang <span className="text-red-500">*</span></label>
                                        <input type="text" required className="form-input" value={data.goods_description} onChange={e => setData('goods_description', e.target.value)} placeholder="Contoh: 10 Dus Mie Instan" />
                                        {errors.goods_description && <p className="mt-1 text-sm text-red-500">{errors.goods_description}</p>}
                                    </div>
                                )}
                                
                                <div>
                                    <label className="form-label">Bukti Transfer / Foto Penyerahan Barang <span className="text-red-500">*</span></label>
                                    <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-xl relative group overflow-hidden bg-gray-50 dark:bg-gray-700/30">
                                        {previewUrl ? (
                                            <div className="w-full relative">
                                                <img src={previewUrl} alt="Preview" className="mx-auto h-48 object-contain rounded-md" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-md">
                                                    <span className="text-white text-sm">Ganti Gambar</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1 text-center">
                                                <ImageIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <div className="flex text-sm text-gray-600 dark:text-gray-400 justify-center">
                                                    <span className="relative cursor-pointer rounded-md font-medium text-theme-600 hover:text-theme-500">
                                                        <span>Upload file gambar bukti</span>
                                                    </span>
                                                </div>
                                                <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                        <input type="file" required accept="image/*" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileChange} />
                                    </div>
                                    {errors.receipt && <p className="mt-1 text-sm text-red-500">{errors.receipt}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="pt-6">
                            <button type="submit" disabled={processing} className="w-full flex items-center justify-center py-3 px-4 rounded-xl shadow-sm text-base font-medium text-white bg-theme-600 hover:bg-theme-700 transition-colors disabled:opacity-75">
                                {processing ? <Loader2 className="animate-spin mr-2" size={20} /> : <Heart className="mr-2" size={20} />}
                                {processing ? 'Memproses...' : 'Kirim Konfirmasi Donasi'}
                            </button>
                            <p className="text-center text-xs text-gray-500 mt-4">
                                Dengan mengirimkan form ini, Anda menyatakan bahwa data yang diberikan adalah benar dan dapat dipertanggungjawabkan.
                            </p>
                        </div>
                    </form>
                </div>
            </div>

            <Modal show={showSuccessModal} onClose={() => {
                setShowSuccessModal(false);
                window.location.reload();
            }} maxWidth="md">
                <div className="p-8 text-center animate-bounce-in">
                    <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 dark:bg-green-900/30 mb-6">
                        <Heart className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                        Alhamdulillah, Konfirmasi Berhasil!
                    </h3>
                    <p className="text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-8">
                        Terima Kasih Atas Donasi yang Anda Berikan, Semoga Allah SWT, Tuhan Yang Maha Esa memberikan Rezeki Berlimpah, dan Kebahagiaan Dunia Akhirat, Aamiin. :)
                    </p>
                    <button 
                        onClick={() => {
                            setShowSuccessModal(false);
                            window.location.reload();
                        }}
                        className="w-full inline-flex justify-center rounded-xl border border-transparent bg-theme-600 px-4 py-3 text-base font-medium text-white shadow-sm hover:bg-theme-700 focus:outline-none focus:ring-2 focus:ring-theme-500 focus:ring-offset-2 transition-colors"
                    >
                        Tutup & Selesai
                    </button>
                </div>
            </Modal>
            </div>
        </div>
    );
}
