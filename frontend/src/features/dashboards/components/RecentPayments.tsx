import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";

const payments = [
  {
    organization: "ISKCON",
    amount: "₹25,000",
    method: "UPI",
    status: "Success",
  },
  {
    organization: "Sai Temple",
    amount: "₹999",
    method: "Card",
    status: "Pending",
  },
  {
    organization: "Shiva Trust",
    amount: "₹4,999",
    method: "Net Banking",
    status: "Success",
  },
];

export default function RecentPayments() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Payments</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.organization}
            className="flex items-center justify-between border rounded-lg p-3"
          >
            <div>
              <h4 className="font-semibold">{payment.organization}</h4>

              <p className="text-sm text-muted-foreground">
                {payment.method}
              </p>
            </div>

            <div className="text-right">
              <p className="font-bold">{payment.amount}</p>

              <Badge
                variant={
                  payment.status === "Success"
                    ? "default"
                    : "secondary"
                }
              >
                {payment.status}
              </Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}