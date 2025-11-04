import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface VentaItem {
  id: number;
  producto_id: number | null;
  descripcion_producto: string;
  clave_producto: string | null;
  codigo_barras: string | null;
  peso_kg: string;
  precio_kg: string;
  total: string;
}

interface Venta {
  id: number;
  cliente_nombre: string;
  fecha_venta: string | null;
  total: string;
  items: VentaItem[];
}

interface ProductoOption {
  id: number;
  clave_producto: string;
  tipo_producto: string;
  precio_kg: string;
}

interface FlashMessage {
  type: 'success' | 'error';
  message: string;
}

interface IndexProps {
  ventaReciente: Venta | null;
  productos: ProductoOption[];
  flash?: FlashMessage;
}

interface FormItem {
  producto_id: number | null;
  descripcion_producto: string;
  clave_producto: string;
  codigo_barras: string;
  peso_kg: string;
  precio_kg: string;
}

const emptySaleItem: FormItem = {
  producto_id: null,
  descripcion_producto: '',
  clave_producto: '',
  codigo_barras: '',
  peso_kg: '',
  precio_kg: '',
};

const getToday = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offset * 60000);
  return local.toISOString().slice(0, 10);
};

const today = getToday();

export default function VentasIndex({ ventaReciente, productos, flash }: IndexProps) {
  const saleForm = useForm({
    cliente_nombre: '',
    fecha_venta: today,
    items: [] as FormItem[],
  });

  const [items, setItems] = useState<FormItem[]>([]);
  const [manualItem, setManualItem] = useState<FormItem>({ ...emptySaleItem });
  const [scanCode, setScanCode] = useState('');
  const [scanProcessing, setScanProcessing] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);
  const [editingVentaId, setEditingVentaId] = useState<number | null>(null);

  useEffect(() => {
    if (!flash) return;

    if (flash.type === 'success') {
      toast.success(flash.message);
    } else if (flash.type === 'error') {
      toast.error(flash.message);
    }
  }, [flash]);

  useEffect(() => {
    saleForm.setData('items', items);
  }, [items]);

  useEffect(() => {
    scanInputRef.current?.focus();
  }, []);

  const itemsErrors = useMemo(() => {
    return Object.entries(saleForm.errors)
      .filter(([key]) => key.startsWith('items.'))
      .map(([, value]) => value);
  }, [saleForm.errors]);

  const noteTotal = useMemo(() => {
    return items.reduce((sum, item) => {
      const peso = parseFloat(item.peso_kg || '0');
      const precio = parseFloat(item.precio_kg || '0');
      if (Number.isNaN(peso) || Number.isNaN(precio)) {
        return sum;
      }
      return sum + peso * precio;
    }, 0);
  }, [items]);

  const handleManualProductChange = (productId: string) => {
    if (!productId) {
      setManualItem((previous) => ({
        ...previous,
        producto_id: null,
        descripcion_producto: '',
        clave_producto: '',
        precio_kg: '',
      }));
      return;
    }

    const selected = productos.find((product) => String(product.id) === productId);

    if (!selected) return;

    setManualItem((previous) => ({
      ...previous,
      producto_id: selected.id,
      descripcion_producto: selected.tipo_producto,
      clave_producto: selected.clave_producto ?? '',
      precio_kg: selected.precio_kg,
    }));
  };

  const pushItem = (item: FormItem) => {
    setItems((previous) => [...previous, item]);
    saleForm.clearErrors();
  };

  const handleManualAdd = () => {
    if (!manualItem.descripcion_producto.trim()) {
      toast.error('Captura una descripcion de producto.');
      return;
    }

    if (!manualItem.peso_kg || parseFloat(manualItem.peso_kg) <= 0) {
      toast.error('El peso debe ser mayor a cero.');
      return;
    }

    const formattedItem: FormItem = {
      producto_id: manualItem.producto_id,
      descripcion_producto: manualItem.descripcion_producto.trim(),
      clave_producto: manualItem.clave_producto.trim(),
      codigo_barras: manualItem.codigo_barras.trim(),
      peso_kg: parseFloat(manualItem.peso_kg).toFixed(2),
      precio_kg: manualItem.precio_kg ? parseFloat(manualItem.precio_kg).toFixed(2) : '0.00',
    };

    pushItem(formattedItem);
    setManualItem({ ...emptySaleItem });
  };

  const handleScanSubmit = async () => {
    if (!scanCode.trim()) {
      toast.error('Escanea o captura un codigo de barras primero.');
      scanInputRef.current?.focus();
      return;
    }

    if (scanProcessing) {
      return;
    }

    setScanProcessing(true);

    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '';
      const response = await fetch(route('ventas.scan'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-CSRF-TOKEN': csrfToken,
          'X-Requested-With': 'XMLHttpRequest',
        },
        body: JSON.stringify({
          codigo_barras: scanCode.trim(),
        }),
      });

      const payload = await response.json();

      if (!response.ok || payload.error) {
        throw new Error(payload.message || 'No se pudo interpretar el codigo.');
      }

      const result = payload.payload;

      pushItem({
        producto_id: result.producto_id ?? null,
        descripcion_producto: result.descripcion_producto ?? 'Producto detectado',
        clave_producto: result.clave_producto ?? '',
        codigo_barras: result.codigo_barras ?? '',
        peso_kg: Number(result.peso_kg ?? 0).toFixed(2),
        precio_kg: Number(result.precio_kg ?? 0).toFixed(2),
      });

      toast.success('Producto agregado desde el codigo de barras.');
      setScanCode('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo agregar el producto.';
      toast.error(message);
    } finally {
      setScanProcessing(false);
      scanInputRef.current?.focus();
    }
  };

  const removeItem = (index: number) => {
    setItems((previous) => previous.filter((_, idx) => idx !== index));
  };

  const resetSale = () => {
    saleForm.reset();
    saleForm.setData({
      cliente_nombre: '',
      fecha_venta: getToday(),
      items: [],
    });
    setItems([]);
    setManualItem({ ...emptySaleItem });
    setScanCode('');
    setEditingVentaId(null);
    saleForm.clearErrors();
    scanInputRef.current?.focus();
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (items.length === 0) {
      toast.error('Agrega al menos una caja a la venta.');
      return;
    }

    const callbacks = {
      preserveScroll: true,
      onSuccess: () => {
        toast.success(editingVentaId ? 'Venta actualizada correctamente.' : 'Venta registrada correctamente.');
        resetSale();
      },
    };

    if (editingVentaId) {
      saleForm.put(route('ventas.update', { venta: editingVentaId }), callbacks);
    } else {
      saleForm.post(route('ventas.store'), callbacks);
    }
  };

  const handleEditVenta = (venta: Venta) => {
    setEditingVentaId(venta.id);
    saleForm.setData({
      cliente_nombre: venta.cliente_nombre,
      fecha_venta: venta.fecha_venta ?? getToday(),
      items: [],
    });

    const mappedItems = venta.items.map<FormItem>((item) => ({
      producto_id: item.producto_id ?? null,
      descripcion_producto: item.descripcion_producto,
      clave_producto: item.clave_producto ?? '',
      codigo_barras: item.codigo_barras ?? '',
      peso_kg: Number(item.peso_kg || 0).toFixed(2),
      precio_kg: Number(item.precio_kg || 0).toFixed(2),
    }));

    setItems(mappedItems);
    saleForm.setData('items', mappedItems);
    setManualItem({ ...emptySaleItem });
    setScanCode('');
    saleForm.clearErrors();
    scanInputRef.current?.focus();
  };

  const handleDeleteVenta = (venta: Venta) => {
    if (!confirm(`Deseas eliminar la nota de venta #${venta.id}? Esta accion no se puede deshacer.`)) {
      return;
    }

    router.delete(route('ventas.destroy', { venta: venta.id }), {
      preserveScroll: true,
      onSuccess: () => {
        toast.success('Venta eliminada correctamente.');
        if (editingVentaId === venta.id) {
          resetSale();
        }
      },
      onError: () => {
        toast.error('No se pudo eliminar la venta. Intenta nuevamente.');
      },
    });
  };

  const renderItemTotal = (item: FormItem) => {
    const peso = parseFloat(item.peso_kg || '0');
    const precio = parseFloat(item.precio_kg || '0');
    const total = peso * precio;
    if (!Number.isFinite(total)) return '0.00';

    return total.toFixed(2);
  };

  return (
    <AppLayout>
      <Head title="Ventas" />

      <div className="space-y-8 p-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <header className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Registrar venta</h1>
            <p className="mt-1 text-gray-600 dark:text-gray-400">
              Agrega cajas manualmente o a partir de su codigo de barras para generar una nota de venta.
            </p>
          </header>

          {editingVentaId && (
            <div className="rounded border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/60 dark:bg-amber-900/30 dark:text-amber-200">
              Editando la nota #{editingVentaId}. Ajusta los datos y presiona Guardar cambios para actualizarla.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Cliente</label>
                <input
                  type="text"
                  value={saleForm.data.cliente_nombre}
                  onChange={(event) => saleForm.setData('cliente_nombre', event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Nombre o razon social"
                />
                {saleForm.errors.cliente_nombre && (
                  <p className="mt-1 text-xs text-red-500">{saleForm.errors.cliente_nombre}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Fecha de venta</label>
                <input
                  type="date"
                  value={saleForm.data.fecha_venta}
                  onChange={(event) => saleForm.setData('fecha_venta', event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                />
                {saleForm.errors.fecha_venta && (
                  <p className="mt-1 text-xs text-red-500">{saleForm.errors.fecha_venta}</p>
                )}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <section className="space-y-3 rounded border border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Agregar por codigo de barras</h2>
                <div className="flex flex-col gap-2 md:flex-row">
                  <input
                    ref={scanInputRef}
                    type="text"
                    value={scanCode}
                    onChange={(event) => setScanCode(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        handleScanSubmit();
                      }
                    }}
                    autoFocus
                    className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    placeholder="Escanea o escribe el codigo de barras"
                  />
                  <button
                    type="button"
                    onClick={handleScanSubmit}
                    disabled={scanProcessing}
                    className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {scanProcessing ? 'Agregando...' : 'Agregar caja'}
                  </button>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  El sistema calcula el peso con base en la configuracion del producto registrado.
                </p>
              </section>

              <section className="space-y-3 rounded border border-gray-200 p-4 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Agregar manualmente</h2>
                <div className="grid gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Producto</label>
                    <select
                      value={manualItem.producto_id ?? ''}
                      onChange={(event) => handleManualProductChange(event.target.value)}
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                    >
                      <option value="">Selecciona un producto (opcional)</option>
                      {productos.map((producto) => (
                        <option key={producto.id} value={producto.id}>
                          {producto.tipo_producto}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Descripcion</label>
                    <input
                      type="text"
                      value={manualItem.descripcion_producto}
                      onChange={(event) =>
                        setManualItem((previous) => ({
                          ...previous,
                          descripcion_producto: event.target.value,
                        }))
                      }
                      className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                      placeholder="Descripcion del producto"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Peso (Kg)</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualItem.peso_kg}
                        onChange={(event) =>
                          setManualItem((previous) => ({
                            ...previous,
                            peso_kg: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Precio/Kg</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={manualItem.precio_kg}
                        onChange={(event) =>
                          setManualItem((previous) => ({
                            ...previous,
                            precio_kg: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Clave (opcional)
                      </label>
                      <input
                        type="text"
                        value={manualItem.clave_producto}
                        onChange={(event) =>
                          setManualItem((previous) => ({
                            ...previous,
                            clave_producto: event.target.value,
                          }))
                        }
                        className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                        placeholder="Clave interna"
                      />
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleManualAdd}
                    className="rounded bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                  >
                    Agregar a la nota
                  </button>
                </div>
              </section>
            </div>

            <section className="rounded border border-gray-200 dark:border-gray-700">
              <header className="flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-700 dark:bg-gray-900/60">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-300">
                    Cajas agregadas
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Revisa la informacion antes de guardar la venta.
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Total: ${noteTotal.toFixed(2)}
                </span>
              </header>

              {itemsErrors.length > 0 && (
                <div className="border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/60 dark:bg-red-900/40 dark:text-red-200">
                  {itemsErrors.map((message, index) => (
                    <p key={index}>{message}</p>
                  ))}
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-900/60">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        #
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Producto
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Peso (Kg)
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Precio/Kg
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Total
                      </th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                    {items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                        >
                          Aun no agregas cajas a la nota de venta.
                        </td>
                      </tr>
                    ) : (
                      items.map((item, index) => (
                        <tr key={`${item.descripcion_producto}-${index}`}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                            {item.descripcion_producto}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">
                            {Number(item.peso_kg || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">
                            ${Number(item.precio_kg || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ${renderItemTotal(item)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">
                            <button
                              type="button"
                              onClick={() => removeItem(index)}
                              className="rounded border border-rose-300 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-slate-800"
                            >
                              Quitar
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                {items.length > 0 ? (
                  <>
                    <span className="font-semibold text-gray-900 dark:text-gray-100">{items.length}</span> cajas
                    capturadas - total de la nota{' '}
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      ${noteTotal.toFixed(2)}
                    </span>
                  </>
                ) : (
                  'Agrega productos para habilitar el guardado.'
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={resetSale}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Limpiar formulario
                </button>
                <button
                  type="submit"
                  disabled={saleForm.processing || items.length === 0}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  {saleForm.processing
                    ? 'Guardando...'
                    : editingVentaId
                      ? 'Guardar cambios'
                      : 'Guardar venta'}
                </button>
              </div>
            </div>
          </form>
        </section>

        <section className="space-y-4">
          <header>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Notas de venta registradas</h2>
            <p className="text-gray-600 dark:text-gray-400">
              Consulta el detalle de la ultima nota y continua trabajando sobre ella.
            </p>
          </header>

          {!ventaReciente ? (
            <div className="rounded border border-dashed border-gray-300 p-8 text-center text-gray-500 dark:border-gray-600 dark:text-gray-400">
              Aun no hay notas de venta registradas.
            </div>
          ) : (
            <div className="space-y-4">
              <article className="rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
                <header className="flex flex-col gap-2 border-b border-gray-200 px-4 py-3 dark:border-gray-700 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Nota #{ventaReciente.id} - {ventaReciente.cliente_nombre}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Fecha: {ventaReciente.fecha_venta ?? 'Sin definir'} | Total{' '}
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ${ventaReciente.total}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <a
                      href={route('ventas.recibo', { venta: ventaReciente.id })}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center rounded border border-blue-200 px-3 py-1 text-sm font-medium text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-blue-500/60 dark:text-blue-200 dark:hover:bg-slate-800"
                    >
                      Ver recibo
                    </a>
                    <button
                      type="button"
                      onClick={() => handleEditVenta(ventaReciente)}
                      className="rounded border border-amber-300 px-3 py-1 text-sm font-medium text-amber-700 hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-amber-500/60 dark:text-amber-300 dark:hover:bg-slate-800"
                    >
                      Editar venta
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteVenta(ventaReciente)}
                      className="rounded border border-rose-300 px-3 py-1 text-sm font-medium text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-500/60 dark:text-rose-300 dark:hover	bg-slate-800"
                    >
                      Borrar venta
                    </button>
                  </div>
                </header>

                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-900/60">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          #
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Producto
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Peso (Kg)
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Precio/Kg
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                      {ventaReciente.items.map((item, index) => (
                        <tr key={item.id}>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">
                            {item.descripcion_producto}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">
                            {Number(item.peso_kg || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">
                            ${Number(item.precio_kg || 0).toFixed(2)}
                          </td>
                          <td className="px-4 py-2 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                            ${Number(item.total || 0).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </article>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}

