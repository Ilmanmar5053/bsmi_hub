<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PublicDonationController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Public/DonationForm');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'donor_name' => 'required|string|max:255',
            'donor_phone' => 'required|string|max:20',
            'address' => 'required|string',
            'province' => 'required|string|max:255',
            'city' => 'required|string|max:255',
            'district' => 'required|string|max:255',
            'village' => 'required|string|max:255',
            'type' => 'required|in:uang,barang',
            'amount' => 'nullable|required_if:type,uang|numeric|min:1000',
            'goods_description' => 'nullable|required_if:type,barang|string',
            'date' => 'required|date',
            'receipt' => 'required|image|max:5120', // Max 5MB
        ]);

        if ($request->hasFile('receipt')) {
            $path = $request->file('receipt')->store('donation-receipts', 'public');
            $validated['receipt_path'] = '/storage/' . $path;
        }

        $validated['status'] = 'pending'; // Auto set to pending for review

        Donation::create($validated);

        return back()->with('success', 'Terima kasih! Konfirmasi donasi Anda berhasil dikirim dan akan segera kami proses.');
    }
}
