<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Define all permissions
        $permissions = [
            'view-dashboard',
            'view-organization',
            'manage-members',
            'manage-executives',
            'manage-beneficiaries',
            'manage-programs',
            'manage-logistics',
            'manage-dues',
            'manage-finance',
            'manage-volunteers',
            'manage-users',
        ];

        // Create permissions
        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // Create Roles
        $adminRole = Role::firstOrCreate(['name' => 'administrator']);
        $anggotaRole = Role::firstOrCreate(['name' => 'anggota']);

        // Assign permissions to roles
        $adminRole->syncPermissions($permissions); // Admin gets everything
        $anggotaRole->syncPermissions([ // Anggota gets limited features
            'view-dashboard',
            'view-organization',
            'manage-programs', // Can view programs (read-only handled by UI)
        ]);

        // Assign Admin Role to default admin user
        $admin = User::where('email', 'admin@bsmi.org')->first();
        if ($admin) {
            $admin->assignRole($adminRole);
        }
    }
}
