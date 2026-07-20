<?php

use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DuesController;
use App\Http\Controllers\ExecutiveController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\LogisticsController;
use App\Http\Controllers\DeliveryNoteController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\OrganizationProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VolunteerController;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "web" middleware group.
|
*/

// Root redirect
Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return redirect()->route('login');
});

// ─── Public Routes (no auth required) ────────────────────────────────────────

Route::get('/daftar-relawan', [VolunteerController::class, 'register'])
    ->name('volunteers.register');

Route::post('/daftar-relawan', [VolunteerController::class, 'submitRegistration'])
    ->name('volunteers.register.submit');

// ─── Profile Routes (Breeze – auth required) ──────────────────────────────────

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// ─── Authenticated Routes ──────────────────────────────────────────────────────

Route::middleware(['auth', 'verified'])->group(function () {

    // ─── Shared Routes (Requires Authentication) ───────────────────────────────
    // These routes rely on UI-level hiding or individual permission checks inside controllers
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::resource('programs', ProgramController::class)->only(['index', 'show']);
    Route::resource('news', NewsController::class)->only(['index', 'show']);

    // ─── Permission Protected Routes ───────────────────────────────────────────
    
    // Members
    Route::middleware(['permission:manage-members'])->group(function () {
        Route::post('/members/{member}/create-account', [MemberController::class, 'createAccount'])->name('members.create-account');
        Route::post('/members/{member}/reset-password', [MemberController::class, 'resetPassword'])->name('members.reset-password');
        Route::patch('/members/{member}/toggle-status', [MemberController::class, 'toggleStatus'])->name('members.toggle-status');
        Route::resource('members', MemberController::class)->except(['index', 'show']);
    });
    Route::middleware(['permission:manage-members|view-members'])->group(function () {
        Route::get('/members/export', [MemberController::class, 'exportExcel'])->name('members.export');
        Route::resource('members', MemberController::class)->only(['index', 'show']);
    });

    // Executives
    Route::middleware(['permission:manage-executives'])->group(function () {
        Route::resource('executives', ExecutiveController::class);
    });

    // Beneficiaries
    Route::middleware(['permission:manage-beneficiaries'])->group(function () {
        Route::resource('beneficiaries', BeneficiaryController::class);
    });

    // Programs (Full access for managing)
    Route::middleware(['permission:manage-programs'])->group(function () {
        Route::resource('programs', ProgramController::class)->except(['index', 'show']);
    });

    // News (Full access for managing)
    Route::middleware(['permission:manage-news'])->group(function () {
        Route::resource('news', NewsController::class)->except(['index', 'show']);
    });

    // Logistics & Delivery Notes
    Route::middleware(['permission:manage-logistics'])->group(function () {
        Route::post('/logistics/transaction', [LogisticsController::class, 'storeTransaction'])->name('logistics.transaction.store');
        Route::resource('logistics', LogisticsController::class)->except(['index', 'show']);
        Route::resource('delivery-notes', DeliveryNoteController::class)->except(['index', 'show']);
    });
    Route::middleware(['permission:manage-logistics|view-logistics'])->group(function () {
        Route::resource('logistics', LogisticsController::class)->only(['index', 'show']);
        Route::resource('delivery-notes', DeliveryNoteController::class)->only(['index', 'show']);
    });

    // Dues
    Route::middleware(['permission:manage-dues'])->group(function () {
        Route::post('/dues/{payment}/pay', [DuesController::class, 'markPaid'])->name('dues.pay');
        Route::post('/dues/{payment}/unpay', [DuesController::class, 'markUnpaid'])->name('dues.unpay');
        Route::resource('dues', DuesController::class)->except(['index', 'show']);
    });
    Route::middleware(['permission:manage-dues|view-dues'])->group(function () {
        Route::resource('dues', DuesController::class)->only(['index', 'show']);
    });

    // Finance
    Route::middleware(['permission:manage-finance'])->group(function () {
        Route::resource('finance', FinanceController::class)->except(['index', 'show']);
    });
    Route::middleware(['permission:manage-finance|view-finance'])->group(function () {
        Route::get('/finance/export', [FinanceController::class, 'exportExcel'])->name('finance.export');
        Route::resource('finance', FinanceController::class)->only(['index', 'show']);
    });

    // Volunteers
    Route::middleware(['permission:manage-volunteers'])->group(function () {
        Route::patch('/volunteers/{volunteer}/approve', [VolunteerController::class, 'approve'])->name('volunteers.approve');
        Route::patch('/volunteers/{volunteer}/reject', [VolunteerController::class, 'reject'])->name('volunteers.reject');
        Route::post('/volunteers/{volunteer}/create-account', [VolunteerController::class, 'createAccount'])->name('volunteers.create-account');
        Route::post('/volunteers/{volunteer}/reset-password', [VolunteerController::class, 'resetPassword'])->name('volunteers.reset-password');
        Route::resource('volunteers', VolunteerController::class)->except(['index', 'show']);

        // Diklatsar Management
        Route::patch('/diklatsar/{volunteer}/advance', [\App\Http\Controllers\DiklatsarController::class, 'advance'])->name('diklatsar.advance');
        Route::patch('/diklatsar/modules/{module}', [\App\Http\Controllers\DiklatsarController::class, 'updateModule'])->name('diklatsar.update-module');
        Route::put('/diklatsar/certificate-setting', [\App\Http\Controllers\DiklatsarController::class, 'updateCertificateSetting'])->name('diklatsar.update-certificate-setting');
    });
    
    Route::middleware(['permission:manage-volunteers|view-volunteers'])->group(function () {
        Route::get('/volunteers/export', [VolunteerController::class, 'export'])->name('volunteers.export');
        Route::resource('volunteers', VolunteerController::class)->only(['index', 'show']);
        
        // Diklatsar Routes
        Route::get('/diklatsar', [\App\Http\Controllers\DiklatsarController::class, 'index'])->name('diklatsar.index');
    });

    Route::get('/diklatsar/{volunteer}/certificate', [\App\Http\Controllers\DiklatsarController::class, 'certificate'])
        ->name('diklatsar.certificate');
    Route::get('/diklatsar/{volunteer}/certificate/preview', [\App\Http\Controllers\DiklatsarController::class, 'previewCertificate'])
        ->name('diklatsar.certificate.preview');

    // Organization Profile
    Route::middleware(['permission:view-organization'])->group(function () {
        Route::get('/profil-organisasi', [OrganizationProfileController::class, 'show'])->name('profile.show');
        Route::put('/profil-organisasi', [OrganizationProfileController::class, 'update'])->name('profile.update');
    });

    // User Management
    Route::middleware(['permission:manage-users'])->group(function () {
        Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);
    });

    // Reports (Pelaporan)
    Route::middleware(['permission:view-reports|export-reports'])->group(function () {
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export/{type}', [\App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');
    });
});

require __DIR__.'/auth.php';
