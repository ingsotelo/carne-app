<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Caja extends Model
{
    use HasFactory;

    protected $fillable = [
        'codigo_barras',
        'tipo_producto',
        'peso',
        'fecha_empaque',
        'inventario_id',
    ];

    /**
     * Casts automáticos
     */
    protected $casts = [
        'fecha_empaque'   => 'date',
        'peso'            => 'float',
    ];

    /**
     * Relación con inventario
     */
    public function inventario()
    {
        return $this->belongsTo(Inventario::class);
    }
      /**
     * Accessor: devuelve fecha_empaque en formato YYYY-MM-DD
     */
    public function getFechaEmpaqueAttribute($value)
    {
        return $value ? Carbon::parse($value)->format('Y-m-d') : null;
    }
}

