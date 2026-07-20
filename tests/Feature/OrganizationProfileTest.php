<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\OrganizationProfile;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class OrganizationProfileTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::firstOrCreate(['name' => 'view-organization']);
        Permission::firstOrCreate(['name' => 'manage-organization']);
        Role::firstOrCreate(['name' => 'anggota']);
        Role::firstOrCreate(['name' => 'relawan']);
        Role::firstOrCreate(['name' => 'administrator']);
    }

    public function test_admin_can_update_organization_profile(): void
    {
        $user = User::factory()->create();
        $user->assignRole('administrator');
        $user->givePermissionTo(['view-organization', 'manage-organization']);

        $response = $this->actingAs($user)->put('/profil-organisasi', [
            'name' => 'BSMI Cabang Baru',
            'vision' => 'Visi Baru',
            'mission' => 'Misi Baru',
            'address' => 'Alamat Baru',
        ]);

        $response->assertRedirect('/profil-organisasi');
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('organization_profiles', [
            'name' => 'BSMI Cabang Baru',
            'vision' => 'Visi Baru',
        ]);
    }

    public function test_anggota_role_cannot_update_organization_profile_even_with_permission(): void
    {
        $user = User::factory()->create();
        $user->assignRole('anggota');
        $user->givePermissionTo(['view-organization', 'manage-organization']);

        $response = $this->actingAs($user)->put('/profil-organisasi', [
            'name' => 'BSMI Hack',
            'vision' => 'Hack Visi',
        ]);

        $response->assertSessionHas('error');
        $this->assertDatabaseMissing('organization_profiles', [
            'name' => 'BSMI Hack',
        ]);
    }
}
