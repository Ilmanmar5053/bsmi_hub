import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard, formatRupiah } from '@/Components/Shared';
import { Users, UserCog, UserPlus, Heart, Calendar, CreditCard, BarChart3, Wallet, GraduationCap, CheckCircle2, Circle, MapPin, Eye, EyeOff } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface Props {
    stats: {
        totalMembers: number;
        totalExecutives: number;
        totalVolunteers: number;
        totalBeneficiaries: number;
        totalPrograms: number;
        totalDonations: number;
        pendingVolunteers: number;
        balance: number;
    };
    chartData: { month: string; pemasukan: number; pengeluaran: number }[];
    recentPrograms: { id: number; title: string; category: string; status: string; start_date: string; location?: string; description?: string }[];
    isVolunteer?: boolean;
    isAnggota?: boolean;
    volunteerData?: any;
    diklatsarModules?: any[];
    duesHistory?: any[];
    distributionHistory?: any[];
}

const STAGES = [
    'Belum Mulai',
    'Materi 1',
    'Materi 2',
    'Materi 3',
    'Materi 4',
    'Materi 5',
    'Lulus / Pelantikan'
];

export default function Dashboard({ stats, chartData, recentPrograms, isVolunteer, isAnggota, volunteerData, diklatsarModules, duesHistory, distributionHistory }: Props) {
    const { props } = usePage<any>();
    const canManageFinance = props.auth?.permissions?.includes('manage-finance');
    const [showFinance, setShowFinance] = useState(false);

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500">Ringkasan aktivitas dan metrik BSMI.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard title="Total Anggota" value={stats.totalMembers} icon={<Users className="text-blue-600" />} iconBg="bg-blue-100" />
                <StatCard title="Program Aktif" value={stats.totalPrograms} icon={<Calendar className="text-green-600" />} iconBg="bg-green-100" />
                <StatCard title="Relawan" value={stats.totalVolunteers} icon={<UserPlus className="text-purple-600" />} iconBg="bg-purple-100" />
                <StatCard title="Penerima Manfaat" value={stats.totalBeneficiaries} icon={<Heart className="text-orange-600" />} iconBg="bg-orange-100" />
                
                {canManageFinance && (
                    <>
                        <StatCard 
                            title="Total Donasi" 
                            value={
                                <div className="flex items-center gap-2">
                                    <span>{showFinance ? formatRupiah(stats.totalDonations) : 'Rp ••••••••'}</span>
                                    <button onClick={() => setShowFinance(!showFinance)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {showFinance ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            } 
                            icon={<CreditCard className="text-red-600" />} 
                            iconBg="bg-red-100" 
                        />
                        <StatCard title="Relawan Pending" value={stats.pendingVolunteers} icon={<UserPlus className="text-yellow-600" />} iconBg="bg-yellow-100" />
                        <StatCard 
                            title="Saldo Keuangan" 
                            value={
                                <div className="flex items-center gap-2">
                                    <span>{showFinance ? formatRupiah(stats.balance) : 'Rp ••••••••'}</span>
                                    <button onClick={() => setShowFinance(!showFinance)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {showFinance ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            } 
                            icon={<Wallet className="text-teal-600" />} 
                            iconBg="bg-teal-100" 
                        />
                        <StatCard title="Total Pengurus" value={stats.totalExecutives} icon={<UserCog className="text-indigo-600" />} iconBg="bg-indigo-100" />
                    </>
                )}
            </div>

            <div className={`grid grid-cols-1 gap-6`}>
                {canManageFinance && (
                    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        <h2 className="text-lg font-semibold mb-4">Grafik Keuangan Tahun 2026</h2>
                        <div className="h-[400px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorPemasukan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                        </linearGradient>
                                        <linearGradient id="colorPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="month" />
                                    <YAxis tickFormatter={(val) => `${val / 1000000}`} />
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <Tooltip formatter={(val: any) => formatRupiah(val)} />
                                    <Legend />
                                    <Area type="monotone" dataKey="pemasukan" name="Pemasukan" stroke="#10B981" fillOpacity={1} fill="url(#colorPemasukan)" />
                                    <Area type="monotone" dataKey="pengeluaran" name="Pengeluaran" stroke="#EF4444" fillOpacity={1} fill="url(#colorPengeluaran)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {!isVolunteer && (
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-4">Program Terbaru</h2>
                    {recentPrograms.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recentPrograms.map((program) => (
                                <div key={program.id} className={`rounded-2xl shadow-sm border hover:shadow-md transition-shadow group flex flex-col h-full ${
                                    program.status === 'ongoing' ? 'bg-blue-50/50 border-blue-100 dark:bg-blue-900/10 dark:border-blue-900/30' :
                                    program.status === 'completed' ? 'bg-green-50/50 border-green-100 dark:bg-green-900/10 dark:border-green-900/30' :
                                    'bg-yellow-50/50 border-yellow-100 dark:bg-yellow-900/10 dark:border-yellow-900/30'
                                }`}>
                                    <div className="card-body flex flex-col flex-1">
                                        <div className="flex justify-between items-start mb-3">
                                            <span className="text-xs font-semibold px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg">
                                                {program.category}
                                            </span>
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                program.status === 'ongoing' ? 'bg-blue-100 text-blue-700' :
                                                program.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {program.status === 'ongoing' ? 'Berjalan' : program.status === 'completed' ? 'Selesai' : 'Direncanakan'}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 leading-tight">
                                            {program.title}
                                        </h3>
                                        <div className="flex flex-col gap-1.5 mb-3 text-xs text-gray-500 dark:text-gray-400">
                                            <div className="flex items-center gap-1.5">
                                                <Calendar size={14} className="text-gray-400" />
                                                <span>{program.start_date || 'Tanggal belum ditentukan'}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <MapPin size={14} className="text-gray-400" />
                                                <span className="truncate">{program.location || 'Lokasi belum ditentukan'}</span>
                                            </div>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-1">
                                            {program.description || 'Tidak ada deskripsi.'}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="card p-6 text-center text-gray-500">
                            <p className="text-sm">Belum ada program terbaru.</p>
                        </div>
                    )}
                </div>
            )}

            {isAnggota && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <CreditCard className="text-blue-600" size={20} />
                            <h2 className="text-lg font-semibold">Riwayat Iuran Saya</h2>
                        </div>
                        <div className="space-y-3">
                            {duesHistory?.map(due => (
                                <div key={due.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                                    <div>
                                        <p className="font-medium text-sm text-gray-900 dark:text-white">{due.period?.name}</p>
                                        <p className="text-xs text-gray-500">{due.paid_date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-sm text-gray-900 dark:text-white">{formatRupiah(due.amount)}</p>
                                        <span className="badge-green mt-1 text-[10px]">Lunas</span>
                                    </div>
                                </div>
                            ))}
                            {(!duesHistory || duesHistory.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-4">Belum ada riwayat iuran.</p>
                            )}
                        </div>
                    </div>

                    <div className="card p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Wallet className="text-emerald-600" size={20} />
                            <h2 className="text-lg font-semibold">History Penyaluran Dana</h2>
                        </div>
                        <div className="space-y-3">
                            {distributionHistory?.map(trx => (
                                <div key={trx.id} className="flex justify-between items-center p-3 border border-gray-100 dark:border-gray-800 rounded-xl">
                                    <div className="flex-1 min-w-0 pr-4">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{trx.description}</p>
                                        <p className="text-xs text-gray-500 truncate">{trx.date} • {trx.program?.title || 'Operasional'}</p>
                                    </div>
                                    <p className="font-bold text-sm text-red-600 flex-shrink-0">-{formatRupiah(trx.amount)}</p>
                                </div>
                            ))}
                            {(!distributionHistory || distributionHistory.length === 0) && (
                                <p className="text-sm text-gray-500 text-center py-4">Belum ada penyaluran dana tercatat.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {isVolunteer && volunteerData && (
                <div className="mt-6 card relative">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold">Progres Diklatsar Saya</h2>
                        {volunteerData.diklatsar_stage === 6 && (
                            <a href={`/diklatsar/${volunteerData.id}/certificate`} target="_blank" rel="noreferrer" className="btn-primary text-sm">
                                <GraduationCap size={16} className="mr-1" /> Cetak Sertifikat
                            </a>
                        )}
                    </div>
                    
                    {/* Progress Indicator */}
                    <div className="flex items-center justify-between w-full mb-8 relative">
                        {STAGES.map((stage, idx) => {
                            const isCompleted = idx <= volunteerData.diklatsar_stage;
                            const isCurrent = idx === volunteerData.diklatsar_stage;
                            return (
                                <React.Fragment key={idx}>
                                    <div className="flex flex-col items-center relative z-10 w-24">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                                            isCompleted ? 'bg-theme-600 text-white shadow-lg shadow-theme-200' : 'bg-gray-100 text-gray-400'
                                        } ${isCurrent && idx < 6 ? 'ring-4 ring-theme-100' : ''}`}>
                                            {idx === 6 ? <GraduationCap size={20} /> : (isCompleted ? <CheckCircle2 size={20} /> : <Circle size={14} />)}
                                        </div>
                                        <span className="text-xs font-medium text-gray-700 text-center mt-2">
                                            {stage}
                                        </span>
                                    </div>
                                    {idx < STAGES.length - 1 && (
                                        <div className={`flex-1 h-1.5 -mx-4 rounded-full z-0 ${idx < volunteerData.diklatsar_stage ? 'bg-theme-500' : 'bg-gray-200'}`}></div>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </div>

                    {/* Module Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {diklatsarModules?.map(mod => {
                            const isPast = mod.stage_number <= volunteerData.diklatsar_stage;
                            return (
                                <div key={mod.id} className={`p-4 rounded-xl border ${isPast ? 'border-theme-200 bg-theme-50/30' : 'border-gray-200 bg-white'}`}>
                                    <div className="text-xs font-bold text-theme-600 mb-1">Materi {mod.stage_number}</div>
                                    <h3 className="font-semibold text-gray-900 mb-2">{mod.title}</h3>
                                    {mod.description && <p className="text-xs text-gray-600 mb-3">{mod.description}</p>}
                                    <div className="space-y-1.5 text-xs">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Calendar size={14} className="text-gray-400" />
                                            <span>{mod.schedule || 'Jadwal belum ditentukan'}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <UserCog size={14} className="text-gray-400" />
                                            <span>{mod.speaker || 'Pemateri belum ditentukan'}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
