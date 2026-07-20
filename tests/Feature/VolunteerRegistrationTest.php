<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Volunteer;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class VolunteerRegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_volunteer_registration_page_can_be_rendered(): void
    {
        $response = $this->get('/daftar-relawan');

        $response->assertStatus(200);
    }

    public function test_volunteer_can_register(): void
    {
        $response = $this->post('/daftar-relawan', [
            'name' => 'John Doe',
            'email' => 'johndoe@example.com',
            'phone' => '08123456789',
            'address' => 'Jl. Merdeka No. 12',
            'birth_date' => '1995-05-15',
            'occupation' => 'Web Developer',
            'skills' => 'Laravel, React',
            'motivation' => 'Ingin berkontribusi pada kemানুsaan',
        ]);

        $response->assertRedirect('/daftar-relawan');
        $this->assertDatabaseHas('volunteers', [
            'email' => 'johndoe@example.com',
            'name' => 'John Doe',
        ]);
    }

    public function test_unauthenticated_user_cannot_export_volunteers(): void
    {
        $response = $this->get('/volunteers/export');

        $response->assertRedirect('/login');
    }

    public function test_authenticated_user_can_export_all_volunteers(): void
    {
        \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'view-volunteers']);
        $user = User::factory()->create();
        $user->givePermissionTo('view-volunteers');
        
        Volunteer::create([
            'name' => 'Pending Volunteer',
            'email' => 'pending@example.com',
            'status' => 'pending',
            'applied_date' => now()->toDateString(),
        ]);

        Volunteer::create([
            'name' => 'Approved Volunteer',
            'email' => 'approved@example.com',
            'status' => 'approved',
            'applied_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($user)->get('/volunteers/export');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }

    public function test_authenticated_user_can_export_filtered_volunteers(): void
    {
        \Spatie\Permission\Models\Permission::firstOrCreate(['name' => 'view-volunteers']);
        $user = User::factory()->create();
        $user->givePermissionTo('view-volunteers');
        
        Volunteer::create([
            'name' => 'Pending Volunteer',
            'email' => 'pending@example.com',
            'status' => 'pending',
            'applied_date' => now()->toDateString(),
        ]);

        Volunteer::create([
            'name' => 'Approved Volunteer',
            'email' => 'approved@example.com',
            'status' => 'approved',
            'applied_date' => now()->toDateString(),
        ]);

        $response = $this->actingAs($user)->get('/volunteers/export?status=pending');

        $response->assertStatus(200);
        $response->assertHeader('content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    }
}
