<?php

namespace App\Http\Controllers;

use App\Models\Donation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Inertia\Response;

class DonationController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'type', 'sort_by', 'sort_direction', 'per_page']);
        
        $sortBy = $filters['sort_by'] ?? 'created_at';
        $sortDirection = $filters['sort_direction'] ?? 'desc';
        $perPage = $filters['per_page'] ?? 25;
        if ($perPage === 'all') {
            $perPage = Donation::count();
        } else {
            $perPage = (int) $perPage;
        }

        $donations = Donation::with(['beneficiary', 'program'])
            ->when($filters['search'] ?? null, function ($query, $search) {
                $query->where('donor_name', 'like', "%{$search}%")
                      ->orWhere('donor_phone', 'like', "%{$search}%");
            })
            ->when($filters['status'] ?? null, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($filters['type'] ?? null, function ($query, $type) {
                $query->where('type', $type);
            })
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage === 0 ? 25 : $perPage)
            ->withQueryString();

        return Inertia::render('Donations/Index', [
            'donations' => $donations,
            'filters' => $filters,
        ]);
    }

    public function update(Request $request, Donation $donation)
    {
        $validated = $request->validate([
            'status' => 'required|in:pending,received,distributed',
            'notes' => 'nullable|string',
        ]);

        $donation->update($validated);
        return back()->with('success', 'Status donasi berhasil diperbarui.');
    }

    public function destroy(Donation $donation)
    {
        if ($donation->receipt_path && str_starts_with($donation->receipt_path, '/storage/')) {
            Storage::disk('public')->delete(str_replace('/storage/', '', $donation->receipt_path));
        }
        $donation->delete();
        return back()->with('success', 'Data donasi berhasil dihapus.');
    }
}
