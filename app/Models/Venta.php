<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasManyThrough;

class Venta extends Model
{
    use HasFactory;

    protected $fillable = [
        'cliente_nombre',
        'fecha_venta',
        'total',
    ];

    protected $casts = [
        'fecha_venta' => 'date',
        'total' => 'decimal:2',
    ];

    public function items(): HasMany
    {
        return $this->hasMany(VentaItem::class)->orderBy('id');
    }
}
