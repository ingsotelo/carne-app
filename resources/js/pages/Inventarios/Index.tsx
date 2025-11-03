import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Package, Eye, Plus, CheckCircle, Trash2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { route } from 'ziggy-js';

interface Inventario {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  total_cajas: number;
  total_peso: string;
  created_at: string;
}

interface IndexProps {
  inventarios: Inventario[];
  flash?: {
    type: string;
    message: string;
  };
}

export default function Index({ inventarios, flash }: IndexProps) {

  useEffect(() => {
    if (flash) {
      if (flash.type === 'success') {
        toast.success(`✅ ${flash.message}`);
      } else if (flash.type === 'error') {
        toast.error(`❌ ${flash.message}`);
      }
    }
  }, [flash]);

  const handleTerminar = async (id: number, nombre: string) => {
    if (!confirm(`¿Seguro que deseas TERMINAR el inventario "${nombre}"? Se marcará como inactivo y no podra agregar mas cajas.`)) {
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(route('inventarios.terminar', { inventario: id }), {
        method: 'PATCH',
        headers: {
          'X-CSRF-TOKEN': csrf,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        toast.success('✅ Inventario terminado exitosamente');
        // Recargar la página después de un momento
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('❌ Error al terminar el inventario');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('❌ Error de conexión');
    }
  };

  const handleReactivar = async (id: number, nombre: string) => {
    if (!confirm(`¿Seguro que deseas REACTIVAR el inventario "${nombre}"?`)) {
        return;
    }

    try {
        const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        const res = await fetch(route('inventarios.reactivar', { inventario: id }), {
        method: 'PATCH',
        headers: {
            'X-CSRF-TOKEN': csrf,
            'Accept': 'application/json',
        },
        });

        if (res.ok) {
        toast.success('✅ Inventario reactivado exitosamente');
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        } else {
        toast.error('❌ Error al reactivar el inventario');
        }
    } catch (error: any) {
        console.error(error);
        toast.error('❌ Error de conexión');
    }
};

  const handleEliminar = async (id: number, nombre: string, totalCajas: number) => {
    if (totalCajas > 0) {
      toast.error(`❌ No se puede eliminar el inventario porque tiene ${totalCajas} caja(s) registrada(s). Elimina todas las cajas primero.`);
      return;
    }

    if (!confirm(`¿Seguro que deseas ELIMINAR COMPLETAMENTE el inventario "${nombre}"? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      const csrf = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
      const res = await fetch(route('inventarios.destroy', { inventario: id }), {
        method: 'DELETE',
        headers: {
          'X-CSRF-TOKEN': csrf,
          'Accept': 'application/json',
        },
      });

      if (res.ok) {
        toast.success('✅ Inventario eliminado exitosamente');
        // Recargar la página después de un momento
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        toast.error('❌ Error al eliminar el inventario');
      }
    } catch (error: any) {
      console.error(error);
      toast.error('❌ Error de conexión');
    }
  };

  return (
    <AppLayout>
      <Head title="Inventarios" />

      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Inventarios
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Gestiona los inventarios de cajas de carne
            </p>
          </div>
          <Link
            href="/inventarios/create"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Inventario
          </Link>
        </div>

        {inventarios.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
              No hay inventarios
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Crea tu primer inventario para comenzar.
            </p>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Cajas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Total Peso (KG)
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Creación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {inventarios.map((inventario) => (
                    <tr
                      key={inventario.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        #{inventario.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {inventario.nombre}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                          {inventario.descripcion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Package className="h-4 w-4 text-blue-500 mr-1" />
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {inventario.total_cajas}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 font-mono">
                        {inventario.total_peso}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {inventario.created_at}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/inventarios/${inventario.id}`}
                            className="inline-flex items-center px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded transition-colors"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            Ver
                          </Link>

                          {inventario.activo ? (
                            <button
                                onClick={() => handleTerminar(inventario.id, inventario.nombre)}
                                className="inline-flex items-center px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs font-medium rounded transition-colors"
                                title="Terminar inventario (marcar como inactivo)"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Terminar
                            </button>
                            ) : (
                            <button
                                onClick={() => handleReactivar(inventario.id, inventario.nombre)}
                                className="inline-flex items-center px-2 py-1 bg-green-600 hover:bg-green-700 text-white text-xs font-medium rounded transition-colors"
                                title="Reactivar inventario"
                            >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Reactivar
                            </button>
                            )}

                            <button
                                onClick={() => handleEliminar(inventario.id, inventario.nombre, inventario.total_cajas)}
                                disabled={inventario.total_cajas > 0}
                                className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded transition-colors ${
                                inventario.total_cajas > 0
                                    ? 'bg-gray-400 cursor-not-allowed text-white'
                                    : 'bg-red-600 hover:bg-red-700 text-white'
                                }`}
                                title={inventario.total_cajas > 0 ? 'No se puede eliminar mientras tenga cajas registradas' : 'Eliminar inventario completamente'}
                            >
                                <Trash2 className="h-3 w-3 mr-1" />
                                Eliminar
                                {inventario.total_cajas > 0 && (
                                <AlertTriangle className="h-3 w-3 ml-1" />
                                )}
                            </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {inventarios.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <strong>Resumen:</strong> {inventarios.length} inventario(s) activo(s) • {' '}
              {inventarios.reduce((total, inv) => total + inv.total_cajas, 0)} cajas totales • {' '}
              {inventarios.reduce((total, inv) => total + parseFloat(inv.total_peso), 0).toFixed(2)} KG totales
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
