import React, { useState } from 'react';
import { Head, useForm, Link, usePage } from '@inertiajs/react';
import { Stethoscope, CheckCircle2 } from 'lucide-react';

const JOB_CATEGORIES: Record<string, string[]> = {
    'Pemerintahan & Keamanan': ['Polisi', 'TNI', 'PNS / ASN', 'Pegawai BUMN', 'Pegawai BUMD'],
    'Kesehatan & Medis': ['Dokter', 'Perawat', 'Bidan', 'Apoteker', 'Ahli Gizi', 'Tenaga Kesehatan Lainnya'],
    'Pendidikan & Akademik': ['Guru', 'Dosen', 'Mahasiswa', 'Peneliti'],
    'Swasta & Profesional': ['Karyawan Swasta', 'IT / Programmer', 'Akuntan', 'Pegawai Bank', 'Pekerja Hukum'],
    'Wiraswasta & Pekerja Mandiri': ['Pengusaha', 'Pedagang', 'Freelancer', 'Seniman/Kreator', 'Pengemudi (Ojol/Supir)'],
    'Sosial & Organisasi': ['Pekerja Sosial', 'Aktivis', 'Relawan Lembaga Lain', 'Pegawai NGO'],
    'Lainnya': ['Ibu Rumah Tangga', 'Pensiunan', 'Belum Bekerja', 'Pelajar', 'Lainnya']
};

