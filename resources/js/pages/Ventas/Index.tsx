import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';

export default function VentasIndex() {
  return (
    <AppLayout>
      <Head title="Ventas" />

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Ventas
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Sistema de ventas de cajas de carne (próximamente)
        </p>
      </div>
    </AppLayout>
  );
}
