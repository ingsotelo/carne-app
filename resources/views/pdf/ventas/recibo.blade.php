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
            margin: 32px;
        }

        h1 {
            font-size: 20px;
            margin-bottom: 8px;
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
    <h1>Nota de venta</h1>

    <div class="meta">
        <p><strong>Cliente:</strong> {{ $venta->cliente_nombre }}</p>
        <p><strong>Fecha:</strong> {{ optional($venta->fecha_venta)->format('d/m/Y') }}</p>
        <p><strong>Nota:</strong> #{{ $venta->id }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th>#</th>
                <th>Descripcion</th>
                <th>Peso (Kg)</th>
                <th>Precio/Kg</th>
                <th>Total caja</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($venta->items as $index => $item)
                <tr>
                    <td>{{ $index + 1 }}</td>
                    <td>
                        {{ $item->descripcion_producto }}
                        @if($item->codigo_barras)
                            <br><small>Codigo: {{ $item->codigo_barras }}</small>
                        @endif
                    </td>
                    <td>{{ number_format((float) $item->peso_kg, 2) }}</td>
                    <td>${{ number_format((float) $item->precio_kg, 2) }}</td>
                    <td>${{ number_format((float) $item->total, 2) }}</td>
                </tr>
            @endforeach
        </tbody>
        <tfoot>
            <tr>
                <td colspan="4" style="text-align: right;">Total nota de venta</td>
                <td>${{ number_format((float) $venta->total, 2) }}</td>
            </tr>
        </tfoot>
    </table>
</body>
</html>
