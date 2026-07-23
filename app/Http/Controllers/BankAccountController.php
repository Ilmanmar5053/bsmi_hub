<?php

namespace App\Http\Controllers;

use App\Models\BankAccount;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Storage;

class BankAccountController extends Controller
{
    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:100',
            'account_name' => 'required|string|max:100',
            'branch_name' => 'nullable|string|max:100',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            $path = $request->file('logo')->store('bank-logos', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        BankAccount::create($validated);
        return back()->with('success', 'Rekening berhasil ditambahkan.');
    }

    public function update(Request $request, BankAccount $bankAccount): RedirectResponse
    {
        $validated = $request->validate([
            'account_number' => 'required|string|max:50',
            'bank_name' => 'required|string|max:100',
            'account_name' => 'required|string|max:100',
            'branch_name' => 'nullable|string|max:100',
            'logo' => 'nullable|image|max:2048',
        ]);

        if ($request->hasFile('logo')) {
            if ($bankAccount->logo_url && str_starts_with($bankAccount->logo_url, '/storage/')) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $bankAccount->logo_url));
            }
            $path = $request->file('logo')->store('bank-logos', 'public');
            $validated['logo_url'] = '/storage/' . $path;
        }

        $bankAccount->update($validated);
        return back()->with('success', 'Rekening berhasil diperbarui.');
    }

    public function destroy(BankAccount $bankAccount): RedirectResponse
    {
        if ($bankAccount->logo_url && str_starts_with($bankAccount->logo_url, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $bankAccount->logo_url));
        }
        $bankAccount->delete();
        return back()->with('success', 'Rekening berhasil dihapus.');
    }
}
