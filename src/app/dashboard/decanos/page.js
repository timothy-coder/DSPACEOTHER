// src/app/dashboard/decanos/page.js
import DashboardLayout from '../../../components/DashboardLayout';
import DecanosList from '../../../components/DecanosList';

export default function DecanosPage() {
  return (
    <DashboardLayout>
      <DecanosList />
    </DashboardLayout>
  );
}