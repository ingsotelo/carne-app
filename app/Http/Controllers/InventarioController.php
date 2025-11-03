<?php

namespace App\Http\Controllers;

use App\Models\Inventario;
use Inertia\Inertia;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;


class InventarioController extends Controller
{
    /**
     * Mostrar lista de inventarios activos
     */
    public function index()
    {
        //$inventarios = Inventario::activo()
        $inventarios = Inventario::withCount('cajas')
            ->withSum('cajas', 'peso')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($inventario) {
                return [
                    'id' => $inventario->id,
                    'nombre' => $inventario->nombre,
                    'descripcion' => $inventario->descripcion,
                    'activo' => $inventario->activo,
                    'total_cajas' => $inventario->cajas_count ?? 0,
                    'total_peso' => number_format($inventario->cajas_sum_peso ?? 0, 2, '.', ''),
                    'created_at' => $inventario->created_at->format('d/m/Y H:i'),
                ];
            });

        return Inertia::render('Inventarios/Index', [
            'inventarios' => $inventarios,
             'flash' => session('flash'),
        ]);
    }

    /**
     * Mostrar formulario para crear nuevo inventario
     */
    public function create()
    {
        return Inertia::render('Inventarios/Create');
    }

    /**
     * Guardar nuevo inventario
     */
    public function store(Request $request)
    {
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string|max:1000',
            'activo' => 'boolean',
        ]);

        try {
            $inventario = Inventario::create([
                'nombre' => $request->nombre,
                'descripcion' => $request->descripcion,
                'activo' => $request->activo ?? true,
            ]);

            return redirect()
                ->route('inventarios.show', $inventario)
                ->with('flash', [
                    'type' => 'success',
                    'message' => 'Inventario creado exitosamente'
                ]);

        } catch (\Exception $e) {
            return back()
                ->withInput()
                ->withErrors(['error' => 'Error al crear el inventario: ' . $e->getMessage()]);
        }
    }

    /**
     * Mostrar un inventario con sus cajas.
     */
    public function show(Inventario $inventario)
    {
        // Resumen de totales
        $resumen = [
            'total_cajas' => $inventario->cajas()->count(),
            'total_peso'  => number_format($inventario->cajas()->sum('peso'), 2, '.', ''),
        ];

        // Retornar vista React con Inertia
        return Inertia::render('Inventarios/Show', [
            'inventarioId' => $inventario->id,
            'nombre' => $inventario->nombre,
            'descripcion' => $inventario->descripcion,
            'cajas'        => $inventario->cajas()->get(),
            'resumen'      => $resumen,
            'flash' => session('flash'), // Para mensajes flash
        ]);
    }

    /**
     * Vista de prueba.
     */
    public function prueba()
    {
        return Inertia::render('Inventarios/Prueba');
    }

    public function exportPdf(Inventario $inventario)
    {
        $cajas = $inventario->cajas()->get();

        $resumen = [
            'total_cajas' => $cajas->count(),
            'total_peso'  => number_format($cajas->sum('peso'), 2, '.', ''),
        ];

        // Resumen por tipo de producto
        $resumenPorTipo = $cajas->groupBy('tipo_producto')->map(function($items, $tipo) {
            $totalPeso = $items->sum('peso');
            $totalCajas = $items->count();

            return [
                'tipo_producto' => $tipo,
                'total_cajas'   => $totalCajas,
                'total_peso'    => number_format($totalPeso, 2, '.', ''),
            ];
        });


        $pdf = Pdf::loadView('pdf.inventario', [
            'inventario' => $inventario,
            'cajas'      => $cajas,
            'resumen'    => $resumen,
            'resumenPorTipo'=> $resumenPorTipo,
        ])->setPaper('a4', 'landscape');

        return $pdf->stream("Inventario_{$inventario->id}.pdf");
    }

    /**
     * Terminar inventario (poner activo = false)
     */
    public function terminar(Inventario $inventario)
    {
        try {
            $inventario->update(['activo' => false]);

            return response()->json([
                'success' => true,
                'message' => "Inventario '{$inventario->nombre}' terminado exitosamente"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al terminar el inventario: ' . $e->getMessage()
            ], 500);
        }
    }
    public function reactivar(Inventario $inventario)
    {
        try {
            $inventario->update(['activo' => true]);

            return response()->json([
                'success' => true,
                'message' => "Inventario '{$inventario->nombre}' reactivado exitosamente"
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al reactivar el inventario: ' . $e->getMessage()
            ], 500);
        }
    }
    /**
     * Eliminar inventario completamente
     */
    public function destroy(Inventario $inventario)
    {
        try {
            // Verificar si tiene cajas
            $totalCajas = $inventario->cajas()->count();

            if ($totalCajas > 0) {
                return response()->json([
                    'success' => false,
                    'message' => "No se puede eliminar el inventario porque tiene {$totalCajas} caja(s) registrada(s). Primero elimina todas las cajas."
                ], 400);
            }

            $inventario->delete();

            return response()->json([
                'success' => true,
                'message' => 'Inventario eliminado exitosamente'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Error al eliminar el inventario: ' . $e->getMessage()
            ], 500);
        }
    }

}
