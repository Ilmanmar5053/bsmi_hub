<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => $request->user(),
                'roles' => $request->user() ? $request->user()->getRoleNames() : [],
                'permissions' => $request->user() ? $request->user()->getAllPermissions()->pluck('name') : [],
                'member' => $request->user() ? \App\Models\Member::where('user_id', $request->user()->id)->first() : null,
                'notifications' => $request->user() ? $request->user()->unreadNotifications : [],
            ],
            'flash' => [
                'success' => $request->session()->get('success'),
                'error' => $request->session()->get('error'),
            ],
            'organization' => function () {
                $org = \App\Models\OrganizationProfile::first();
                return $org ? [
                    'name' => $org->name,
                    'address' => $org->address,
                    'phone' => $org->phone,
                    'email' => $org->email,
                    'logo_url' => $org->logo_url,
                    'regional_logos_url' => collect($org->regional_logos ?: [])->mapWithKeys(function ($path, $region) {
                        return [$region => asset('storage/' . $path)];
                    })->toArray(),
                ] : null;
            },
        ];
    }
}
