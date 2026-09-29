import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {NavLink } from "react-router-dom"
import {
  Building2,
  Package,
  CreditCard,


} from "lucide-react";
interface QuickAction {
  title: string
  url: string
  icon: React.ComponentType<{ className?: string }>
}
const actions : QuickAction[]= [
  { title: "Create New Insatance", icon: Building2,url:"/CreateOrganization" },
  { title: "Add New Modules", icon: Package,url:"/ManageModules" },
  { title: "Subscriptions", icon: CreditCard ,url:"/ManageModules"},
  
];

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="grid grid-cols-1 gap-3">
        {actions.map((action) => {
          const Icon = action.icon;

          return (
            <Button
              key={action.title}
              variant="outline"
              className="justify-start h-14"
            >
              <Icon className="mr-2 h-5 w-5" />
              <NavLink   to={action.url}>
              {action.title}
              </NavLink>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
}