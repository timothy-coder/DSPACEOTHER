// src/app/dashboard/decanos/page.js
import DashboardLayout from '../../../components/DashboardLayout';
import DecanosList from '../../../components/DECANOSList';

export default function DecanosPage() {
  return (
    <DashboardLayout>
      <DecanosList />
    </DashboardLayout>
  );
}