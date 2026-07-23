<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use Illuminate\Auth\Events\Logout;
use Illuminate\Auth\Events\Failed;
use Illuminate\Support\Facades\Request;

class LogAuthenticationEvents
{
    public function handleLogin(Login $event)
    {
        activity('authentication')
            ->causedBy($event->user)
            ->withProperties(['ip' => Request::ip(), 'user_agent' => Request::userAgent()])
            ->log('User logged in');
    }

    public function handleLogout(Logout $event)
    {
        if ($event->user) {
            activity('authentication')
                ->causedBy($event->user)
                ->withProperties(['ip' => Request::ip(), 'user_agent' => Request::userAgent()])
                ->log('User logged out');
        }
    }

    public function handleFailed(Failed $event)
    {
        activity('authentication')
            ->withProperties([
                'ip' => Request::ip(), 
                'user_agent' => Request::userAgent(),
                'email' => $event->credentials['email'] ?? 'unknown',
            ])
            ->log('Failed login attempt');
    }

}
