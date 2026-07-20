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

        // ── 1. Permissions ────────────────────────────────────────────────────
        $permissionNames = [
            'view-dashboard',
            'view-organization',
            'view-members',
            'manage-members',
            'manage-executives',
            'manage-beneficiaries',
            'manage-programs',
            'view-logistics',
            'manage-logistics',
            'view-dues',
            'manage-dues',
            'view-volunteers',
            'manage-volunteers',
            'manage-users',
            'view-finance',
            'manage-finance',
            'manage-news',
            'view-reports',
            'export-reports',
        ];

        $permissions = collect($permissionNames)->map(
            fn (string $name) => Permission::firstOrCreate(['name' => $name, 'guard_name' => 'web'])
        );

        $perms = fn (array $names) => $permissions->whereIn('name', $names)->values()->all();

        // ── 2. Roles ──────────────────────────────────────────────────────────
        $superAdmin = Role::firstOrCreate(['name' => 'super_admin', 'guard_name' => 'web']);
        $superAdmin->syncPermissions($permissions->all());

        $ketua = Role::firstOrCreate(['name' => 'ketua', 'guard_name' => 'web']);
        $ketua->syncPermissions($perms([
            'view-dashboard', 'view-organization',
            'view-members', 'manage-members',
            'manage-executives', 'manage-beneficiaries', 'manage-programs',
            'view-logistics', 'manage-logistics',
            'view-dues', 'manage-dues',
            'view-volunteers', 'manage-volunteers',
            'view-finance', 'manage-finance',
            'manage-news',
            'view-reports', 'export-reports',
        ]));

        $sekretaris = Role::firstOrCreate(['name' => 'sekretaris', 'guard_name' => 'web']);
        $sekretaris->syncPermissions($perms([
            'view-dashboard', 'view-organization',
            'view-members', 'manage-members',
            'manage-executives', 'manage-programs',
            'view-volunteers', 'manage-volunteers',
            'manage-news',
            'view-reports', 'export-reports',
        ]));

        $bendahara = Role::firstOrCreate(['name' => 'bendahara', 'guard_name' => 'web']);
        $bendahara->syncPermissions($perms([
            'view-dashboard',
            'view-finance', 'manage-finance',
            'view-dues', 'manage-dues',
            'view-reports', 'export-reports',
        ]));

        $koordinatorLogistik = Role::firstOrCreate(['name' => 'koordinator_logistik', 'guard_name' => 'web']);
        $koordinatorLogistik->syncPermissions($perms([
            'view-dashboard',
            'view-members',
            'view-logistics', 'manage-logistics',
            'manage-beneficiaries',
            'view-reports',
        ]));

        $staff = Role::firstOrCreate(['name' => 'staff', 'guard_name' => 'web']);
        $staff->syncPermissions($perms([
            'view-dashboard',
            'view-members',
            'view-logistics',
            'view-dues',
            'view-volunteers',
            'manage-news',
        ]));

        $anggota = Role::firstOrCreate(['name' => 'anggota', 'guard_name' => 'web']);
        $anggota->syncPermissions($perms([
            'view-dashboard'
        ]));

        $relawan = Role::firstOrCreate(['name' => 'relawan', 'guard_name' => 'web']);
        $relawan->syncPermissions($perms([
            'view-dashboard'
        ]));

        $this->command->info('✅  RoleAndPermissionSeeder selesai. Hak Akses telah diperbarui.');
    }
}
