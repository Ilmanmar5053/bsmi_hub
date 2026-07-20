import React from 'react';
import { CheckCircle, XCircle, X } from 'lucide-react';
import { Link } from '@inertiajs/react';

interface FlashProps {
    success?: string;
    error?: string;
}

interface Props {
    flash: FlashProps;
    onClose?: () => void;
}

export function FlashMessage({ flash, onClose }: Props) {
    const [visible, setVisible] = React.useState(true);

    if (!visible || (!flash.success && !flash.error)) return null;

    const isSuccess = !!flash.success;
    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-4 text-sm ${
            isSuccess
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
            {isSuccess ? <CheckCircle size={16} className="flex-shrink-0" /> : <XCircle size={16} className="flex-shrink-0" />}
            <span className="flex-1">{flash.success || flash.error}</span>
            <button
                onClick={() => { setVisible(false); onClose?.(); }}
                className="flex-shrink-0 hover:opacity-70 transition-opacity"
            >
                <X size={14} />
            </button>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: React.ReactNode;
    icon: React.ReactNode;
    iconBg: string;
    subtitle?: string;
    trend?: { value: string; positive: boolean };
}

export function StatCard({ title, value, icon, iconBg, subtitle, trend }: StatCardProps) {
    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
                    {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
                    {trend && (
                        <p className={`text-xs font-medium mt-1 ${trend.positive ? 'text-green-600' : 'text-red-500'}`}>
                            {trend.positive ? '↑' : '↓'} {trend.value}
                        </p>
                    )}
                </div>
                <div className={`w-12 h-12 rounded-xl ${iconBg} flex items-center justify-center`}>
                    {icon}
                </div>
            </div>
        </div>
    );
}

interface BadgeProps {
    status: string;
    map?: Record<string, string>;
}

export function StatusBadge({ status, map }: BadgeProps) {
    const defaultMap: Record<string, string> = {
        active: 'badge-green',
        inactive: 'badge-gray',
        paid: 'badge-green',
        unpaid: 'badge-red',
        late: 'badge-yellow',
        approved: 'badge-green',
        rejected: 'badge-red',
        pending: 'badge-yellow',
        ongoing: 'badge-blue',
        planned: 'badge-yellow',
        completed: 'badge-green',
        cancelled: 'badge-gray',
        masuk: 'badge-green',
        keluar: 'badge-orange',
        pemasukan: 'badge-green',
        pengeluaran: 'badge-red',
    };

    const labelMap: Record<string, string> = {
        active: 'Aktif', inactive: 'Tidak Aktif',
        paid: 'Lunas', unpaid: 'Belum Lunas', late: 'Terlambat',
        approved: 'Disetujui', rejected: 'Ditolak', pending: 'Menunggu',
        ongoing: 'Berlangsung', planned: 'Direncanakan', completed: 'Selesai', cancelled: 'Dibatalkan',
        masuk: 'Masuk', keluar: 'Keluar',
        pemasukan: 'Pemasukan', pengeluaran: 'Pengeluaran',
    };

    const appliedMap = map ?? defaultMap;
    const cls = appliedMap[status] ?? 'badge-gray';
    const label = labelMap[status] ?? status;

    return <span className={cls}>{label}</span>;
}

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
    if (!isOpen) return null;

    const sizeClasses = {
        sm: 'max-w-sm',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div
                className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto animate-fade-in`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors">
                        <X size={18} />
                    </button>
                </div>
                <div className="p-6">{children}</div>
            </div>
        </div>
    );
}

export function formatRupiah(value: number | string): string {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
}

export function formatDate(value: string | null): string {
    if (!value) return '-';
    return new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(value));
}

interface SearchInputProps {
    value: string;
    onChange: (val: string) => void;
    placeholder?: string;
}

export function SearchInput({ value, onChange, placeholder = 'Cari...' }: SearchInputProps) {
    return (
        <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-9 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 w-full"
            />
        </div>
    );
}

interface EmptyStateProps {
    icon: React.ReactNode;
    title: string;
    description?: string;
    action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 mb-4">
                {icon}
            </div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
            {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
            {action}
        </div>
    );
}

export function Pagination({ links }: { links: any[] }) {
    if (!links || links.length <= 3) return null;

    return (
        <div className="flex flex-wrap gap-1 justify-center mt-4">
            {links.map((link, key) => (
                <Link
                    key={key}
                    href={link.url || '#'}
                    className={`px-3 py-1 text-sm border rounded-lg transition-colors ${
                        link.active
                            ? 'bg-theme-600 text-white border-theme-600'
                            : link.url 
                                ? 'bg-white text-gray-700 hover:bg-gray-50 border-gray-200' 
                                : 'bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                    dangerouslySetInnerHTML={{ __html: link.label }}
                    onClick={(e: React.MouseEvent<any>) => {
                        if (!link.url) e.preventDefault();
                    }}
                />
            ))}
        </div>
    );
}
