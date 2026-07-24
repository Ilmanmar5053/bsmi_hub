<?php

use App\Http\Controllers\BeneficiaryController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DuesController;
use App\Http\Controllers\ExecutiveController;
use App\Http\Controllers\FinanceController;
use App\Http\Controllers\BankAccountController;
use App\Http\Controllers\LogisticsController;
use App\Http\Controllers\DeliveryNoteController;
use App\Http\Controllers\MemberController;
use App\Http\Controllers\NewsController;
use App\Http\Controllers\OrganizationProfileController;
use App\Http\Controllers\ProgramController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\FinancialReceiptController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\VolunteerController;
use App\Http\Controllers\VehicleUsageController;
use App\Http\Controllers\DonationController;
use App\Http\Controllers\PublicDonationController;
use App\Http\Controllers\HelpdeskController;
use App\Http\Controllers\NotificationController;
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

Route::get('/konfirmasi-donasi', [PublicDonationController::class, 'create'])
    ->name('donations.public.create');
Route::post('/konfirmasi-donasi', [PublicDonationController::class, 'store'])
    ->name('donations.public.store');

// ─── Profile Routes (Breeze – auth required) ──────────────────────────────────

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    // Notifications
    Route::post('/notifications/{id}/mark-read', [NotificationController::class, 'markRead'])->name('notifications.mark-read');

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
    Route::middleware(['permission:menu-members'])->group(function () {
        Route::post('/members/{member}/create-account', [MemberController::class, 'createAccount'])->name('members.create-account');
        Route::post('/members/{member}/reset-password', [MemberController::class, 'resetPassword'])->name('members.reset-password');
        Route::patch('/members/{member}/toggle-status', [MemberController::class, 'toggleStatus'])->name('members.toggle-status');
        Route::get('/members/export', [MemberController::class, 'exportExcel'])->name('members.export');
        Route::resource('members', MemberController::class);
    });

    // Executives
    Route::middleware(['permission:menu-executives'])->group(function () {
        Route::resource('executives', ExecutiveController::class);
    });

    // Beneficiaries
    Route::middleware(['permission:menu-beneficiaries'])->group(function () {
        Route::resource('beneficiaries', BeneficiaryController::class);
    });

    // Programs
    Route::middleware(['permission:menu-programs'])->group(function () {
        Route::resource('programs', ProgramController::class)->except(['index', 'show']);
    });

    // News
    Route::middleware(['permission:menu-news'])->group(function () {
        Route::resource('news', NewsController::class)->except(['index', 'show']);
    });

    // Logistics & Delivery Notes
    Route::middleware(['permission:menu-logistics'])->group(function () {
        Route::post('/logistics/transaction', [LogisticsController::class, 'storeTransaction'])->name('logistics.transaction.store');
        Route::resource('logistics', LogisticsController::class);
        Route::resource('delivery-notes', DeliveryNoteController::class);
    });
    
    // Asset Management
    Route::middleware(['permission:menu-assets'])->group(function () {
        Route::resource('assets', \App\Http\Controllers\AssetController::class);
    });

    // Vehicle Usages
    Route::middleware(['permission:menu-vehicle-usages'])->group(function () {
        Route::resource('vehicle-usages', VehicleUsageController::class)->except(['create', 'show', 'edit']);
        Route::get('/vehicle-usages', [VehicleUsageController::class, 'index'])->name('vehicle-usages.index');
    });

    // Dues
    Route::middleware(['permission:menu-dues'])->group(function () {
        Route::post('/dues/bulk-pay', [DuesController::class, 'bulkMarkPaid'])->name('dues.bulk_pay');
        Route::post('/dues/{payment}/pay', [DuesController::class, 'markPaid'])->name('dues.pay');
        Route::post('/dues/{payment}/unpay', [DuesController::class, 'markUnpaid'])->name('dues.unpay');
        Route::resource('dues', DuesController::class);
    });

    // Finance & Bank Accounts
    Route::middleware(['permission:menu-finance'])->group(function () {
        Route::resource('finance', FinanceController::class)->except(['create', 'show', 'edit']);
        Route::get('finance-export', [FinanceController::class, 'exportExcel'])->name('finance.export');
        Route::get('finance-template', [FinanceController::class, 'downloadTemplate'])->name('finance.template');
        Route::post('finance-import', [FinanceController::class, 'importExcel'])->name('finance.import');
        
        // Kwitansi Digital
        Route::get('financial-receipts', [FinancialReceiptController::class, 'index'])->name('financial-receipts.index');
        Route::post('financial-receipts', [FinancialReceiptController::class, 'store'])->name('financial-receipts.store');
        Route::get('financial-receipts/{financialReceipt}/print', [FinancialReceiptController::class, 'print'])->name('financial-receipts.print');

        Route::post('/finance/bank-accounts', [BankAccountController::class, 'store'])->name('bank-accounts.store');
        Route::put('/finance/bank-accounts/{bankAccount}', [BankAccountController::class, 'update'])->name('bank-accounts.update');
        Route::delete('/finance/bank-accounts/{bankAccount}', [BankAccountController::class, 'destroy'])->name('bank-accounts.destroy');
    });

    // Donations
    Route::middleware(['permission:menu-donations'])->group(function () {
        Route::resource('donations', DonationController::class)->except(['create', 'store', 'edit']);
    });

    // Volunteers
    Route::middleware(['permission:menu-volunteers'])->group(function () {
        Route::get('/volunteers/export', [VolunteerController::class, 'export'])->name('volunteers.export');
        Route::patch('/volunteers/{volunteer}/approve', [VolunteerController::class, 'approve'])->name('volunteers.approve');
        Route::patch('/volunteers/{volunteer}/reject', [VolunteerController::class, 'reject'])->name('volunteers.reject');
        Route::post('/volunteers/{volunteer}/create-account', [VolunteerController::class, 'createAccount'])->name('volunteers.create-account');
        Route::post('/volunteers/{volunteer}/reset-password', [VolunteerController::class, 'resetPassword'])->name('volunteers.reset-password');
        Route::resource('volunteers', VolunteerController::class);
    });
    
    // Diklatsar Management
    Route::middleware(['permission:menu-diklatsar'])->group(function () {
        Route::get('/diklatsar', [\App\Http\Controllers\DiklatsarController::class, 'index'])->name('diklatsar.index');
        Route::post('/diklatsar/bulk-advance', [\App\Http\Controllers\DiklatsarController::class, 'bulkAdvance'])->name('diklatsar.bulk-advance');
        Route::patch('/diklatsar/{volunteer}/advance', [\App\Http\Controllers\DiklatsarController::class, 'advance'])->name('diklatsar.advance');
        Route::patch('/diklatsar/modules/{module}', [\App\Http\Controllers\DiklatsarController::class, 'updateModule'])->name('diklatsar.update-module');
        Route::put('/diklatsar/certificate-setting', [\App\Http\Controllers\DiklatsarController::class, 'updateCertificateSetting'])->name('diklatsar.update-certificate-setting');
    });

    Route::get('/diklatsar/{volunteer}/certificate', [\App\Http\Controllers\DiklatsarController::class, 'certificate'])
        ->name('diklatsar.certificate');
    Route::get('/diklatsar/{volunteer}/certificate/preview', [\App\Http\Controllers\DiklatsarController::class, 'previewCertificate'])
        ->name('diklatsar.certificate.preview');

    // Organization Profile
    Route::middleware(['permission:menu-organization'])->group(function () {
        Route::get('/profil-organisasi', [OrganizationProfileController::class, 'show'])->name('profil-organisasi.show');
        Route::post('/profil-organisasi', [OrganizationProfileController::class, 'update'])->name('profil-organisasi.update');
        Route::post('/profil-organisasi/regional-logos', [OrganizationProfileController::class, 'updateRegionalLogos'])->name('profil-organisasi.updateRegionalLogos');
    });

    // User Management
    Route::middleware(['permission:menu-users'])->group(function () {
        Route::resource('users', UserController::class)->except(['show', 'create', 'edit']);
    });
    
    // Activity Logs
    Route::middleware(['permission:menu-activity-logs'])->group(function () {
        Route::get('/activity-logs', [\App\Http\Controllers\ActivityLogController::class, 'index'])->name('activity-logs.index');
    });

    // Reports (Pelaporan)
    Route::middleware(['permission:menu-reports'])->group(function () {
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        Route::get('/reports/export/{type}', [\App\Http\Controllers\ReportController::class, 'export'])->name('reports.export');
    });

    // Helpdesk Support
    Route::get('/helpdesk', [HelpdeskController::class, 'index'])->name('helpdesk.index');
    Route::post('/helpdesk', [HelpdeskController::class, 'store'])->name('helpdesk.store');
    
    // Helpdesk Support (Admin)
    Route::middleware(['permission:menu-helpdesk-manage'])->group(function () {
        Route::get('/helpdesk/manage', [HelpdeskController::class, 'manage'])->name('helpdesk.manage');
        Route::patch('/helpdesk/{ticket}/status', [HelpdeskController::class, 'updateStatus'])->name('helpdesk.updateStatus');
    });
});

require __DIR__.'/auth.php';
