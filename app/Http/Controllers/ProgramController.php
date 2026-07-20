<?php

namespace App\Http\Controllers;

use App\Models\Program;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ProgramController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'status', 'category']);

        $programs = Program::with('creator')
            ->when($filters['search'] ?? null, fn($q, $v) =>
                $q->where('title', 'like', "%{$v}%")
                  ->orWhere('location', 'like', "%{$v}%")
            )
            ->when($filters['status'] ?? null, fn($q, $v) => $q->where('status', $v))
            ->when($filters['category'] ?? null, fn($q, $v) => $q->where('category', $v))
            ->orderByDesc('start_date')
            ->paginate(15)
            ->withQueryString()
            ->through(fn($p) => [
                'id'                   => $p->id,
                'title'                => $p->title,
                'description'          => $p->description,
                'category'             => $p->category,
                'status'               => $p->status,
                'start_date'           => $p->start_date?->toDateString(),
                'end_date'             => $p->end_date?->toDateString(),
                'budget'               => (float) $p->budget,
                'spent'                => (float) $p->spent,
                'location'             => $p->location,
                'target_beneficiaries' => $p->target_beneficiaries,
                'progress_percentage'  => $p->progress_percentage,
                'creator_name'         => $p->creator?->name,
                'notes'                => $p->notes,
            ]);

        return Inertia::render('Programs/Index', [
            'programs' => $programs,
            'filters'  => $filters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title'                => 'required|string|max:255',
            'description'          => 'nullable|string',
            'category'             => 'required|string|max:100',
            'status'               => 'required|in:planned,ongoing,completed,cancelled',
            'start_date'           => 'nullable|date',
            'end_date'             => 'nullable|date|after_or_equal:start_date',
            'budget'               => 'nullable|numeric|min:0',
            'location'             => 'nullable|string|max:255',
            'target_beneficiaries' => 'nullable|integer|min:0',
            'notes'                => 'nullable|string',
        ]);

        try {
            $validated['created_by'] = auth()->id();
            Program::create($validated);

            return redirect()->route('programs.index')
                ->with('success', 'Program berhasil disimpan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menyimpan program: ' . $e->getMessage());
        }
    }

    public function update(Request $request, Program $program): RedirectResponse
    {
        $validated = $request->validate([
            'title'                => 'required|string|max:255',
            'description'          => 'nullable|string',
            'category'             => 'required|string|max:100',
            'status'               => 'required|in:planned,ongoing,completed,cancelled',
            'start_date'           => 'nullable|date',
            'end_date'             => 'nullable|date|after_or_equal:start_date',
            'budget'               => 'nullable|numeric|min:0',
            'spent'                => 'nullable|numeric|min:0',
            'location'             => 'nullable|string|max:255',
            'target_beneficiaries' => 'nullable|integer|min:0',
            'notes'                => 'nullable|string',
        ]);

        try {
            $program->update($validated);

            return redirect()->route('programs.index')
                ->with('success', 'Program berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui program: ' . $e->getMessage());
        }
    }

    public function destroy(Program $program): RedirectResponse
    {
        try {
            $program->delete();

            return redirect()->route('programs.index')
                ->with('success', 'Program berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus program: ' . $e->getMessage());
        }
    }
}
