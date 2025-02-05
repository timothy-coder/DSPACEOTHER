// src/app/dashboard/cargarexcel/page.js
import CargarExcel from '@/components/CargarExcel';
import DashboardLayout from '../../../components/DashboardLayout';
export default function CargarExcelPage() {
  return (
    <div>
      <DashboardLayout>
        <CargarExcel />
      </DashboardLayout>
    </div>
  );
}