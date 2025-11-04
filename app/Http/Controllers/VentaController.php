<?php

namespace App\Http\Controllers;

use App\Models\Producto;
use App\Models\Venta;
use App\Models\VentaItem;
use App\Services\CodigoBarrasService;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class VentaController extends Controller
{
    public function index(): Response
    {
        $ventaReciente = Venta::query()
            ->with('items')
            ->orderByDesc('fecha_venta')
            ->orderByDesc('id')
            ->first();

        $ventaResource = $ventaReciente
            ? [
                'id' => $ventaReciente->id,
                'cliente_nombre' => $ventaReciente->cliente_nombre,
                'fecha_venta' => $ventaReciente->fecha_venta?->format('Y-m-d'),
                'total' => number_format((float) $ventaReciente->total, 2, '.', ''),
                'items' => $ventaReciente->items->map(function (VentaItem $item) {
                    return [
                        'id' => $item->id,
                        'producto_id' => $item->producto_id,
                        'descripcion_producto' => $item->descripcion_producto,
                        'clave_producto' => $item->clave_producto,
                        'codigo_barras' => $item->codigo_barras,
                        'peso_kg' => number_format((float) $item->peso_kg, 2, '.', ''),
                        'precio_kg' => number_format((float) $item->precio_kg, 2, '.', ''),
                        'total' => number_format((float) $item->total, 2, '.', ''),
                    ];
                })->values(),
            ]
            : null;

        $productos = Producto::query()
            ->orderBy('tipo_producto')
            ->get(['id', 'clave_producto', 'tipo_producto', 'precio_kg'])
            ->map(function (Producto $producto) {
                return [
                    'id' => $producto->id,
                    'clave_producto' => $producto->clave_producto,
                    'tipo_producto' => $producto->tipo_producto,
                    'precio_kg' => number_format((float) $producto->precio_kg, 2, '.', ''),
                ];
        });

        return Inertia::render('Ventas/Index', [
            'ventaReciente' => $ventaResource,
            'productos' => $productos,
            'flash' => session('flash'),
        ]);
    }

    public function registros(Request $request): Response
    {
        $defaultDate = Carbon::now('America/Mexico_City')->toDateString();

        $filters = [
            'cliente' => $request->string('cliente')->trim()->toString(),
            'fecha_inicio' => $request->input('fecha_inicio', $defaultDate),
            'fecha_fin' => $request->input('fecha_fin', $defaultDate),
        ];

        $baseQuery = Venta::query();

        if ($filters['cliente'] !== '') {
            $baseQuery->where('cliente_nombre', 'like', '%' . $filters['cliente'] . '%');
        }

        if (!empty($filters['fecha_inicio'])) {
            $baseQuery->whereDate('fecha_venta', '>=', $filters['fecha_inicio']);
        }

        if (!empty($filters['fecha_fin'])) {
            $baseQuery->whereDate('fecha_venta', '<=', $filters['fecha_fin']);
        }

        $ventasCollection = (clone $baseQuery)
            ->withCount('items')
            ->with(['items' => function ($query) {
                $query->orderBy('id');
            }])
            ->orderByDesc('fecha_venta')
            ->orderByDesc('id')
            ->get();

        $ventas = $ventasCollection->map(function (Venta $venta) {
            return [
                'id' => $venta->id,
                'cliente_nombre' => $venta->cliente_nombre,
                'fecha_venta' => $venta->fecha_venta?->format('Y-m-d'),
                'items_count' => $venta->items_count,
                'total' => number_format((float) $venta->total, 2, '.', ''),
                'items' => $venta->items->map(function (VentaItem $item) {
                    return [
                        'id' => $item->id,
                        'descripcion_producto' => $item->descripcion_producto,
                        'clave_producto' => $item->clave_producto,
                        'codigo_barras' => $item->codigo_barras,
                        'peso_kg' => number_format((float) $item->peso_kg, 2, '.', ''),
                        'precio_kg' => number_format((float) $item->precio_kg, 2, '.', ''),
                        'total' => number_format((float) $item->total, 2, '.', ''),
                    ];
                })->values(),
            ];
        })->values();

        $metrics = [
            'total_ventas' => $ventasCollection->count(),
            'total_cajas' => (int) $ventasCollection->sum('items_count'),
            'total_vendido' => number_format($ventasCollection->sum(function (Venta $venta) {
                return (float) $venta->total;
            }), 2, '.', ''),
        ];

        return Inertia::render('Ventas/Registros', [
            'ventas' => $ventas,
            'metrics' => $metrics,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'cliente_nombre' => 'required|string|max:255',
            'fecha_venta' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.descripcion_producto' => 'required|string|max:255',
            'items.*.clave_producto' => 'nullable|string|max:20',
            'items.*.codigo_barras' => 'nullable|string|max:255',
            'items.*.producto_id' => 'nullable|exists:productos,id',
            'items.*.peso_kg' => 'required|numeric|min:0.01|max:999999.99',
            'items.*.precio_kg' => 'required|numeric|min:0|max:999999.99',
        ]);

        $itemsPayload = collect($validated['items'])->map(function (array $item) {
            $peso = round((float) $item['peso_kg'], 2);
            $precio = round((float) $item['precio_kg'], 2);
            $total = round($peso * $precio, 2);

            return [
                'producto_id' => $item['producto_id'] ?? null,
                'descripcion_producto' => $item['descripcion_producto'],
                'clave_producto' => $item['clave_producto'] ?? null,
                'codigo_barras' => $item['codigo_barras'] ?? null,
                'peso_kg' => $peso,
                'precio_kg' => $precio,
                'total' => $total,
            ];
        });

        $ventaTotal = $itemsPayload->sum('total');

        DB::transaction(function () use ($validated, $itemsPayload, $ventaTotal) {
            $venta = Venta::create([
                'cliente_nombre' => $validated['cliente_nombre'],
                'fecha_venta' => $validated['fecha_venta'],
                'total' => round($ventaTotal, 2),
            ]);

            $venta->items()->createMany($itemsPayload->all());
        });

        return redirect()
            ->route('ventas.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Venta registrada correctamente.',
            ]);
    }

    public function update(Request $request, Venta $venta): RedirectResponse
    {
        $validated = $request->validate([
            'cliente_nombre' => 'required|string|max:255',
            'fecha_venta' => 'required|date',
            'items' => 'required|array|min:1',
            'items.*.descripcion_producto' => 'required|string|max:255',
            'items.*.clave_producto' => 'nullable|string|max:20',
            'items.*.codigo_barras' => 'nullable|string|max:255',
            'items.*.producto_id' => 'nullable|exists:productos,id',
            'items.*.peso_kg' => 'required|numeric|min:0.01|max:999999.99',
            'items.*.precio_kg' => 'required|numeric|min:0|max:999999.99',
        ]);

        $itemsPayload = collect($validated['items'])->map(function (array $item) {
            $peso = round((float) $item['peso_kg'], 2);
            $precio = round((float) $item['precio_kg'], 2);
            $total = round($peso * $precio, 2);

            return [
                'producto_id' => $item['producto_id'] ?? null,
                'descripcion_producto' => $item['descripcion_producto'],
                'clave_producto' => $item['clave_producto'] ?? null,
                'codigo_barras' => $item['codigo_barras'] ?? null,
                'peso_kg' => $peso,
                'precio_kg' => $precio,
                'total' => $total,
            ];
        });

        $ventaTotal = $itemsPayload->sum('total');

        DB::transaction(function () use ($venta, $validated, $itemsPayload, $ventaTotal) {
            $venta->update([
                'cliente_nombre' => $validated['cliente_nombre'],
                'fecha_venta' => $validated['fecha_venta'],
                'total' => round($ventaTotal, 2),
            ]);

            $venta->items()->delete();
            $venta->items()->createMany($itemsPayload->all());
        });

        return redirect()
            ->route('ventas.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Venta actualizada correctamente.',
            ]);
    }

    public function destroy(Venta $venta): RedirectResponse
    {
        $venta->delete();

        return redirect()
            ->route('ventas.index')
            ->with('flash', [
                'type' => 'success',
                'message' => 'Venta eliminada correctamente.',
            ]);
    }

    public function recibo(Venta $venta)
    {
        $venta->load(['items' => function ($query) {
            $query->orderBy('id');
        }]);

        $pdf = Pdf::loadView('pdf.ventas.recibo', [
            'venta' => $venta,
        ]);

        $fileName = sprintf('venta-%s.pdf', $venta->id);

        return $pdf->stream($fileName);
    }

    public function scan(Request $request, CodigoBarrasService $codigoBarrasService): JsonResponse
    {
        $validated = $request->validate([
            'codigo_barras' => 'required|string|min:6|max:255',
        ]);

        $parsed = $codigoBarrasService->parse($validated['codigo_barras']);

        if (!empty($parsed['error'])) {
            return response()->json([
                'error' => true,
                'message' => $parsed['mensaje'] ?? 'No fue posible interpretar el codigo proporcionado.',
            ], 422);
        }

        return response()->json([
            'error' => false,
            'payload' => [
                'producto_id' => $parsed['producto_id'] ?? null,
                'clave_producto' => $parsed['clave_producto'] ?? null,
                'descripcion_producto' => $parsed['producto'] ?? 'Producto detectado',
                'precio_kg' => (float) ($parsed['precio_kg'] ?? 0),
                'peso_kg' => (float) ($parsed['peso_kg'] ?? 0),
                'codigo_barras' => $validated['codigo_barras'],
            ],
        ]);
    }
}
