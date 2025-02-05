// src/app/dashboard/decanos/page.js
import DashboardLayout from '../../../components/DashboardLayout';
import InvestigacionesList from '../../../components/InvestigacionesList';

export default function DecanosPage() {
  return (
    <DashboardLayout>
      <InvestigacionesList/>
    </DashboardLayout>
  );
}