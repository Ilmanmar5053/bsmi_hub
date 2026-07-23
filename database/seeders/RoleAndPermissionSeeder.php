<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RoleAndPermissionSeeder extends Seeder
{
    public function run(): void
    {
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // Bersihkan permission lama (opsional, agar db bersih)
        \Illuminate\Support\Facades\DB::table('role_has_permissions')->truncate();
        \Illuminate\Support\Facades\DB::table('model_has_permissions')->truncate();
        Permission::query()->delete();

        // ── 1. Permissions (Menu Based) ───────────────────────────
        $permissionNames = [
            'menu-dashboard',
            'menu-organization',
            'menu-members',
            'menu-executives',
            'menu-volunteers',
            'menu-diklatsar',
            'menu-programs',
            'menu-beneficiaries',
            'menu-news',
            'menu-finance',
            'menu-donations',
            'menu-dues',
            'menu-logistics',
            'menu-assets',
            'menu-vehicle-usages',
            'menu-reports',
            'menu-users',
            'menu-activity-logs',
        ];

        $permissions = collect($permissionNames)->map(
            fn (string $name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web'])
        );

        $perms = fn (array $names) => $permissions->whereIn('name', $names)->values()->all();

        // ── 2. Roles ──────────────────────────────────────────────────────────
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions($permissions->all());

        $ketua = Role::firstOrCreate(['name' => 'ketua', 'guard_name' => 'web']);
        $ketua->syncPermissions($permissions->all()); // Ketua full access

        $sekretaris = Role::firstOrCreate(['name' => 'sekretaris', 'guard_name' => 'web']);
        $sekretaris->syncPermissions($perms([
            'menu-dashboard', 'menu-organization', 'menu-members', 'menu-executives',
            'menu-volunteers', 'menu-diklatsar', 'menu-programs', 'menu-beneficiaries',
            'menu-news', 'menu-reports', 'menu-users', 'menu-activity-logs'
        ]));

        $bendahara = Role::firstOrCreate(['name' => 'bendahara', 'guard_name' => 'web']);
        $bendahara->syncPermissions($perms([
            'menu-dashboard', 'menu-finance', 'menu-donations', 'menu-dues', 'menu-reports'
        ]));

        $koordinatorLogistik = Role::firstOrCreate(['name' => 'koordinator_logistik', 'guard_name' => 'web']);
        $koordinatorLogistik->syncPermissions($perms([
            'menu-dashboard', 'menu-members', 'menu-logistics', 'menu-assets', 'menu-vehicle-usages', 'menu-beneficiaries', 'menu-reports'
        ]));

        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staff->syncPermissions($perms([
            'menu-dashboard', 'menu-members', 'menu-volunteers', 'menu-programs', 'menu-news', 'menu-reports'
        ]));

        $anggota = Role::firstOrCreate(['name' => 'anggota', 'guard_name' => 'web']);
        $anggota->syncPermissions($perms([
            'menu-dashboard'
        ]));

        $relawan = Role::firstOrCreate(['name' => 'relawan', 'guard_name' => 'web']);
        $relawan->syncPermissions($perms([
            'menu-dashboard'
        ]));

        $this->command->info('✅  RoleAndPermissionSeeder selesai. Hak Akses (Menu Based) telah diperbarui.');
    }
}
