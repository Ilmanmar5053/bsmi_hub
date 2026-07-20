<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Volunteer;
use App\Models\Member;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Permission;
use Tests\TestCase;

class MemberManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Permission::firstOrCreate(['name' => 'view-members']);
        Permission::firstOrCreate(['name' => 'manage-members']);
    }

    public function test_admin_can_view_members_with_eligible_volunteers(): void
    {
        $user = User::factory()->create();
        $user->givePermissionTo('view-members');

        // Create an eligible volunteer (approved and stage 6)
        $eligible = Volunteer::create([
            'name' => 'Eligible Vol',
            'email' => 'eligible@example.com',
            'status' => 'approved',
            'diklatsar_stage' => 6,
            'applied_date' => now()->toDateString(),
        ]);

        // Create an ineligible volunteer (not stage 6)
        $ineligible1 = Volunteer::create([
            'name' => 'Ineligible Vol 1',
            'email' => 'ineligible1@example.com',
            'status' => 'approved',
            'diklatsar_stage' => 5,
            'applied_date' => now()->toDateString(),
        ]);

        // Create an ineligible volunteer (already a member)
        $ineligible2 = Volunteer::create([
            'name' => 'Ineligible Vol 2',
            'email' => 'ineligible2@example.com',
            'status' => 'approved',
            'diklatsar_stage' => 6,
            'applied_date' => now()->toDateString(),
        ]);
        Member::create([
            'no_induk_anggota' => 'MEMBER-001',
            'nama_lengkap' => 'Ineligible Vol 2',
            'email' => 'ineligible2@example.com',
        ]);

        $response = $this->actingAs($user)->get('/members');

        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Members/Index')
            ->has('eligibleVolunteers', 1)
            ->where('eligibleVolunteers.0.email', 'eligible@example.com')
        );
    }

    public function test_admin_can_import_member_from_volunteer_and_sync_changes(): void
    {
        $admin = User::factory()->create();
        $admin->givePermissionTo('manage-members');

        $userAccount = User::factory()->create();

        $volunteer = Volunteer::create([
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'phone' => '08123456789',
            'address' => 'Old Address',
            'status' => 'approved',
            'diklatsar_stage' => 6,
            'user_id' => $userAccount->id,
            'applied_date' => now()->toDateString(),
        ]);

        $postData = [
            'no_induk_anggota' => 'MEM-1234',
            'nama_lengkap' => 'John Doe Revised',
            'gender' => 'L',
            'email' => 'john.revised@example.com',
            'no_whatsapp' => '08999999999',
            'bagian_divisi' => 'Logistik',
            'status_aktif' => true,
            'alamat_domisili' => 'New Correct Address',
            'golongan_darah' => 'O',
            'profesi_utama' => 'Wiraswasta/Pengusaha',
            'kesiapan_mobilisasi' => true,
            'ukuran_baju' => 'XL',
            'volunteer_id' => $volunteer->id,
        ];

        $response = $this->actingAs($admin)->post('/members', $postData);

        $response->assertRedirect('/members');
        
        // Assert member is created with user_id from volunteer
        $this->assertDatabaseHas('members', [
            'no_induk_anggota' => 'MEM-1234',
            'nama_lengkap' => 'John Doe Revised',
            'email' => 'john.revised@example.com',
            'user_id' => $userAccount->id,
        ]);

        // Assert volunteer details are synced
        $volunteer->refresh();
        $this->assertEquals('John Doe Revised', $volunteer->name);
        $this->assertEquals('john.revised@example.com', $volunteer->email);
        $this->assertEquals('08999999999', $volunteer->phone);
        $this->assertEquals('New Correct Address', $volunteer->address);
    }
}
