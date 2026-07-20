import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';

interface Props {
    logisticsItems: { id: number; name: string; unit: string; quantity: number }[];
    suggestedDocumentNumber: string;
    defaultDate: string;
}

export default function CreateDeliveryNote({ logisticsItems, suggestedDocumentNumber, defaultDate }: Props) {
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

            <div className="mb-6 flex items-center gap-4">
                <Link href="/delivery-notes" className="p-2 text-gray-500 hover:text-gray-700 bg-white rounded-lg border border-gray-200">
                    <ArrowLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Buat Surat Jalan</h1>
                    <p className="text-sm text-gray-500">Formulir pengeluaran barang & surat jalan resmi.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Informasi Surat Jalan</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">No. Surat Jalan <span className="text-red-500">*</span></label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={data.document_number}
                                onChange={e => setData('document_number', e.target.value)}
                                required 
                            />
                            {errors.document_number && <p className="text-xs text-red-500 mt-1">{errors.document_number}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Tanggal <span className="text-red-500">*</span></label>
                            <input 
                                type="date" 
                                className="form-input" 
                                value={data.date}
                                onChange={e => setData('date', e.target.value)}
                                required 
                            />
                            {errors.date && <p className="text-xs text-red-500 mt-1">{errors.date}</p>}
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Alamat Tujuan <span className="text-red-500">*</span></label>
                            <textarea 
                                className="form-input" 
                                rows={2}
                                value={data.destination}
                                onChange={e => setData('destination', e.target.value)}
                                required 
                            />
                            {errors.destination && <p className="text-xs text-red-500 mt-1">{errors.destination}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Nama Driver</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={data.driver_name}
                                onChange={e => setData('driver_name', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">No. Plat Kendaraan</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                value={data.vehicle_plate}
                                onChange={e => setData('vehicle_plate', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2 flex justify-between items-center">
                        <span>Detail Barang</span>
                        <button type="button" onClick={handleAddItem} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1">
                            <Plus size={14} /> Tambah Baris
                        </button>
                    </h2>
                    
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

                <div className="card p-6">
                    <h2 className="text-lg font-semibold mb-4 border-b pb-2">Penandatangan (Opsional)</h2>
                    <p className="text-sm text-gray-500 mb-4">Isi nama lengkap pihak-pihak yang akan menandatangani Surat Jalan ini.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Bagian Gudang</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Nama Petugas Gudang"
                                value={data.warehouse_pic}
                                onChange={e => setData('warehouse_pic', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ketua Bidang Peralatan</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Nama Ketua Bid. Peralatan"
                                value={data.equipment_pic}
                                onChange={e => setData('equipment_pic', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Ketua Pelaksana</label>
                            <input 
                                type="text" 
                                className="form-input" 
                                placeholder="Nama Ketua Pelaksana"
                                value={data.coordinator_pic}
                                onChange={e => setData('coordinator_pic', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <Link href="/delivery-notes" className="btn-secondary">Batal</Link>
                    <button type="submit" disabled={processing || data.items.length === 0} className="btn-primary flex items-center gap-2">
                        <Save size={16} /> Simpan & Buat Surat Jalan
                    </button>
                </div>
            </form>
        </AppLayout>
    );
}
