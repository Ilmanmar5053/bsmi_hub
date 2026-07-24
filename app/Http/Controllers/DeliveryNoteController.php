<?php

namespace App\Http\Controllers;

use App\Models\DeliveryNote;
use App\Models\DeliveryNoteItem;
use App\Models\LogisticsItem;
use App\Models\LogisticsTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DeliveryNoteController extends Controller
{
    public function index()
    {
        $deliveryNotes = DeliveryNote::with(['creator', 'items.logisticsItem'])
            ->latest('date')
            ->paginate(15)
            ->through(fn ($note) => [
                'id' => $note->id,
                'document_number' => $note->document_number,
                'date' => $note->date->format('d M Y'),
                'destination' => $note->destination,
                'vehicle_plate' => $note->vehicle_plate,
                'driver_name' => $note->driver_name,
                'total_items' => $note->items->count(),
                'items' => $note->items->map(fn($i) => [
                    'name' => $i->logisticsItem?->name,
                    'quantity' => $i->quantity,
                    'unit' => $i->logisticsItem?->unit,
                    'notes' => $i->notes
                ]),
            ]);

        return Inertia::render('Logistics/DeliveryNotes/Index', [
            'deliveryNotes' => $deliveryNotes,
        ]);
    }

    public function create()
    {
        // Need only available stock items
        $items = LogisticsItem::where('quantity', '>', 0)
            ->orderBy('name')
            ->get(['id', 'name', 'unit', 'quantity']);

        // Generate next document number (e.g., SJ-BSMI/2026/07/001)
        $year = date('Y');
        $month = date('m');
        $lastNote = DeliveryNote::whereYear('date', $year)
            ->whereMonth('date', $month)
            ->orderBy('id', 'desc')
            ->first();
        
        $nextId = $lastNote ? ((int) substr($lastNote->document_number, -3)) + 1 : 1;
        $documentNumber = sprintf("SJ-BSMI/%s/%s/%03d", $year, $month, $nextId);

        $personnelNames = \App\Models\Member::where('status_aktif', true)->orderBy('nama_lengkap')->pluck('nama_lengkap');

        return Inertia::render('Logistics/DeliveryNotes/Create', [
            'logisticsItems' => $items,
            'suggestedDocumentNumber' => $documentNumber,
            'defaultDate' => date('Y-m-d'),
            'personnelNames' => $personnelNames
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'document_number' => 'required|string|unique:delivery_notes',
            'date' => 'required|date',
            'destination' => 'required|string|max:255',
            'vehicle_plate' => 'nullable|string|max:50',
            'driver_name' => 'nullable|string|max:255',
            'warehouse_pic' => 'nullable|string|max:255',
            'equipment_pic' => 'nullable|string|max:255',
            'coordinator_pic' => 'nullable|string|max:255',
            'notes' => 'nullable|string',
            'items' => 'required|array|min:1',
            'items.*.logistics_item_id' => 'required|exists:logistics_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.notes' => 'nullable|string',
        ]);

        try {
            DB::beginTransaction();

            $deliveryNote = DeliveryNote::create([
                'document_number' => $validated['document_number'],
                'date' => $validated['date'],
                'destination' => $validated['destination'],
                'vehicle_plate' => $validated['vehicle_plate'],
                'driver_name' => $validated['driver_name'],
                'warehouse_pic' => $validated['warehouse_pic'],
                'equipment_pic' => $validated['equipment_pic'],
                'coordinator_pic' => $validated['coordinator_pic'],
                'notes' => $validated['notes'],
                'created_by' => auth()->id(),
            ]);

            foreach ($validated['items'] as $itemData) {
                $logisticsItem = LogisticsItem::findOrFail($itemData['logistics_item_id']);

                if ($logisticsItem->quantity < $itemData['quantity']) {
                    throw new \Exception("Stok {$logisticsItem->name} tidak mencukupi (Sisa: {$logisticsItem->quantity}).");
                }

                // 1. Create Delivery Note Item
                DeliveryNoteItem::create([
                    'delivery_note_id' => $deliveryNote->id,
                    'logistics_item_id' => $itemData['logistics_item_id'],
                    'quantity' => $itemData['quantity'],
                    'notes' => $itemData['notes'] ?? null,
                ]);

                // 2. Create Logistics Transaction record
                LogisticsTransaction::create([
                    'logistics_item_id' => $itemData['logistics_item_id'],
                    'type' => 'keluar',
                    'quantity' => $itemData['quantity'],
                    'date' => $validated['date'],
                    'destination' => $validated['destination'],
                    'notes' => "Surat Jalan: " . $validated['document_number'] . ($itemData['notes'] ? " - " . $itemData['notes'] : ''),
                    'created_by' => auth()->id(),
                ]);

                // 3. Deduct stock
                $logisticsItem->decrement('quantity', $itemData['quantity']);
            }

            DB::commit();

            return redirect()->route('delivery-notes.index')
                ->with('success', 'Surat Jalan berhasil dibuat dan stok gudang telah diperbarui.');

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->with('error', 'Gagal membuat Surat Jalan: ' . $e->getMessage());
        }
    }

    public function show(DeliveryNote $deliveryNote)
    {
        $deliveryNote->load(['items.logisticsItem', 'creator']);
        return Inertia::render('Logistics/DeliveryNotes/Print', [
            'deliveryNote' => $deliveryNote
        ]);
    }
}
