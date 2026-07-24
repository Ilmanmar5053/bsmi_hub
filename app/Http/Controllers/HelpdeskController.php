<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HelpdeskTicket;
use App\Models\OrganizationProfile;
use App\Models\User;
use App\Notifications\HelpdeskNotification;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Notification;

class HelpdeskController extends Controller
{
    // For all logged-in users: view helpdesk form & contact info
    public function index()
    {
        $myTickets = HelpdeskTicket::where('user_id', Auth::id())
                        ->orderBy('created_at', 'desc')
                        ->get();

        return Inertia::render('Helpdesk/Index', [
            'myTickets' => $myTickets,
        ]);
    }

    // Submit a new ticket
    public function store(Request $request)
    {
        $validated = $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $ticket = HelpdeskTicket::create([
            'user_id' => Auth::id(),
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

        $admins = User::permission('menu-helpdesk-manage')->get();
        if ($admins->count() > 0) {
            Notification::send($admins, new HelpdeskNotification(
                'Pengaduan Baru',
                'Ada pengaduan baru dari ' . Auth::user()->name . ': ' . $validated['subject'],
                '/helpdesk/manage'
            ));
        }

        return redirect()->route('helpdesk.index')->with('success', 'Pengaduan berhasil dikirim. Tim Helpdesk kami akan segera menindaklanjuti.');
    }

    // For Admins: Manage all tickets
    public function manage()
    {
        $tickets = HelpdeskTicket::with('user')
                        ->orderBy('created_at', 'desc')
                        ->paginate(20);

        return Inertia::render('Helpdesk/Manage', [
            'tickets' => $tickets,
        ]);
    }

    // For Admins: Update ticket status
    public function updateStatus(Request $request, HelpdeskTicket $ticket)
    {
        $validated = $request->validate([
            'status' => 'required|in:open,in_progress,resolved,closed',
            'admin_response' => 'nullable|string',
        ]);

        $status = $validated['status'];
        $responseAdded = false;

        if ($status === 'resolved' && !empty($validated['admin_response'])) {
            $status = 'closed';
            $responseAdded = true;
        }

        $ticket->update([
            'status' => $status,
            'admin_response' => $validated['admin_response'] ?? $ticket->admin_response,
        ]);

        if ($responseAdded && $ticket->user) {
            $ticket->user->notify(new HelpdeskNotification(
                'Tanggapan Admin',
                'Admin telah menanggapi pengaduan Anda: ' . $ticket->subject,
                '/helpdesk'
            ));
        }

        return redirect()->back()->with('success', 'Status pengaduan berhasil diperbarui.');
    }
}
