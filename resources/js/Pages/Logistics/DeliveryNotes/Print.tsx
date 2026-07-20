import React, { useEffect } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { formatDate } from '@/Components/Shared';

interface Props {
    deliveryNote: any;
}

export default function PrintDeliveryNote({ deliveryNote }: Props) {
    const { props } = usePage<any>();
    const organization = props.organization; // We use organization settings if available

    useEffect(() => {
        // Auto print after images/styles are loaded
        const timer = setTimeout(() => {
            window.print();
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-gray-100 print:bg-white p-8">
            <Head title={`Cetak Surat Jalan - ${deliveryNote.document_number}`} />

            <div className="max-w-4xl mx-auto bg-white print:p-0 p-8 shadow-lg print:shadow-none min-h-[148mm] relative text-gray-900">
                {/* Header */}
                <div className="flex items-center justify-center border-b-4 border-black pb-4 mb-4">
                    <img src={organization?.logo_url || '/images/bsmi-logo.png'} alt="Logo BSMI" className="h-20 w-auto mr-6 object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                    <div className="flex-1 text-center pr-10">
                        <h1 className="text-2xl font-bold uppercase tracking-wide">{organization?.name || 'Bulan Sabit Merah Indonesia'}</h1>
                        <h2 className="text-lg font-semibold tracking-wide">Cabang {organization?.branch || 'Provinsi Banten'}</h2>
                        <p className="text-sm mt-1">{organization?.address || 'Alamat Sekretariat BSMI'}</p>
                        <p className="text-sm">Telp: {organization?.phone || '-'} | Email: {organization?.email || '-'}</p>
                    </div>
                </div>

                {/* Title */}
                <div className="text-center mb-6">
                    <h3 className="text-xl font-bold uppercase underline">Surat Jalan</h3>
                    <p className="font-medium mt-1">No: {deliveryNote.document_number}</p>
                </div>

                {/* Info Box */}
                <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-1 align-top">Tanggal</td>
                                    <td className="w-4 py-1 align-top">:</td>
                                    <td className="py-1 font-medium">{formatDate(deliveryNote.date)}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 align-top">Alamat Tujuan</td>
                                    <td className="py-1 align-top">:</td>
                                    <td className="py-1 font-medium">{deliveryNote.destination}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div>
                        <table className="w-full">
                            <tbody>
                                <tr>
                                    <td className="w-32 py-1 align-top">Nama Driver</td>
                                    <td className="w-4 py-1 align-top">:</td>
                                    <td className="py-1 font-medium">{deliveryNote.driver_name || '-'}</td>
                                </tr>
                                <tr>
                                    <td className="py-1 align-top">No. Plat Kendaraan</td>
                                    <td className="py-1 align-top">:</td>
                                    <td className="py-1 font-medium">{deliveryNote.vehicle_plate || '-'}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <p className="text-sm mb-2">Bersama ini kami kirimkan barang-barang sebagai berikut:</p>

                {/* Table */}
                <table className="w-full text-sm border-collapse border border-black mb-6">
                    <thead>
                        <tr>
                            <th className="border border-black px-3 py-2 text-center w-12">No</th>
                            <th className="border border-black px-3 py-2 text-left">Nama Barang</th>
                            <th className="border border-black px-3 py-2 text-center w-24">Banyaknya</th>
                            <th className="border border-black px-3 py-2 text-center w-24">Satuan</th>
                            <th className="border border-black px-3 py-2 text-left w-64">Keterangan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveryNote.items.map((item: any, index: number) => (
                            <tr key={item.id}>
                                <td className="border border-black px-3 py-2 text-center">{index + 1}</td>
                                <td className="border border-black px-3 py-2">{item.logistics_item?.name}</td>
                                <td className="border border-black px-3 py-2 text-center font-medium">{item.quantity}</td>
                                <td className="border border-black px-3 py-2 text-center">{item.logistics_item?.unit}</td>
                                <td className="border border-black px-3 py-2">{item.notes || '-'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {deliveryNote.notes && (
                    <div className="text-sm mb-12">
                        <strong>Catatan:</strong> <br />
                        <p className="mt-1 whitespace-pre-wrap">{deliveryNote.notes}</p>
                    </div>
                )}

                {/* Signatures */}
                <div className="grid grid-cols-4 gap-4 mt-12 text-center text-sm">
                    <div>
                        <p className="mb-16">Penerima,</p>
                        <p className="font-bold underline">(..............)</p>
                    </div>
                    <div>
                        <p className="mb-16">Driver,</p>
                        <p className="font-bold underline">{deliveryNote.driver_name ? `(${deliveryNote.driver_name})` : '(.............................)'}</p>
                    </div>
                    <div>
                        <p className="mb-16">Bagian Gudang,</p>
                        <p className="font-bold underline">{deliveryNote.warehouse_pic ? `(${deliveryNote.warehouse_pic})` : '(.............................)'}</p>
                    </div>
                    <div>
                        <p className="mb-16">Mengetahui,</p>
                        <p className="font-bold underline">{deliveryNote.coordinator_pic ? `(${deliveryNote.coordinator_pic})` : '(.............................)'}</p>
                        <p className="mt-1 text-xs">{deliveryNote.equipment_pic ? `Bid. Peralatan: ${deliveryNote.equipment_pic}` : ''}</p>
                    </div>
                </div>

                <div className="mt-12 text-xs text-gray-500 italic text-center print:block hidden">
                    Dicetak dari Sistem BSMI HUB pada {new Date().toLocaleString('id-ID')}
                </div>
            </div>

            {/* Non-print controls */}
            <div className="max-w-4xl mx-auto mt-6 flex justify-end gap-4 print:hidden">
                <button onClick={() => window.close()} className="px-4 py-2 border border-gray-300 rounded-lg bg-white hover:bg-gray-50 font-medium text-sm">
                    Tutup
                </button>
                <button onClick={() => window.print()} className="px-4 py-2 bg-theme-600 text-white rounded-lg hover:bg-theme-700 font-medium text-sm">
                    Cetak Dokumen
                </button>
            </div>

            {/* Custom Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { size: A5 landscape; margin: 10mm; }
                    body { background: white; -webkit-print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
}
