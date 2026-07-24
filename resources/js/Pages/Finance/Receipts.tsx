import React, { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Modal, Pagination, formatRupiah, formatDate } from '@/Components/Shared';
import { Plus, Printer, FileText, Eraser, Eye } from 'lucide-react';
import SignatureCanvas from 'react-signature-canvas';

interface Receipt {
    id: number;
    receipt_number: string;
    date: string;
    pic_name: string;
    description: string;
    amount: string;
    signature_path: string;
    creator: { name: string };
    created_at: string;
}

interface Props {
    receipts: {
        data: Receipt[];
        links: any[];
    };
    pics: { id: number; name: string }[];
}

export default function Receipts({ receipts, pics }: Props) {
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [previewReceipt, setPreviewReceipt] = useState<Receipt | null>(null);
    const sigCanvas = useRef<SignatureCanvas>(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        date: new Date().toISOString().split('T')[0],
        pic_name: '',
        description: '',
        amount: '',
        signature_data: '',
    });

    const openCreateModal = () => {
        reset();
        clearErrors();
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
        setIsCreateModalOpen(true);
    };

    const clearSignature = () => {
        if (sigCanvas.current) {
            sigCanvas.current.clear();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (sigCanvas.current && !sigCanvas.current.isEmpty()) {
            setData('signature_data', sigCanvas.current.toDataURL('image/png'));
        } else {
            setData('signature_data', ''); // Server will complain if empty but required
        }
        
        // Wait for state to update
        setTimeout(() => {
            post('/financial-receipts', {
                onSuccess: () => setIsCreateModalOpen(false),
            });
        }, 100);
    };

    return (
        <AppLayout>
            <Head title="Kwitansi Digital" />

            <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Transaksi Keuangan</h1>
                    <p className="text-sm text-gray-500">Pembuatan kwitansi digital untuk pengeluaran kas.</p>
                </div>
                <button onClick={openCreateModal} className="btn-primary">
                    <Plus size={18} /> Buat Kwitansi
                </button>
            </div>

            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                            <tr>
                                <th className="px-6 py-4">ID Transaksi</th>
                                <th className="px-6 py-4">Tanggal</th>
                                <th className="px-6 py-4">Penerima (PIC)</th>
                                <th className="px-6 py-4">Nominal</th>
                                <th className="px-6 py-4">Keterangan</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {receipts.data.length > 0 ? receipts.data.map(receipt => (
                                <tr key={receipt.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                                        {receipt.receipt_number}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {formatDate(receipt.date)}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {receipt.pic_name}
                                    </td>
                                    <td className="px-6 py-4 font-bold text-red-600">
                                        {formatRupiah(Number(receipt.amount))}
                                    </td>
                                    <td className="px-6 py-4 text-gray-700 dark:text-gray-300">
                                        {receipt.description}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button type="button" onClick={() => setPreviewReceipt(receipt)} className="btn-secondary px-3 py-1.5 text-xs inline-flex items-center gap-1.5">
                                            <Eye size={14} /> Preview
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText size={48} className="text-gray-300 dark:text-gray-600 mb-4" />
                                            <p className="text-lg font-medium text-gray-900 dark:text-gray-100">Belum ada kwitansi</p>
                                            <p className="text-sm mt-1">Buat kwitansi digital baru untuk mencatat pengeluaran.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {receipts.links && receipts.links.length > 3 && (
                    <div className="border-t border-gray-100 dark:border-gray-800">
                        <Pagination links={receipts.links} />
                    </div>
                )}
            </div>

            <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Buat Kwitansi Digital" size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="form-label">Tanggal Transaksi</label>
                            <input 
                                type="date" 
                                className="form-input" 
                                value={data.date} 
                                onChange={e => setData('date', e.target.value)} 
                                required 
                            />
                            {errors.date && <p className="text-red-500 text-xs mt-1">{errors.date}</p>}
                        </div>
                        <div>
                            <label className="form-label">Nominal (Rp)</label>
                            <input 
                                type="number" 
                                min="0" 
                                className="form-input" 
                                placeholder="Contoh: 1500000"
                                value={data.amount} 
                                onChange={e => setData('amount', e.target.value)} 
                                required 
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                        </div>
                    </div>
                    
                    <div>
                        <label className="form-label">Telah Diterima Dari (PIC)</label>
                        <input 
                            type="text" 
                            className="form-input" 
                            placeholder="Ketik nama atau pilih dari daftar"
                            list="pic-list"
                            value={data.pic_name} 
                            onChange={e => setData('pic_name', e.target.value)} 
                            required 
                        />
                        <datalist id="pic-list">
                            {pics.map(pic => (
                                <option key={pic.id} value={pic.name} />
                            ))}
                        </datalist>
                        <p className="text-xs text-gray-500 mt-1">Anda bisa mengetik nama bebas atau memilih dari daftar pengurus/anggota.</p>
                        {errors.pic_name && <p className="text-red-500 text-xs mt-1">{errors.pic_name}</p>}
                    </div>
                    
                    <div>
                        <label className="form-label">Untuk Pembayaran</label>
                        <textarea 
                            className="form-input min-h-[80px]" 
                            placeholder="Contoh: Pembelian alat tulis kantor untuk kegiatan Baksos bulan Juli"
                            value={data.description} 
                            onChange={e => setData('description', e.target.value)} 
                            required 
                        ></textarea>
                        {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="form-label mb-0">Tanda Tangan Penerima</label>
                            <button type="button" onClick={clearSignature} className="text-xs text-gray-500 hover:text-red-600 flex items-center gap-1">
                                <Eraser size={14} /> Hapus / Ulangi
                            </button>
                        </div>
                        <div className="border border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden bg-white touch-none">
                            <SignatureCanvas 
                                ref={sigCanvas} 
                                penColor="blue"
                                canvasProps={{ width: 500, height: 200, className: 'sigCanvas w-full h-[200px]' }} 
                            />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Gunakan kursor (mouse) atau sentuhan jari (di HP/Tablet) untuk tanda tangan.</p>
                        {errors.signature_data && <p className="text-red-500 text-xs mt-1">{errors.signature_data}</p>}
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">
                            Batal
                        </button>
                        <button type="button" onClick={handleSubmit} className="btn-primary" disabled={processing}>
                            {processing ? 'Menyimpan...' : 'Simpan & Buat Kwitansi'}
                        </button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={!!previewReceipt} onClose={() => setPreviewReceipt(null)} title="Preview Kwitansi Digital">
                {previewReceipt && (
                    <div className="space-y-4">
                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                            <div className="grid grid-cols-2 gap-y-4">
                                <div>
                                    <p className="text-xs text-gray-500">ID Transaksi</p>
                                    <p className="font-semibold">{previewReceipt.receipt_number}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Tanggal</p>
                                    <p className="font-semibold">{formatDate(previewReceipt.date)}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Penerima (PIC)</p>
                                    <p className="font-semibold">{previewReceipt.pic_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Nominal</p>
                                    <p className="font-bold text-red-600">{formatRupiah(Number(previewReceipt.amount))}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Untuk Pembayaran</p>
                                    <p className="font-semibold">{previewReceipt.description}</p>
                                </div>
                                <div className="col-span-2 mt-2">
                                    <p className="text-xs text-gray-500 mb-2">Tanda Tangan Penerima</p>
                                    {previewReceipt.signature_path ? (
                                        <img 
                                            src={`/storage/${previewReceipt.signature_path}`} 
                                            alt="Tanda Tangan" 
                                            className="h-24 bg-white border border-gray-200 rounded p-2"
                                        />
                                    ) : (
                                        <p className="text-sm italic text-gray-400">Tidak ada tanda tangan</p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setPreviewReceipt(null)} className="btn-secondary">
                                Tutup
                            </button>
                            <a href={`/financial-receipts/${previewReceipt.id}/print`} target="_blank" rel="noreferrer" className="btn-primary flex items-center gap-2">
                                <Printer size={16} /> Cetak ke PDF
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </AppLayout>
    );
}
