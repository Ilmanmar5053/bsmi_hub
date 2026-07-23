<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\HelpdeskTicket;
use App\Models\OrganizationProfile;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class HelpdeskController extends Controller
{
    // For all logged-in users: view helpdesk form & contact info
    public function index()
    {
        $organization = OrganizationProfile::first();
        $myTickets = HelpdeskTicket::where('user_id', Auth::id())
                        ->orderBy('created_at', 'desc')
                        ->get();

        return Inertia::render('Helpdesk/Index', [
            'organization' => $organization,
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

        HelpdeskTicket::create([
            'user_id' => Auth::id(),
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => 'open',
        ]);

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
        ]);

        $ticket->update(['status' => $validated['status']]);

        return redirect()->back()->with('success', 'Status pengaduan berhasil diperbarui.');
    }
}
