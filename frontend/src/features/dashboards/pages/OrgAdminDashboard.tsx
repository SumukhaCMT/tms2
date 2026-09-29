import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Building2, Users, IndianRupee, BarChart3 } from "lucide-react"

export default function SuperAdminDashboard() {
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div>
        <h2 className="text-2xl font-bold">Org Admin Dashboard</h2>
        <p className="text-sm text-muted-foreground">
          System-wide overview and analytics
        </p>
        
      </div>
      

      {/* STATS */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Total Temples"
          value="128"
          icon={<Building2 className="h-5 w-5" />}
        />
        <StatCard
          title="Total Users"
          value="8,420"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          title="Total Donations"
          value="₹12.6L"
          icon={<IndianRupee className="h-5 w-5" />}
        />
        <StatCard
          title="Reports Generated"
          value="342"
          icon={<BarChart3 className="h-5 w-5" />}
        />
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="temples">Temples</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Platform Overview</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This dashboard provides a complete overview of temples, users,
              donations, bookings, and system reports.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="temples">
          <Card>
            <CardHeader>
              <CardTitle>Temple Management</CardTitle>
            </CardHeader>
            <CardContent>
              • Add / edit temples  
              • Assign temple admins  
              • View temple-wise reports
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              • Manage users & roles  
              • Block / activate accounts  
              • View user activity
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Reports & Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              • Donation analytics  
              • Booking trends  
              • Export reports
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

/* 🔹 Reusable Stat Card */
function StatCard({
  title,
  value,
  icon,
}: {
  title: string
  value: string
  icon: React.ReactNode
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <div className="text-muted-foreground">{icon}</div>
      </CardHeader>
      <CardContent>
        
        <div className="text-2xl font-bold">{value}

        </div>
      </CardContent>
    </Card>
  )
}
