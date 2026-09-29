

import RecentOrganizations from "../components/RecentOrganizations";
import RecentSubscriptions from "../components/RecentSubscriptions";
import QuickActions from "../components/QuickActions";
import PlatformHealth from "../components/PlatformHealth";
import RecentPayments from "../components/RecentPayments";

export default function SuperAdminDashboard() {
 
  return (
    <>


    <div className="space-y-8">
      
  
      <div className="grid gap-6 lg:grid-cols-3">
  <QuickActions />

  <PlatformHealth />

  <RecentPayments />
</div>
      <div className="grid gap-6 lg:grid-cols-2">
          <RecentOrganizations />
          <RecentSubscriptions />
          
      </div>


      
    </div>
    </>
  );
}