<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class BeneficiaryController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'category']);

        $beneficiaries = Beneficiary::query()
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('nik', 'like', "%{$search}%")
                      ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($filters['category'] ?? null, fn($q, $v) => $q->where('category', $v))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($b) => [
                'id'             => $b->id,
                'name'           => $b->name,
                'category'       => $b->category,
                'address'        => $b->address,
                'phone'          => $b->phone,
                'nik'            => $b->nik,
                'family_members' => $b->family_members,
                'description'    => $b->description,
                'total_received' => (float) $b->total_received,
                'photo_path'     => $b->photo_path ? Storage::url($b->photo_path) : null,
            ]);

        $categories = Beneficiary::distinct()->pluck('category')->filter()->values();

        return Inertia::render('Beneficiaries/Index', [
            'beneficiaries' => $beneficiaries,
            'filters'       => $filters,
            'categories'    => $categories,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category'       => 'required|string|max:100',
            'address'        => 'nullable|string|max:500',
            'phone'          => 'nullable|string|max:20',
            'nik'            => 'nullable|string|max:20|unique:beneficiaries,nik',
            'family_members' => 'nullable|integer|min:1',
            'description'    => 'nullable|string',
            'photo'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            if ($request->hasFile('photo')) {
                $validated['photo_path'] = $request->file('photo')->store('beneficiaries', 'public');
            }

            Beneficiary::create($validated);

            return redirect()->route('beneficiaries.index')
                ->with('success', 'Data penerima manfaat berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan data penerima manfaat: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Beneficiary $beneficiary): RedirectResponse
    {
        $validated = $request->validate([
            'name'           => 'required|string|max:255',
            'category'       => 'required|string|max:100',
            'address'        => 'nullable|string|max:500',
            'phone'          => 'nullable|string|max:20',
            'nik'            => 'nullable|string|max:20|unique:beneficiaries,nik,' . $beneficiary->id,
            'family_members' => 'nullable|integer|min:1',
            'description'    => 'nullable|string',
            'photo'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:2048',
        ]);

        try {
            if ($request->hasFile('photo')) {
                if ($beneficiary->photo_path) {
                    Storage::disk('public')->delete($beneficiary->photo_path);
                }
                $validated['photo_path'] = $request->file('photo')->store('beneficiaries', 'public');
            }

            $beneficiary->update($validated);

            return redirect()->route('beneficiaries.index')
                ->with('success', 'Data penerima manfaat berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui data penerima manfaat: ' . $e->getMessage());
        }
    }

    public function destroy(Beneficiary $beneficiary): RedirectResponse
    {
        try {
            $beneficiary->delete();

            return redirect()->route('beneficiaries.index')
                ->with('success', 'Data penerima manfaat berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus data penerima manfaat: ' . $e->getMessage());
        }
    }
}
