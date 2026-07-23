<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Activitylog\Models\Activity;

class ActivityLogController extends Controller
{
    public function index(Request $request): Response
    {
        $filters = $request->only(['search', 'event', 'date_start', 'date_end', 'per_page']);
        $perPage = $filters['per_page'] ?? '25';

        $query = Activity::with('causer')
            ->orderBy('created_at', 'desc');

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('log_name', 'like', "%{$search}%")
                  ->orWhereHas('causer', function ($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%")
                         ->orWhere('email', 'like', "%{$search}%");
                  });
            });
        }

        if (!empty($filters['event'])) {
            $query->where('event', $filters['event']);
        }

        if (!empty($filters['date_start'])) {
            $startDate = \Carbon\Carbon::parse($filters['date_start'], 'Asia/Jakarta')->startOfDay()->timezone(config('app.timezone'));
            $query->where('created_at', '>=', $startDate);
        }

        if (!empty($filters['date_end'])) {
            $endDate = \Carbon\Carbon::parse($filters['date_end'], 'Asia/Jakarta')->endOfDay()->timezone(config('app.timezone'));
            $query->where('created_at', '<=', $endDate);
        }

        if ($perPage === 'all') {
            $logs = new \Illuminate\Pagination\LengthAwarePaginator(
                $query->get(), $query->count(), $query->count() ?: 1, 1,
                ['path' => request()->url(), 'query' => request()->query()]
            );
        } else {
            $logs = $query->paginate((int) $perPage)->withQueryString();
        }

        return Inertia::render('ActivityLog/Index', [
            'logs' => $logs,
            'filters' => $filters,
        ]);
    }
}
