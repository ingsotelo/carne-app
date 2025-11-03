<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Inventario {{ $inventario->id }}</title>
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 12px; }
        h2, h3 { margin: 0; padding: 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 15px; }
        th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
        th { background: #f2f2f2; }
        .section { margin-top: 20px; }
    </style>
</head>
<body>
    <h2>Inventario: {{ $inventario->nombre }}</h2>
    <p>{{ $inventario->descripcion }}</p>

    <div class="section">
        <h3>Resumen General</h3>
        <p><strong>Total de cajas:</strong> {{ $resumen['total_cajas'] }}</p>
        <p><strong>Total peso:</strong> {{ $resumen['total_peso'] }} KG</p>
    </div>

    <div class="section">
        <h3>Resumen por Tipo de Producto</h3>
        <table>
            <thead>
                <tr>
                    <th>Tipo de Producto</th>
                    <th>Número de Cajas</th>
                    <th>Peso Total KG</th>
                </tr>
            </thead>
            <tbody>
                @foreach($resumenPorTipo as $tipo)
                    <tr>
                        <td>{{ $tipo['tipo_producto'] }}</td>
                        <td>{{ $tipo['total_cajas'] }}</td>
                        <td>{{ $tipo['total_peso'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <div class="section">
        <h3>Detalle de Cajas</h3>
        <table>
            <thead>
                <tr>
                    <th>#</th>
                    <th>Producto</th>
                    <th>Peso KG</th>
                    <th>Fecha Empaque</th>
                </tr>
            </thead>
            <tbody>
                @foreach($cajas as $i => $caja)
                    <tr>
                        <td>{{ $i + 1 }}</td>
                        <td>{{ $caja->tipo_producto }}</td>
                        <td>{{ number_format($caja->peso, 2, '.', '') }}</td>
                        <td>{{ \Carbon\Carbon::parse($caja->fecha_empaque)->format('Y-m-d') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    </div>
</body>
</html>
