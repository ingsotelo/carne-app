import { Head, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { route } from 'ziggy-js';

interface Producto {
  id: number;
  clave_producto: string;
  tipo_producto: string;
  precio_kg: string;
  longitud_codigo: number;
  pos_peso: number;
  libras: boolean;
  total_cajas: number;
  total_peso: string;
  costo_total: string;
}

interface FlashMessage {
  type: 'success' | 'error';
  message: string;
}

interface IndexProps {
  productos: Producto[];
  flash?: FlashMessage;
}

const emptyFormState = {
  clave_producto: '',
  tipo_producto: '',
  precio_kg: '',
  longitud_codigo: '',
  pos_peso: '',
  libras: false,
};

export default function ProductosIndex({ productos, flash }: IndexProps) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Producto | null>(null);

  const createForm = useForm({ ...emptyFormState });
  const editForm = useForm({ ...emptyFormState });

  useEffect(() => {
    if (!flash) return;

    if (flash.type === 'success') {
      toast.success(flash.message);
    } else if (flash.type === 'error') {
      toast.error(flash.message);
    }
  }, [flash]);

  const toggleCreateForm = () => {
    setShowCreateForm((prev) => !prev);
    createForm.reset();
    createForm.clearErrors();
  };

  const startEditing = (producto: Producto) => {
    setEditingProduct(producto);
    editForm.setData({
      clave_producto: producto.clave_producto,
      tipo_producto: producto.tipo_producto,
      precio_kg: producto.precio_kg,
      longitud_codigo: String(producto.longitud_codigo),
      pos_peso: String(producto.pos_peso),
      libras: producto.libras,
    });
    editForm.clearErrors();
  };

  const cancelEditing = () => {
    setEditingProduct(null);
    editForm.reset();
    editForm.clearErrors();
  };

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    createForm.post(route('productos.store'), {
      onSuccess: () => {
        setShowCreateForm(false);
        createForm.reset();
      },
    });
  };

  const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingProduct) return;

    editForm.put(route('productos.update', { producto: editingProduct.id }), {
      preserveScroll: true,
      onSuccess: () => {
        cancelEditing();
      },
    });
  };

  const handleDelete = (producto: Producto) => {
    if (
      !confirm(
        `¿Seguro que deseas eliminar el producto "${producto.tipo_producto}"? Esta acción no se puede deshacer.`,
      )
    ) {
      return;
    }

    router.delete(route('productos.destroy', { producto: producto.id }), {
      onError: () => {
        toast.error('No se pudo eliminar el producto. Intenta nuevamente.');
      },
    });
  };

  return (
    <AppLayout>
      <Head title="Productos" />

      <div className="p-6 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Productos
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Registra el precio por kilo y consulta el costo total por caja.
            </p>
          </div>

          <button
            onClick={toggleCreateForm}
            className="inline-flex items-center justify-center rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            {showCreateForm ? 'Cerrar formulario' : 'Nuevo producto'}
          </button>
        </div>

        {showCreateForm && (
          <section className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Registrar producto
            </h2>
            <form onSubmit={handleCreate} className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Clave de producto
                </label>
                <input
                  type="text"
                  value={createForm.data.clave_producto}
                  onChange={(event) =>
                    createForm.setData('clave_producto', event.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Ej. 01357073"
                />
                {createForm.errors.clave_producto && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.errors.clave_producto}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Tipo de producto
                </label>
                <input
                  type="text"
                  value={createForm.data.tipo_producto}
                  onChange={(event) =>
                    createForm.setData('tipo_producto', event.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Descripción del producto"
                />
                {createForm.errors.tipo_producto && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.errors.tipo_producto}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Precio por kilo
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={createForm.data.precio_kg}
                  onChange={(event) => createForm.setData('precio_kg', event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="0.00"
                />
                {createForm.errors.precio_kg && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.errors.precio_kg}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Longitud de código de barras
                </label>
                <input
                  type="number"
                  min="1"
                  value={createForm.data.longitud_codigo}
                  onChange={(event) =>
                    createForm.setData('longitud_codigo', event.target.value)
                  }
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Ej. 70"
                />
                {createForm.errors.longitud_codigo && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.errors.longitud_codigo}
                  </p>
                )}
              </div>

              <div className="col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Posici�n del peso dentro del c�digo
                </label>
                <input
                  type="number"
                  min="0"
                  value={createForm.data.pos_peso}
                  onChange={(event) => createForm.setData('pos_peso', event.target.value)}
                  className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
                  placeholder="Ej. 20"
                />
                {createForm.errors.pos_peso && (
                  <p className="mt-1 text-xs text-red-500">
                    {createForm.errors.pos_peso}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex items-start gap-3 rounded border border-gray-200 p-3 dark:border-gray-600">
                <input
                  id="create-libras"
                  type="checkbox"
                  checked={createForm.data.libras}
                  onChange={(event) => createForm.setData('libras', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-900"
                />
                <div>
                  <label htmlFor="create-libras" className="text-sm font-medium text-gray-700 dark:text-gray-200">
                    El peso se expresa en libras
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Activa esta opci�n si el c�digo de barras almacena el peso en libras.
                  </p>
                  {createForm.errors.libras && (
                    <p className="mt-1 text-xs text-red-500">
                      {createForm.errors.libras}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={createForm.processing}
                  className="rounded bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Guardar producto
                </button>
                <button
                  type="button"
                  onClick={toggleCreateForm}
                  className="rounded border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        {editingProduct && (
          <section className="rounded-lg border border-blue-200 bg-blue-50 p-6 shadow-sm dark:border-blue-500/40 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100">
                Editar producto: {editingProduct.tipo_producto}
              </h2>
              <button
                onClick={cancelEditing}
                className="text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
              >
                Cerrar
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100">
                  Clave de producto
                </label>
                <input
                  type="text"
                  value={editForm.data.clave_producto}
                  onChange={(event) =>
                    editForm.setData('clave_producto', event.target.value)
                  }
                  className="mt-1 w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/60 dark:bg-slate-950 dark:text-blue-100"
                />
                {editForm.errors.clave_producto && (
                  <p className="mt-1 text-xs text-rose-600">
                    {editForm.errors.clave_producto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100">
                  Tipo de producto
                </label>
                <input
                  type="text"
                  value={editForm.data.tipo_producto}
                  onChange={(event) => editForm.setData('tipo_producto', event.target.value)}
                  className="mt-1 w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/60 dark:bg-slate-950 dark:text-blue-100"
                />
                {editForm.errors.tipo_producto && (
                  <p className="mt-1 text-xs text-rose-600">
                    {editForm.errors.tipo_producto}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100">
                  Precio por kilo
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={editForm.data.precio_kg}
                  onChange={(event) => editForm.setData('precio_kg', event.target.value)}
                  className="mt-1 w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/60 dark:bg-slate-950 dark:text-blue-100"
                />
                {editForm.errors.precio_kg && (
                  <p className="mt-1 text-xs text-rose-600">
                    {editForm.errors.precio_kg}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100">
                  Longitud de código de barras
                </label>
                <input
                  type="number"
                  min="1"
                  value={editForm.data.longitud_codigo}
                  onChange={(event) => editForm.setData('longitud_codigo', event.target.value)}
                  className="mt-1 w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/60 dark:bg-slate-950 dark:text-blue-100"
                />
                {editForm.errors.longitud_codigo && (
                  <p className="mt-1 text-xs text-rose-600">
                    {editForm.errors.longitud_codigo}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-blue-900 dark:text-blue-100">
                  Posici�n del peso dentro del c�digo
                </label>
                <input
                  type="number"
                  min="0"
                  value={editForm.data.pos_peso}
                  onChange={(event) => editForm.setData('pos_peso', event.target.value)}
                  className="mt-1 w-full rounded border border-blue-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-blue-500/60 dark:bg-slate-950 dark:text-blue-100"
                />
                {editForm.errors.pos_peso && (
                  <p className="mt-1 text-xs text-rose-600">
                    {editForm.errors.pos_peso}
                  </p>
                )}
              </div>

              <div className="md:col-span-2 flex items-start gap-3 rounded border border-blue-200 p-3 dark:border-blue-500/60">
                <input
                  id="edit-libras"
                  type="checkbox"
                  checked={editForm.data.libras}
                  onChange={(event) => editForm.setData('libras', event.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-blue-200 text-blue-600 focus:ring-blue-500 dark:border-blue-500/60 dark:bg-slate-950"
                />
                <div>
                  <label htmlFor="edit-libras" className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    El peso se expresa en libras
                  </label>
                  <p className="text-xs text-blue-700/70 dark:text-blue-200/70">
                    Activa esta opci�n si el c�digo de barras almacena el peso en libras.
                  </p>
                  {editForm.errors.libras && (
                    <p className="mt-1 text-xs text-rose-600">
                      {editForm.errors.libras}
                    </p>
                  )}
                </div>
              </div>

              <div className="md:col-span-2 flex items-center gap-2">
                <button
                  type="submit"
                  disabled={editForm.processing}
                  className="rounded bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                >
                  Guardar cambios
                </button>
                <button
                  type="button"
                  onClick={cancelEditing}
                  className="rounded border border-blue-200 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-blue-500/60 dark:text-blue-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-x-auto rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Clave
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Tipo de producto
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Precio/Kg
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Longitud codigo
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Posicion peso
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Usa libras
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Cajas registradas
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Peso total (Kg)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Costo total
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white dark:divide-gray-700 dark:bg-gray-800">
              {productos.length === 0 ? (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-6 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Aún no hay productos registrados. Crea el primero usando el botón
                    "Nuevo producto".
                  </td>
                </tr>
              ) : (
                productos.map((producto) => (
                  <tr key={producto.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40">
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {producto.clave_producto}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      <div className="font-medium">{producto.tipo_producto}</div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      ${producto.precio_kg}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {producto.longitud_codigo}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {producto.pos_peso}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {producto.libras ? 'Si' : 'No'}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {producto.total_cajas}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-900 dark:text-gray-100">
                      {producto.total_peso} Kg
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                      ${producto.costo_total}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-900 dark:text-gray-100">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => startEditing(producto)}
                          className="rounded border border-blue-200 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-blue-500/60 dark:text-blue-200 dark:hover:bg-slate-800"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(producto)}
                          className="rounded border border-rose-200 px-3 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 focus:outline-none focus:ring-2 focus:ring-rose-400 dark:border-rose-500/60 dark:text-rose-300 dark:hover:bg-slate-800"
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </AppLayout>
  );
}
