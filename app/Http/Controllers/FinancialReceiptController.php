<?php

namespace App\Http\Controllers;

use App\Models\FinancialReceipt;
use App\Models\Member;
use App\Models\Executive;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;

class FinancialReceiptController extends Controller
{
    public function index()
    {
        $receipts = FinancialReceipt::with('creator')->orderBy('id', 'desc')->paginate(10);
        
        $members = Member::select('id', 'nama_lengkap as name')->get();
        $executives = Executive::select('id', 'nama_lengkap as name')->get();
        
        $pics = $members->concat($executives)->unique('name')->values();

        return Inertia::render('Finance/Receipts', [
            'receipts' => $receipts,
            'pics' => $pics,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'date' => 'required|date',
            'pic_name' => 'required|string',
            'description' => 'required|string',
            'amount' => 'required|numeric|min:0',
            'signature_data' => 'required|string', // Base64 data URL
        ]);

        // Generate ID Transaksi auto (e.g. TRK-202607-001)
        $yearMonth = date('Ym', strtotime($validated['date']));
        $lastReceipt = FinancialReceipt::where('receipt_number', 'like', "TRK-{$yearMonth}-%")->orderBy('id', 'desc')->first();
        if ($lastReceipt) {
            $lastNumber = intval(substr($lastReceipt->receipt_number, -3));
            $newNumber = str_pad($lastNumber + 1, 3, '0', STR_PAD_LEFT);
        } else {
            $newNumber = '001';
        }
        $receiptNumber = "TRK-{$yearMonth}-{$newNumber}";

        // Save signature image
        $signaturePath = null;
        if (!empty($validated['signature_data'])) {
            $image_parts = explode(";base64,", $validated['signature_data']);
            if (count($image_parts) == 2) {
                $image_base64 = base64_decode($image_parts[1]);
                $filename = 'signatures/' . uniqid() . '.png';
                Storage::disk('public')->put($filename, $image_base64);
                $signaturePath = $filename;
            }
        }

        FinancialReceipt::create([
            'receipt_number' => $receiptNumber,
            'date' => $validated['date'],
            'pic_name' => $validated['pic_name'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'signature_path' => $signaturePath,
            'created_by' => auth()->id(),
        ]);

        return redirect()->back()->with('success', 'Kwitansi digital berhasil dibuat.');
    }

    public function print(FinancialReceipt $financialReceipt)
    {
        $pdf = Pdf::loadView('pdf.receipt', [
            'receipt' => $financialReceipt,
            'organization' => \App\Models\OrganizationProfile::first()
        ]);
        
        // Ukuran custom 20cm x 10cm dalam point (1 inch = 2.54 cm = 72 pt)
        // Lebar: (20 / 2.54) * 72 = 566.93
        // Tinggi: (10 / 2.54) * 72 = 283.46
        $pdf->setPaper(array(0, 0, 566.93, 283.46));
        
        return $pdf->stream('Kwitansi_' . $financialReceipt->receipt_number . '.pdf');
    }
}
