<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VentaItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'venta_id',
        'producto_id',
        'descripcion_producto',
        'clave_producto',
        'codigo_barras',
        'peso_kg',
        'precio_kg',
        'total',
    ];

    protected $casts = [
        'peso_kg' => 'decimal:2',
        'precio_kg' => 'decimal:2',
        'total' => 'decimal:2',
    ];

    public function venta(): BelongsTo
    {
        return $this->belongsTo(Venta::class);
    }

    public function producto(): BelongsTo
    {
        return $this->belongsTo(Producto::class);
    }
}
