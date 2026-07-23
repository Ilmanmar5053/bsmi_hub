import React, { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { StatCard, formatRupiah } from '@/Components/Shared';
import { Users, UserCog, UserPlus, Heart, Calendar, CreditCard, BarChart3, Wallet, GraduationCap, CheckCircle2, Circle, MapPin, Eye, EyeOff, PackageOpen, Box } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
    stats: {
        totalMembers: number;
        totalExecutives: number;
        totalVolunteers: number;
        totalBeneficiaries: number;
        totalPrograms: number;
        totalDonations: number;
        balance: number;
    };
    chartData: { month: string; pemasukan: number; pengeluaran: number }[];
    recentPrograms: { id: number; title: string; category: string; status: string; start_date: string; location?: string; description?: string }[];
    topAssets?: any[];
    membersPerRegional: { regional_cabang: string; total: number }[];
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

export default function Dashboard({ stats, chartData, recentPrograms, topAssets, membersPerRegional, isVolunteer, isAnggota, volunteerData, diklatsarModules, duesHistory, distributionHistory }: Props) {
    const { props } = usePage<any>();
    const isSuperAdmin = props.auth?.roles?.includes('super_admin');
    const hasFinance = isSuperAdmin || props.auth?.permissions?.includes('menu-finance');
    const hasLogistics = isSuperAdmin || props.auth?.permissions?.includes('menu-logistics');
    const hasPrograms = isSuperAdmin || props.auth?.permissions?.includes('menu-programs');
    const [showFinance, setShowFinance] = useState(false);
    const [showHighValueAssets, setShowHighValueAssets] = useState(false);

    const regionalGradients = [
        'bg-gradient-to-br from-blue-50/65 to-blue-100/65 border-blue-200/50 hover:border-blue-300',
        'bg-gradient-to-br from-emerald-50/65 to-emerald-100/65 border-emerald-200/50 hover:border-emerald-300',
        'bg-gradient-to-br from-purple-50/65 to-purple-100/65 border-purple-200/50 hover:border-purple-300',
        'bg-gradient-to-br from-amber-50/65 to-amber-100/65 border-amber-200/50 hover:border-amber-300',
        'bg-gradient-to-br from-rose-50/65 to-rose-100/65 border-rose-200/50 hover:border-rose-300',
        'bg-gradient-to-br from-indigo-50/65 to-indigo-100/65 border-indigo-200/50 hover:border-indigo-300',
    ];

    return (
        <AppLayout>
            <Head title="Dashboard" />

            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                <p className="text-sm text-gray-500">Ringkasan aktivitas dan metrik BSMI.</p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
                <StatCard compact title="Total Anggota" value={stats.totalMembers} icon={<Users className="text-blue-600" />} iconBg="bg-blue-100" />
                <StatCard compact title="Program Aktif" value={stats.totalPrograms} icon={<Calendar className="text-green-600" />} iconBg="bg-green-100" />
                <StatCard compact title="Relawan" value={stats.totalVolunteers} icon={<UserPlus className="text-purple-600" />} iconBg="bg-purple-100" />
                
                {hasFinance && (
                    <>
                        <StatCard 
                            compact
                            title="Total Donasi" 
                            value={
                                <div className="flex items-center gap-2">
                                    <span>{showFinance ? formatRupiah(stats.totalDonations) : 'Rp ••••••••'}</span>
                                    <button onClick={() => setShowFinance(!showFinance)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {showFinance ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            } 
                            icon={<CreditCard className="text-red-600" />} 
                            iconBg="bg-red-100" 
                        />
                        <StatCard 
                            compact
                            title="Saldo Keuangan" 
                            value={
                                <div className="flex items-center gap-2">
                                    <span>{showFinance ? formatRupiah(stats.balance) : 'Rp ••••••••'}</span>
                                    <button onClick={() => setShowFinance(!showFinance)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                        {showFinance ? <EyeOff size={16} /> : <Eye size={16} />}
                                    </button>
                                </div>
                            } 
                            icon={<Wallet className="text-teal-600" />} 
                            iconBg="bg-teal-100" 
                        />
                        <StatCard compact title="Total Pengurus" value={stats.totalExecutives} icon={<UserCog className="text-indigo-600" />} iconBg="bg-indigo-100" />
                    </>
                )}
            </div>

            {/* Anggota per Regional (Grid Layout) */}
            <div className="mb-6 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                    <Users className="text-theme-600" size={16} />
                    <h2 className="text-sm font-bold text-gray-800 dark:text-white">Anggota per Regional</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 pb-2">
                    {membersPerRegional && membersPerRegional.length > 0 ? membersPerRegional.map((regional, idx) => (
                        <div key={idx} className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors ${regionalGradients[idx % regionalGradients.length]}`}>
                            <div className="w-6 h-6 flex-shrink-0 rounded-full overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                                {props.organization?.logo_url ? (
                                    <img src={props.organization.logo_url} alt="Logo BSMI" className="w-full h-full object-contain p-0.5" />
                                ) : (
                                    <div className="w-full h-full bg-theme-100 text-theme-600 flex items-center justify-center font-bold text-[10px]">
                                        {regional.regional_cabang.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </div>
                            <span className="text-xs font-semibold text-gray-900 leading-tight flex-1">{regional.regional_cabang}</span>
                            <div className="text-xs font-bold text-gray-700 bg-white/60 px-2 py-0.5 rounded-full flex-shrink-0 backdrop-blur-sm shadow-sm border border-white/50">
                                {regional.total}
                            </div>
                        </div>
                    )) : (
                        <div className="text-xs text-gray-500 py-1">Belum ada data regional.</div>
                    )}
                </div>
            </div>

            <div className={`grid grid-cols-1 ${hasFinance && hasLogistics ? 'lg:grid-cols-3' : ''} gap-6 mb-6`}>
                {hasFinance && (
                    <div className="lg:col-span-2 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
                        {/* Modern Chart Header */}
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Grafik Keuangan</h2>
                                <p className="text-xs text-gray-400 mt-0.5">Perbandingan arus kas bulanan — Tahun 2026</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pemasukan</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="w-3 h-3 rounded-full bg-rose-500 shadow-sm shadow-rose-200"></span>
                                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Pengeluaran</span>
                                </div>
                            </div>
                        </div>

                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                                    <defs>
                                        <linearGradient id="gradPemasukan" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#10B981" stopOpacity={0.25}/>
                                            <stop offset="100%" stopColor="#10B981" stopOpacity={0.02}/>
                                        </linearGradient>
                                        <linearGradient id="gradPengeluaran" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#F43F5E" stopOpacity={0.2}/>
                                            <stop offset="100%" stopColor="#F43F5E" stopOpacity={0.02}/>
                                        </linearGradient>
                                        <filter id="shadow-green" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#10B981" floodOpacity="0.3"/>
                                        </filter>
                                        <filter id="shadow-red" x="-20%" y="-20%" width="140%" height="140%">
                                            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#F43F5E" floodOpacity="0.3"/>
                                        </filter>
                                    </defs>

                                    <CartesianGrid
                                        strokeDasharray="4 4"
                                        vertical={false}
                                        stroke="#e5e7eb"
                                        strokeOpacity={0.5}
                                    />

                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 600, fill: '#9ca3af' }}
                                        dy={8}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 11, fontWeight: 500, fill: '#9ca3af' }}
                                        tickFormatter={(val) => val >= 1000000 ? `${(val / 1000000).toFixed(1)} jt` : val >= 1000 ? `${(val / 1000).toFixed(0)} rb` : `${val}`}
                                        dx={-5}
                                        width={55}
                                    />

                                    <Tooltip
                                        content={({ active, payload, label }: any) => {
                                            if (!active || !payload?.length) return null;
                                            return (
                                                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 p-3 min-w-[180px]">
                                                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">{label}</p>
                                                    {payload.map((entry: any, idx: number) => (
                                                        <div key={idx} className="flex items-center justify-between gap-4 py-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></span>
                                                                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{entry.name}</span>
                                                            </div>
                                                            <span className="text-xs font-bold text-gray-800 dark:text-white">{formatRupiah(entry.value)}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            );
                                        }}
                                        cursor={{ stroke: '#d1d5db', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    />

                                    <Area
                                        type="natural"
                                        dataKey="pemasukan"
                                        name="Pemasukan"
                                        stroke="#10B981"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#gradPemasukan)"
                                        dot={{ r: 4, fill: '#fff', stroke: '#10B981', strokeWidth: 2.5, filter: 'url(#shadow-green)' }}
                                        activeDot={{ r: 7, fill: '#10B981', stroke: '#fff', strokeWidth: 3, filter: 'url(#shadow-green)' }}
                                        animationDuration={1200}
                                        animationEasing="ease-in-out"
                                    />
                                    <Area
                                        type="natural"
                                        dataKey="pengeluaran"
                                        name="Pengeluaran"
                                        stroke="#F43F5E"
                                        strokeWidth={2.5}
                                        fillOpacity={1}
                                        fill="url(#gradPengeluaran)"
                                        dot={{ r: 4, fill: '#fff', stroke: '#F43F5E', strokeWidth: 2.5, filter: 'url(#shadow-red)' }}
                                        activeDot={{ r: 7, fill: '#F43F5E', stroke: '#fff', strokeWidth: 3, filter: 'url(#shadow-red)' }}
                                        animationDuration={1200}
                                        animationEasing="ease-in-out"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {hasLogistics && topAssets && (
                    <div className="lg:col-span-1 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <PackageOpen className="text-theme-600" size={20} />
                                <h2 className="text-lg font-bold text-gray-800 dark:text-white">Aset Bernilai Tinggi</h2>
                            </div>
                            <button
                                onClick={() => setShowHighValueAssets(!showHighValueAssets)}
                                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                title={showHighValueAssets ? "Sembunyikan Nilai" : "Tampilkan Nilai"}
                            >
                                {showHighValueAssets ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
                            {topAssets.length > 0 ? topAssets.map(asset => (
                                <div key={asset.id} className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-theme-50/50 hover:border-theme-100 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-white border border-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                        {asset.foto_aset ? (
                                            <img src={asset.foto_aset} alt={asset.nama_barang} className="w-full h-full object-cover" />
                                        ) : (
                                            <Box className="text-gray-400" size={18} />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">{asset.nama_barang}</h3>
                                        <p className="text-xs text-gray-500 truncate mb-1">
                                            {asset.kategori_barang}
                                            {asset.tanggal_pembelian ? ` • ${new Date(asset.tanggal_pembelian).getFullYear()}` : ''}
                                            {asset.kepemilikan ? ` • ${asset.kepemilikan}` : ''}
                                        </p>
                                        <div className="text-sm font-bold text-theme-600">
                                            {showHighValueAssets ? formatRupiah(asset.nilai_aset) : 'Rp *********'}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="flex flex-col items-center justify-center h-full text-center py-6">
                                    <Box className="text-gray-300 mb-2" size={32} />
                                    <p className="text-sm text-gray-500">Belum ada aset bernilai.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {hasPrograms && recentPrograms.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Program Terbaru</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {recentPrograms.map(program => (
                            <div key={program.id} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow group">
                                <div className="flex justify-between items-start mb-3">
                                    <span className="text-[10px] font-bold tracking-wider uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-md">
                                        {program.category}
                                    </span>
                                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                                        {program.status === 'ongoing' ? 'Berjalan' : 'Selesai'}
                                    </span>
                                </div>
                                <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 line-clamp-1 group-hover:text-theme-600 transition-colors">
                                    {program.title}
                                </h3>
                                <div className="flex flex-col gap-2 text-xs text-gray-500">
                                    <div className="flex items-center gap-1.5">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>{new Date(program.start_date).toISOString().split('T')[0]}</span>
                                    </div>
                                    {program.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin size={14} className="text-gray-400" />
                                            <span className="line-clamp-1">{program.location}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
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
                                        <p className="text-xs text-gray-500 truncate">{new Date(trx.date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })} • {trx.program?.title || 'Operasional'}</p>
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
