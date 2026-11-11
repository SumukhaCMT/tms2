import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const subscriptions = [
  {
    organization: "ISKCON",
    plan: "Enterprise",
    amount: "₹25,000",
    expiry: "25 Dec 2026",
    status: "Active",
  },
  {
    organization: "Sai Temple",
    plan: "Basic",
    amount: "₹999",
    expiry: "10 Aug 2026",
    status: "Trial",
  },
  {
    organization: "Shiva Trust",
    plan: "Pro",
    amount: "₹4,999",
    expiry: "12 Jul 2026",
    status: "Expired",
  },
];

export default function RecentSubscriptions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Latest Subscriptions</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {subscriptions.map((sub) => (
          <div
            key={sub.organization}
            className="flex items-center justify-between border rounded-lg p-3"
          >
            <div>
              <h4 className="font-semibold">{sub.organization}</h4>

              <p className="text-sm text-muted-foreground">
                {sub.plan}
              </p>
            </div>

            <div className="text-right">
              <p className="font-semibold">{sub.amount}</p>

              <p className="text-xs text-muted-foreground">
                {sub.expiry}
              </p>
            </div>

            <Badge
              variant={
                sub.status === "Active"
                  ? "default"
                  : sub.status === "Trial"
                  ? "secondary"
                  : "destructive"
              }
            >
              {sub.status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}