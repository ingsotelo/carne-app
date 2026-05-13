<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Nota de venta #{{ $venta->id }}</title>
    <style>
        body {
            font-family: "Helvetica Neue", Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #1f2937;
            margin: 10px 28px 28px;
        }

        h1 {
            font-size: 20px;
            margin-bottom: 8px;
        }

        .header {
            margin-bottom: 30px;
            min-height: 110px;
        }

        .logo {
            width: 120px;
            height: auto;
            display: block;
            float: right;
            margin: 0 0 12px 20px;
        }

        .meta {
            margin-bottom: 20px;
        }

        .meta p {
            margin: 2px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 18px;
        }

        th, td {
            border: 1px solid #d1d5db;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #f3f4f6;
            text-transform: uppercase;
            font-size: 11px;
        }

        tfoot td {
            font-weight: bold;
            background-color: #f9fafb;
        }
    </style>
</head>
<body>
    <div class="header">
        <img class="logo" src="{{ public_path('recibo.png') }}" alt="Logo">
        <h1>Nota de venta</h1>

        <div class="meta">
            <p><strong>Cliente:</strong> {{ $venta->cliente_nombre }}</p>
            <p><strong>Fecha:</strong> {{ optional($venta->fecha_venta)->format('d/m/Y') }}</p>
            <p><strong>Nota:</strong> #{{ $venta->id }}</p>
        </div>
    </div>

    @php
        $productosAgrupados = $venta->items
            ->groupBy('descripcion_producto')
            ->map(function ($items, $descripcion) {
                return [
                    'descripcion' => $descripcion,
                    'cajas' => $items->count(),
                    'peso_kg' => $items->sum(fn ($item) => (float) $item->peso_kg),
                    'precio_kg' => (float) $items->first()->precio_kg,
                    'importe' => $items->sum(fn ($item) => (float) $item->total),
                ];
            })
            ->values();
    @endphp

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Descripcion</th>
                <th>Cajas</th>
                <th>Peso (Kg)</th>
                <th>Precio/Kg</th>
                <th>Importe</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($productosAgrupados as $index => $producto)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>{{ $producto['descripcion'] }}</td>
                    <td>{{ $producto['cajas'] }}</td>
                    <td>{{ number_format($producto['peso_kg'], 2) }}</td>
                    <td>${{ number_format($producto['precio_kg'], 2) }}</td>
                    <td>${{ number_format($producto['importe'], 2) }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="5" style="text-align: right;">Total nota de venta</td>
                <td>${{ number_format((float) $venta->total, 2) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
