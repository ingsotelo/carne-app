<?php

namespace App\Http\Controllers;

use App\Models\Caja;
use App\Models\Inventario;
use App\Services\CodigoBarrasService;
use Illuminate\Http\Request;
use Carbon\Carbon;


class CajaController extends Controller
{
    protected $codigoBarrasService;

    public function __construct(CodigoBarrasService $codigoBarrasService)
    {
        $this->codigoBarrasService = $codigoBarrasService;
    }

    /**
     * Registrar una nueva caja escaneada en un inventario.
     */
    public function store(Request $request, Inventario $inventario)
    {

        $validated = $request->validate([
            'codigo_barras' => 'required|string|min:6',
        ]);

        $codigo = $validated['codigo_barras'];

        $parsed = $this->codigoBarrasService->parse($codigo);

        if (!empty($parsed['error'])) {
            return response()->json([
                'success' => false,
                'mensaje' => $parsed['mensaje'] ?? 'No fue posible interpretar el codigo de barras.',
                'codigo_error' => $parsed['codigo_error'] ?? null,
                'detalle' => $parsed['detalle'] ?? null,
            ], 422);
        }

       // Validar duplicado
        if (Caja::where('codigo_barras', $codigo)
            ->where('inventario_id', $inventario->id)
            ->exists()
        ) {
            return response()->json([
                'success' => false,
                'mensaje' => 'La caja ya fue registrada en este inventario',
            ], 409);
        }

        try {
            // Guardar en BD
            $caja = new Caja();
            $caja->codigo_barras   = $codigo.$inventario->cajas()->count();
            $caja->tipo_producto   = $parsed['producto'];
            $caja->peso            = (float) $parsed['peso_kg'];
            $caja->fecha_empaque   = Carbon::parse($parsed['fecha_empaque']);
            $caja->inventario_id   = $inventario->id;
            $caja->save();

            // 🔹 Recalcular resumen del inventario
            $resumen = [
                'total_cajas' => $inventario->cajas()->count(),
                'total_peso'  => number_format($inventario->cajas()->sum('peso'), 2, '.', ''), // 2 decimales,
            ];
            return response()->json([
                'success' => true,
                'caja'    => $caja,
                'resumen' => $resumen,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage(),
            ], 500);
        }
    }

    public function destroy(Inventario $inventario, Caja $caja)
    {
        try {
            // Validar que la caja pertenezca al inventario
            if ($caja->inventario_id !== $inventario->id) {
                return response()->json([
                    'success' => false,
                    'mensaje' => 'La caja no pertenece a este inventario'. $caja->id . ' - ' . $inventario->id,
                ], 400);
            }

            $caja->delete();

            // Recalcular resumen
            $resumen = [
                'total_cajas' => $inventario->cajas()->count(),
                'total_peso'  => number_format($inventario->cajas()->sum('peso'), 2, '.', ''),
            ];

            return response()->json([
                'success' => true,
                'resumen' => $resumen
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'mensaje' => $e->getMessage(),
            ], 500);
        }
    }

}
