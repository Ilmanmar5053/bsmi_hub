import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface Props {
    logisticsItems: { id: number; name: string; unit: string; quantity: number }[];
    suggestedDocumentNumber: string;
    defaultDate: string;
    personnelNames: string[];
}

export default function CreateDeliveryNote({ logisticsItems, suggestedDocumentNumber, defaultDate, personnelNames }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        document_number: suggestedDocumentNumber,
        date: defaultDate,
        destination: '',
        vehicle_plate: '',
        driver_name: '',
        warehouse_pic: '',
        equipment_pic: '',
        coordinator_pic: '',
        notes: '',
        items: [
            { logistics_item_id: '', quantity: '', notes: '' }
        ]
    });

    const handleAddItem = () => {
        setData('items', [...data.items, { logistics_item_id: '', quantity: '', notes: '' }]);
    };

    const handleRemoveItem = (index: number) => {
        const newItems = [...data.items];
        newItems.splice(index, 1);
        setData('items', newItems);
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...data.items] as any[];
        newItems[index][field] = value;
        setData('items', newItems);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/delivery-notes');
    };

    return (
        <AppLayout>
            <Head title="Buat Surat Jalan - Logistik" />

            <div className="max-w-4xl mx-auto">
                <div className="mb-6 flex items-center gap-4">
                    <Link href="/delivery-notes" className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200 shadow-sm transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Formulir Surat Jalan</h1>
                        <p className="text-sm text-gray-500">Pencatatan pengeluaran logistik & cetak dokumen.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
                        
                        {/* Header Document Style */}
                        <div className="bg-gray-50 dark:bg-gray-900/50 p-6 border-b border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 uppercase tracking-wider">Surat Jalan</h2>
                                    <p className="text-sm text-gray-500">Organisasi Bulan Sabit Merah Indonesia</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-medium text-gray-500 mb-1">Nomor Dokumen</div>
                                    <input 
                                        type="text" 
                                        className="form-input text-right font-mono bg-white dark:bg-gray-800 w-64" 
                                        value={data.document_number}
                                        onChange={e => setData('document_number', e.target.value)}
                                        required 
                                    />
                                    {errors.document_number && <p className="text-xs text-red-500 mt-1">{errors.document_number}</p>}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Section 1: Info Pengiriman */}
                            <div>
                                <h3 className="text-sm font-bold text-theme-600 uppercase tracking-wider mb-4 border-b pb-2">Informasi Pengiriman</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Tanggal Pengeluaran <span className="text-red-500">*</span></label>
                                        <input 
                                            type="date" 
                                            className="form-input" 
                                            value={data.date}
                                            onChange={e => setData('date', e.target.value)}
                                            required 
                                        />
                                        {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                                    </div>
                                    <div className="row-span-2">
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Alamat Tujuan / Lokasi <span className="text-red-500">*</span></label>
                                        <textarea 
                                            className="form-input h-full min-h-[110px]" 
                                            value={data.destination}
                                            onChange={e => setData('destination', e.target.value)}
                                            placeholder="Nama instansi, posko bencana, alamat lengkap..."
                                            required 
                                        />
                                        {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Armada / Driver</label>
                                        <div className="flex gap-3">
                                            <input 
                                                type="text" 
                                                className="form-input flex-1" 
                                                placeholder="Nama Driver"
                                                value={data.driver_name}
                                                onChange={e => setData('driver_name', e.target.value)}
                                            />
                                            <input 
                                                type="text" 
                                                className="form-input w-32" 
                                                placeholder="Plat No"
                                                value={data.vehicle_plate}
                                                onChange={e => setData('vehicle_plate', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Items */}
                            <div>
                                <div className="flex justify-between items-end mb-4 border-b pb-2">
                                    <h3 className="text-sm font-bold text-theme-600 uppercase tracking-wider">Rincian Barang</h3>
                                    <button type="button" onClick={handleAddItem} className="text-theme-600 hover:text-theme-700 text-sm font-medium flex items-center gap-1 transition-colors">
                                        <Plus size={14} /> Tambah Baris
                                    </button>
                                </div>
                                
                                {errors.items && <p className="text-sm text-red-500 mb-4">{errors.items}</p>}
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="border-b">
                                    <th className="pb-2 font-medium w-12">No</th>
                                    <th className="pb-2 font-medium">Nama Barang <span className="text-red-500">*</span></th>
                                    <th className="pb-2 font-medium w-32">Qty Keluar <span className="text-red-500">*</span></th>
                                    <th className="pb-2 font-medium w-24">Satuan</th>
                                    <th className="pb-2 font-medium w-1/4">Keterangan</th>
                                    <th className="pb-2 font-medium w-12 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {data.items.map((item, index) => {
                                    const selectedItem = logisticsItems.find(li => li.id.toString() === item.logistics_item_id);
                                    return (
                                        <tr key={index}>
                                            <td className="py-3">{index + 1}</td>
                                            <td className="py-3 pr-2">
                                                <select 
                                                    className="form-input"
                                                    value={item.logistics_item_id}
                                                    onChange={e => handleItemChange(index, 'logistics_item_id', e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Pilih Barang --</option>
                                                    {logisticsItems.map(li => (
                                                        <option key={li.id} value={li.id}>
                                                            {li.name} (Stok: {li.quantity} {li.unit})
                                                        </option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="py-3 pr-2">
                                                <input 
                                                    type="number" 
                                                    min="1"
                                                    max={selectedItem?.quantity || ""}
                                                    className="form-input"
                                                    value={item.quantity}
                                                    onChange={e => handleItemChange(index, 'quantity', e.target.value)}
                                                    required
                                                />
                                            </td>
                                            <td className="py-3 pr-2 text-gray-500">
                                                {selectedItem ? selectedItem.unit : '-'}
                                            </td>
                                            <td className="py-3 pr-2">
                                                <input 
                                                    type="text" 
                                                    className="form-input"
                                                    value={item.notes}
                                                    placeholder="Kondisi, dll."
                                                    onChange={e => handleItemChange(index, 'notes', e.target.value)}
                                                />
                                            </td>
                                            <td className="py-3 text-center">
                                                {data.items.length > 1 && (
                                                    <button type="button" onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700 p-1">
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>

                            {/* Section 3: Signatures */}
                            <div>
                                <h3 className="text-sm font-bold text-theme-600 uppercase tracking-wider mb-4 border-b pb-2">Penandatangan Dokumen</h3>
                                <p className="text-xs text-gray-500 mb-4">Pilih nama dari daftar pengurus/anggota atau ketik manual jika tidak ada.</p>
                                
                                <datalist id="personnel-list">
                                    {personnelNames?.map((name, i) => (
                                        <option key={i} value={name} />
                                    ))}
                                </datalist>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Bagian Gudang</label>
                                        <div className="h-16 border-b border-dashed border-gray-300 dark:border-gray-600 mb-3 mx-4"></div>
                                        <input 
                                            type="text" 
                                            list="personnel-list"
                                            className="form-input text-center font-medium bg-transparent border-none shadow-none focus:ring-0 px-0" 
                                            placeholder="Ketik nama..."
                                            value={data.warehouse_pic}
                                            onChange={e => setData('warehouse_pic', e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Ketua Bid. Peralatan</label>
                                        <div className="h-16 border-b border-dashed border-gray-300 dark:border-gray-600 mb-3 mx-4"></div>
                                        <input 
                                            type="text" 
                                            list="personnel-list"
                                            className="form-input text-center font-medium bg-transparent border-none shadow-none focus:ring-0 px-0" 
                                            placeholder="Ketik nama..."
                                            value={data.equipment_pic}
                                            onChange={e => setData('equipment_pic', e.target.value)}
                                        />
                                    </div>
                                    <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                                        <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-300">Ketua Pelaksana</label>
                                        <div className="h-16 border-b border-dashed border-gray-300 dark:border-gray-600 mb-3 mx-4"></div>
                                        <input 
                                            type="text" 
                                            list="personnel-list"
                                            className="form-input text-center font-medium bg-transparent border-none shadow-none focus:ring-0 px-0" 
                                            placeholder="Ketik nama..."
                                            value={data.coordinator_pic}
                                            onChange={e => setData('coordinator_pic', e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 sticky bottom-4">
                        <Link href="/delivery-notes" className="btn-secondary shadow-sm bg-white">Batal</Link>
                        <button type="submit" disabled={processing || data.items.length === 0} className="btn-primary flex items-center gap-2 shadow-lg">
                            <Save size={16} /> Simpan & Buat Surat Jalan
                        </button>
                    </div>
                </form>
            </div>

        </AppLayout>
    );
}
