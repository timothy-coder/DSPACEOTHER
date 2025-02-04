// src/app/dashboard/ocde/page.js
import ORCIDList from '@/components/ORCIDList';
import DashboardLayout from '../../../components/DashboardLayout';
export default function ORCIDPage() {
  return (
    <div>
      <DashboardLayout>
        <ORCIDList />
      </DashboardLayout>
    </div>
  );
}