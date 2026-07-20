<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class UserController extends Controller
{
    public function index(Request $request): Response
    {
        $search = $request->get('search', '');

        $users = User::with('roles')
            ->when($search, fn ($q) => $q->where('name', 'like', "%{$search}%")
                ->orWhere('email', 'like', "%{$search}%"))
            ->orderBy('name')
            ->paginate(15)
            ->withQueryString()
            ->through(fn ($u) => [
                'id'         => $u->id,
                'name'       => $u->name,
                'email'      => $u->email,
                'roles'       => $u->roles->pluck('name'),
                'permissions' => $u->permissions->pluck('name'),
                'created_at'  => $u->created_at?->format('d M Y'),
            ]);

        $roles = Role::orderBy('name')->get(['id', 'name']);
        $permissions = Permission::orderBy('name')->get(['id', 'name']);

        return Inertia::render('Users/Index', [
            'users'       => $users,
            'roles'       => $roles,
            'permissions' => $permissions,
            'filters'     => ['search' => $search],
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email',
            'password'    => 'required|string|min:8|confirmed',
            'roles'       => 'nullable|array',
            'roles.*'     => 'exists:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*'=> 'exists:permissions,name',
        ]);

        try {
            $user = User::create([
                'name'              => $validated['name'],
                'email'             => $validated['email'],
                'password'          => Hash::make($validated['password']),
                'email_verified_at' => now(),
            ]);

            if (!empty($validated['roles'])) {
                $user->syncRoles($validated['roles']);
            }
            if (!empty($validated['permissions'])) {
                $user->syncPermissions($validated['permissions']);
            }

            return redirect()->route('users.index')
                ->with('success', 'Pengguna berhasil ditambahkan.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menambahkan pengguna: ' . $e->getMessage());
        }
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'name'     => 'required|string|max:255',
            'email'    => 'required|email|unique:users,email,' . $user->id,
            'password'    => 'nullable|string|min:8|confirmed',
            'roles'       => 'nullable|array',
            'roles.*'     => 'exists:roles,name',
            'permissions' => 'nullable|array',
            'permissions.*'=> 'exists:permissions,name',
        ]);

        try {
            $updateData = [
                'name'  => $validated['name'],
                'email' => $validated['email'],
            ];

            if (!empty($validated['password'])) {
                $updateData['password'] = Hash::make($validated['password']);
            }

            $user->update($updateData);
            $user->syncRoles($validated['roles'] ?? []);
            $user->syncPermissions($validated['permissions'] ?? []);

            return redirect()->route('users.index')
                ->with('success', 'Data pengguna berhasil diperbarui.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal memperbarui pengguna: ' . $e->getMessage());
        }
    }

    public function destroy(User $user): RedirectResponse
    {
        try {
            if ($user->id === auth()->id()) {
                return back()->with('error', 'Tidak dapat menghapus akun sendiri.');
            }

            $user->delete();

            return redirect()->route('users.index')
                ->with('success', 'Pengguna berhasil dihapus.');
        } catch (\Throwable $e) {
            return back()->with('error', 'Gagal menghapus pengguna: ' . $e->getMessage());
        }
    }
}
