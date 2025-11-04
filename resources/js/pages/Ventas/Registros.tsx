import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Head, router, useForm } from '@inertiajs/react';
import { FormEvent, useMemo, useState } from 'react';

interface VentaItem {
  id: number;
  descripcion_producto: string;
  clave_producto: string | null;
  codigo_barras: string | null;
  peso_kg: string;
  precio_kg: string;
  total: string;
}

interface VentaRecord {
  id: number;
  cliente_nombre: string;
  fecha_venta: string | null;
  items_count: number;
  total: string;
  items: VentaItem[];
}

interface Metrics {
  total_ventas: number;
  total_cajas: number;
  total_vendido: string;
}

interface Filters {
  cliente: string;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
}

interface RegistrosProps {
  ventas: VentaRecord[];
  metrics: Metrics;
  filters: Filters;
}

export default function VentasRegistros({ ventas, metrics, filters }: RegistrosProps) {
  const today = new Date().toISOString().slice(0, 10);

  const filtersForm = useForm({
    cliente: filters.cliente ?? '',
    fecha_inicio: filters.fecha_inicio ?? today,
    fecha_fin: filters.fecha_fin ?? today,
  });

  const [selectedVenta, setSelectedVenta] = useState<VentaRecord | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const formatInteger = (value: number | string) =>
    Number(value ?? 0).toLocaleString('en-US');

  const formatCurrency = (value: number | string) =>
    Number(value ?? 0).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const resumen = useMemo(
    () => [
      {
        label: 'Ventas registradas',
        value: formatInteger(metrics.total_ventas),
      },
      {
        label: 'Cajas vendidas',
        value: formatInteger(metrics.total_cajas),
      },
      {
        label: 'Total vendido',
        value: `$${formatCurrency(metrics.total_vendido)}`,
      },
    ],
    [metrics],
  );

  const openDetail = (venta: VentaRecord) => {
    setSelectedVenta(venta);
    setDetailOpen(true);
  };

  const closeDetail = (open: boolean) => {
    setDetailOpen(open);
    if (!open) {
      setSelectedVenta(null);
    }
  };

  const submitFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    filtersForm.get(route('ventas.registros'), {
      preserveState: true,
      preserveScroll: true,
    });
  };

  const resetFilters = () => {
    const currentDate = new Date().toISOString().slice(0, 10);

    filtersForm.setData({
      cliente: '',
      fecha_inicio: currentDate,
      fecha_fin: currentDate,
    });

    router.get(route('ventas.registros'), { fecha_inicio: currentDate, fecha_fin: currentDate }, { preserveScroll: true });
  };

  return (
    <AppLayout>
      <Head title="Registros de ventas" />

      <div className="space-y-8 p-6">
        <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <header className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Registros de ventas</h1>
              <p className="mt-1 text-gray-600 dark:text-gray-400">
                Consulta el historial completo de ventas y revisa el detalle de cada nota.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {resumen.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm dark:border-gray-700 dark:bg-gray-900/40"
                >
                  <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{metric.label}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-900 dark:text-gray-50">{metric.value}</p>
                </div>
              ))}
            </div>
          </header>

          <form onSubmit={submitFilters} className="mt-8 flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="cliente">Cliente</Label>
                <Input
                  id="cliente"
                  value={filtersForm.data.cliente}
                  onChange={(event) => filtersForm.setData('cliente', event.target.value)}
                  placeholder="Nombre del cliente"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_inicio">Fecha inicio</Label>
                <Input
                  id="fecha_inicio"
                  type="date"
                  value={filtersForm.data.fecha_inicio}
                  onChange={(event) => filtersForm.setData('fecha_inicio', event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="fecha_fin">Fecha fin</Label>
                <Input
                  id="fecha_fin"
                  type="date"
                  value={filtersForm.data.fecha_fin}
                  onChange={(event) => filtersForm.setData('fecha_fin', event.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" onClick={resetFilters}>
                Limpiar filtros
              </Button>
              <Button type="submit">Aplicar filtros</Button>
            </div>
          </form>

          <div className="mt-8 overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Cajas
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Total
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
                {ventas.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                    >
                      No se encontraron registros con los filtros seleccionados.
                    </td>
                  </tr>
                ) : (
                  ventas.map((venta, index) => (
                    <tr key={venta.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">{venta.cliente_nombre}</td>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                        {venta.fecha_venta ?? 'Sin definir'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                        {venta.items_count}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        ${formatCurrency(venta.total)}
                      </td>
                      <td className="px-4 py-3 text-right text-sm">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => openDetail(venta)}
                          >
                            Ver detalle
                          </Button>
                          <Button
                            asChild
                            variant="secondary"
                            size="sm"
                          >
                            <a
                              href={route('ventas.recibo', { venta: venta.id })}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ver recibo
                            </a>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <Dialog open={detailOpen} onOpenChange={closeDetail}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              Nota #{selectedVenta?.id ?? ''} - {selectedVenta?.cliente_nombre ?? ''}
            </DialogTitle>
            <DialogDescription>
              Fecha de venta: {selectedVenta?.fecha_venta ?? 'Sin definir'} | Total{' '}
              {selectedVenta ? `$${formatCurrency(selectedVenta.total)}` : '$0.00'}
            </DialogDescription>
          </DialogHeader>

          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/40">
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
                {selectedVenta?.items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{index + 1}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 dark:text-gray-100">{item.descripcion_producto}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">{item.peso_kg}</td>
                    <td className="px-4 py-2 text-right text-sm text-gray-900 dark:text-gray-100">${item.precio_kg}</td>
                    <td className="px-4 py-2 text-right text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ${item.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => closeDetail(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