export default function VolunteerRegister() {
    const { props } = usePage<any>();
    const organization = props.organization;
    const [submitted, setSubmitted] = useState(false);
    const { data, setData, post, processing, errors } = useForm({
        name: '', email: '', phone: '', address: '', birth_date: '',
        job_category: '', job_type: '', id_card: null as File | null, skills: '', motivation: '',
        gender: '', golongan_darah: '', kesiapan_mobilisasi: false, ukuran_baju: '',
        emergency_contact: '', emergency_phone: '', regional_cabang: '', pendidikan_terakhir: '',
        jurusan: '', status_keluarga: '', agama: '', jumlah_tanggungan: ''
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/daftar-relawan', {
            onSuccess: () => {
                window.location.href = '/daftar-relawan?success=1';
            }
        });
    };

    const isSuccess = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('success') === '1';

    if (submitted || isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Head title="Pendaftaran Relawan Berhasil" />
                <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 text-center">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
                        <CheckCircle2 size={40} />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
                    <p className="text-gray-500 mb-8 leading-relaxed">
                        Terima kasih atas niat baik Anda bergabung menjadi relawan BSMI. Data Anda telah kami terima dan akan segera direview oleh tim kami. Kami akan menghubungi Anda melalui email atau telepon.
                    </p>
                    <a href="/" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-6 rounded-xl transition-colors">
                        Kembali ke Beranda
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="Pendaftaran Relawan" />
            
            <div className="bg-emerald-600 py-12 px-4 sm:px-6 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                <div className="max-w-2xl mx-auto relative z-10 text-center">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mx-auto mb-4 overflow-hidden p-2">
                        {organization?.logo_url ? (
                            <img src={organization.logo_url} alt="Logo" className="w-full h-full object-contain drop-shadow-md" />
                        ) : (
                            <Stethoscope size={32} className="text-white" />
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Formulir Relawan {organization?.name ? organization.name.split(' – ')[0] : 'BSMI'}</h1>
                    <p className="text-emerald-100">Mari bergabung bersama kami dalam misi kemanusiaan.</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 sm:px-6 -mt-8 pb-12 relative z-20">
                <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-10">
                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Lengkap *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.name} onChange={e => setData('name', e.target.value)} required />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Kelamin *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.gender} onChange={e => setData('gender', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                                <input type="email" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.email} onChange={e => setData('email', e.target.value)} required />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nomor Telepon/WA *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.phone} onChange={e => setData('phone', e.target.value)} required />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Tanggal Lahir *</label>
                                <input type="date" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.birth_date} onChange={e => setData('birth_date', e.target.value)} required />
                                {errors.birth_date && <p className="text-red-500 text-xs mt-1">{errors.birth_date}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Golongan Darah *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.golongan_darah} onChange={e => setData('golongan_darah', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="A">A</option>
                                    <option value="B">B</option>
                                    <option value="AB">AB</option>
                                    <option value="O">O</option>
                                </select>
                                {errors.golongan_darah && <p className="text-red-500 text-xs mt-1">{errors.golongan_darah}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Alamat Lengkap *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.address} onChange={e => setData('address', e.target.value)} required />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                            
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Regional Cabang *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.regional_cabang} onChange={e => setData('regional_cabang', e.target.value)} required>
                                    <option value="" disabled>Pilih Regional...</option>
                                    <option value="BSMI Kabupaten Serang">BSMI Kabupaten Serang</option>
                                    <option value="BSMI Kota Serang">BSMI Kota Serang</option>
                                    <option value="BSMI Kabupaten Tangerang">BSMI Kabupaten Tangerang</option>
                                    <option value="BSMI Kota Tangerang">BSMI Kota Tangerang</option>
                                    <option value="BSMI Kota Cilegon">BSMI Kota Cilegon</option>
                                    <option value="BSMI Lebak">BSMI Lebak</option>
                                </select>
                                {errors.regional_cabang && <p className="text-red-500 text-xs mt-1">{errors.regional_cabang}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Agama *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.agama} onChange={e => setData('agama', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="Islam">Islam</option>
                                    <option value="Protestan">Protestan</option>
                                    <option value="Katolik">Katolik</option>
                                    <option value="Hindu">Hindu</option>
                                    <option value="Buddha">Buddha</option>
                                    <option value="Khonghucu">Khonghucu</option>
                                </select>
                                {errors.agama && <p className="text-red-500 text-xs mt-1">{errors.agama}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status Keluarga *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.status_keluarga} onChange={e => setData('status_keluarga', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="Belum Menikah">Belum Menikah</option>
                                    <option value="Menikah">Menikah</option>
                                    <option value="Cerai Hidup">Cerai Hidup</option>
                                    <option value="Cerai Mati">Cerai Mati</option>
                                </select>
                                {errors.status_keluarga && <p className="text-red-500 text-xs mt-1">{errors.status_keluarga}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jumlah Tanggungan *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.jumlah_tanggungan} onChange={e => setData('jumlah_tanggungan', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="TK">TK</option>
                                    <option value="K1">K1</option>
                                    <option value="K2">K2</option>
                                    <option value="K3">K3</option>
                                </select>
                                {errors.jumlah_tanggungan && <p className="text-red-500 text-xs mt-1">{errors.jumlah_tanggungan}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pendidikan Terakhir *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.pendidikan_terakhir} onChange={e => setData('pendidikan_terakhir', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="SMA/SMK Sederajat">SMA/SMK Sederajat</option>
                                    <option value="D1">D1</option>
                                    <option value="D2">D2</option>
                                    <option value="D3">D3</option>
                                    <option value="D4">D4</option>
                                    <option value="S1">S1</option>
                                    <option value="S2">S2</option>
                                    <option value="S3">S3</option>
                                </select>
                                {errors.pendidikan_terakhir && <p className="text-red-500 text-xs mt-1">{errors.pendidikan_terakhir}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jurusan *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.jurusan} onChange={e => setData('jurusan', e.target.value)} placeholder="e.g. Teknik, Kedokteran" required />
                                {errors.jurusan && <p className="text-red-500 text-xs mt-1">{errors.jurusan}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Nama Kontak Darurat *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.emergency_contact} onChange={e => setData('emergency_contact', e.target.value)} required />
                                {errors.emergency_contact && <p className="text-red-500 text-xs mt-1">{errors.emergency_contact}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Telepon Kontak Darurat *</label>
                                <input type="text" className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.emergency_phone} onChange={e => setData('emergency_phone', e.target.value)} required />
                                {errors.emergency_phone && <p className="text-red-500 text-xs mt-1">{errors.emergency_phone}</p>}
                            </div>

                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kesiapan Mobilisasi *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.kesiapan_mobilisasi ? '1' : '0'} onChange={e => setData('kesiapan_mobilisasi', e.target.value === '1')} required>
                                    <option value="0">Tidak</option>
                                    <option value="1">Ya</option>
                                </select>
                                {errors.kesiapan_mobilisasi && <p className="text-red-500 text-xs mt-1">{errors.kesiapan_mobilisasi}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ukuran Baju *</label>
                                <select className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" value={data.ukuran_baju} onChange={e => setData('ukuran_baju', e.target.value)} required>
                                    <option value="" disabled>Pilih...</option>
                                    <option value="S">S</option>
                                    <option value="M">M</option>
                                    <option value="L">L</option>
                                    <option value="XL">XL</option>
                                    <option value="XXL">XXL</option>
                                    <option value="3XL">3XL</option>
                                </select>
                                {errors.ukuran_baju && <p className="text-red-500 text-xs mt-1">{errors.ukuran_baju}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Kategori Pekerjaan *</label>
                                <select 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white" 
                                    value={data.job_category} 
                                    onChange={e => {
                                        setData('job_category', e.target.value);
                                        setData('job_type', ''); // Reset job type when category changes
                                    }} 
                                    required
                                >
                                    <option value="" disabled>Pilih Kategori...</option>
                                    {Object.keys(JOB_CATEGORIES).map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                {errors.job_category && <p className="text-red-500 text-xs mt-1">{errors.job_category}</p>}
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Jenis Pekerjaan *</label>
                                <select 
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white disabled:bg-gray-100" 
                                    value={data.job_type} 
                                    onChange={e => setData('job_type', e.target.value)} 
                                    required
                                    disabled={!data.job_category}
                                >
                                    <option value="" disabled>Pilih Jenis Pekerjaan...</option>
                                    {data.job_category && JOB_CATEGORIES[data.job_category]?.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                                {errors.job_type && <p className="text-red-500 text-xs mt-1">{errors.job_type}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Kartu Identitas (KTP/SIM/Paspor) *</label>
                                <input 
                                    type="file" 
                                    accept=".jpg,.jpeg,.png,.pdf"
                                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100" 
                                    onChange={e => setData('id_card', e.target.files ? e.target.files[0] : null)} 
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">Format: JPG, PNG, PDF. Maksimal 2MB.</p>
                                {errors.id_card && <p className="text-red-500 text-xs mt-1">{errors.id_card}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Keahlian & Pengalaman *</label>
                                <p className="text-xs text-gray-500 mb-2">Sebutkan keahlian yang Anda miliki (medis, logistik, IT, desain, dll) dan pengalaman organisasi/relawan sebelumnya.</p>
                                <textarea rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.skills} onChange={e => setData('skills', e.target.value)} required></textarea>
                                {errors.skills && <p className="text-red-500 text-xs mt-1">{errors.skills}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Motivasi Bergabung *</label>
                                <textarea rows={4} className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500" value={data.motivation} onChange={e => setData('motivation', e.target.value)} required></textarea>
                                {errors.motivation && <p className="text-red-500 text-xs mt-1">{errors.motivation}</p>}
                            </div>
                        </div>

                        <div className="pt-4 mt-6 border-t border-gray-100 flex items-center justify-between">
                            <a href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">Batal</a>
                            <button
                                type="submit"
                                disabled={processing}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-8 rounded-xl shadow-lg shadow-emerald-200 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {processing ? 'Mengirim...' : 'Kirim Pendaftaran'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
