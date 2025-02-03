// src/app/dashboard/ocde/page.js
import OCDEList from '@/components/OCDEList';
import DashboardLayout from '../../../components/DashboardLayout';
export default function OCDEPage() {
  return (
    <div>
      <DashboardLayout>
        <OCDEList />
      </DashboardLayout>
    </div>
  );
}