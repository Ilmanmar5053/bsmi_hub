<?php

namespace App\Http\Controllers;

use App\Models\Beneficiary;
use App\Models\Donation;
use App\Models\Executive;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Models\Program;
use App\Models\Volunteer;
use App\Models\DiklatsarModule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        // ── Core stats ──────────────────────────────────────────────────────
        $totalMembers      = Member::where('status_aktif', true)->count();
        $totalExecutives   = Executive::where('status_aktif', true)->count();
        $totalVolunteers   = Volunteer::where('status', 'approved')->count();
        $totalBeneficiaries = Beneficiary::count();
        $totalPrograms     = Program::where('status', 'ongoing')->count();
        $totalDonations    = Donation::sum('amount');
        $pendingVolunteers = Volunteer::where('status', 'pending')->count();

        // ── Monthly income / expense chart (last 6 months) ──────────────────
        $chartData = $this->buildChartData();

        // ── Financial summary ────────────────────────────────────────────────
        $totalIncome  = FinancialTransaction::where('type', 'pemasukan')->sum('amount');
        $totalExpense = FinancialTransaction::where('type', 'pengeluaran')->sum('amount');
        $balance      = $totalIncome - $totalExpense;

        $recentPrograms = Program::orderBy('created_at', 'desc')
            ->take(6)
            ->get();

        $user = auth()->user();
        $isVolunteer = $user && $user->hasRole('relawan');
        $isAnggota = $user && $user->hasRole('anggota');
        $volunteerData = null;
        $diklatsarModules = null;
        $duesHistory = [];
        $distributionHistory = [];

        if ($isAnggota) {
            $member = Member::where('user_id', $user->id)->first();
            if ($member) {
                $duesHistory = \App\Models\DuesPayment::with('period')
                    ->where('member_id', $member->id)
                    ->orderBy('paid_date', 'desc')
                    ->take(5)
                    ->get();
            }
            $distributionHistory = FinancialTransaction::with('program')
                ->where('type', 'pengeluaran')
                ->orderBy('date', 'desc')
                ->take(5)
                ->get();
        }

        if ($isVolunteer) {
            $volunteerData = Volunteer::where('user_id', $user->id)->first();
            $diklatsarModules = DiklatsarModule::orderBy('stage_number')->get();
        }

        return Inertia::render('Dashboard/Index', [
            'stats' => [
                'totalMembers'       => $totalMembers,
                'totalExecutives'    => $totalExecutives,
                'totalVolunteers'    => $totalVolunteers,
                'totalBeneficiaries' => $totalBeneficiaries,
                'totalPrograms'      => $totalPrograms,
                'totalDonations'     => (float) $totalDonations,
                'pendingVolunteers'  => $pendingVolunteers,
                'totalIncome'        => (float) $totalIncome,
                'totalExpense'       => (float) $totalExpense,
                'balance'            => (float) $balance,
            ],
            'chartData'      => $chartData,
            'recentPrograms' => $recentPrograms,
            'isVolunteer'    => $isVolunteer,
            'isAnggota'      => $isAnggota,
            'volunteerData'  => $volunteerData,
            'diklatsarModules' => $diklatsarModules,
            'duesHistory'    => $duesHistory,
            'distributionHistory' => $distributionHistory,
        ]);
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private function buildChartData(): array
    {
        $data = [];
        $indonesianMonths = [
            1 => 'Jan', 2 => 'Feb', 3 => 'Mar', 4 => 'Apr',
            5 => 'Mei', 6 => 'Jun', 7 => 'Jul', 8 => 'Agu',
            9 => 'Sep', 10 => 'Okt', 11 => 'Nov', 12 => 'Des',
        ];

        $incomeRows  = FinancialTransaction::selectRaw(
                'MONTH(date) as month, YEAR(date) as year, SUM(amount) as total'
            )
            ->where('type', 'pemasukan')
            ->where('date', '>=', '2026-01-01')
            ->groupByRaw('YEAR(date), MONTH(date)')
            ->get()
            ->keyBy(fn($r) => $r->year . '-' . $r->month);

        $expenseRows = FinancialTransaction::selectRaw(
                'MONTH(date) as month, YEAR(date) as year, SUM(amount) as total'
            )
            ->where('type', 'pengeluaran')
            ->where('date', '>=', '2026-01-01')
            ->groupByRaw('YEAR(date), MONTH(date)')
            ->get()
            ->keyBy(fn($r) => $r->year . '-' . $r->month);

        $currentMonth = (int) now()->format('m');
        $year = 2026;

        for ($m = 1; $m <= $currentMonth; $m++) {
            $key = $year . '-' . $m;
            
            $data[] = [
                'month'       => $indonesianMonths[$m] . ' ' . $year,
                'pemasukan'   => (float) ($incomeRows[$key]->total ?? 0),
                'pengeluaran' => (float) ($expenseRows[$key]->total ?? 0),
            ];
        }

        return $data;
    }
}
