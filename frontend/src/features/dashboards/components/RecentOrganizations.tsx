import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const organizations = [
  {
    id: 1,
    name: "ISKCON Bangalore",
    owner: "Ramesh Kumar",
    plan: "Enterprise",
    temples: 18,
    status: "Active",
  },
  {
    id: 2,
    name: "Shiva Trust",
    owner: "Mahesh",
    plan: "Pro",
    temples: 8,
    status: "Trial",
  },
  {
    id: 3,
    name: "Sai Temple",
    owner: "Suresh",
    plan: "Basic",
    temples: 2,
    status: "Expired",
  },
  {
    id: 4,
    name: "Balaji Temple",
    owner: "Anil",
    plan: "Pro",
    temples: 6,
    status: "Active",
  },
];

export default function RecentOrganizations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Organizations</CardTitle>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Organization</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Temples</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {organizations.map((org) => (
              <TableRow key={org.id}>
                <TableCell className="font-medium">
                  {org.name}
                </TableCell>

                <TableCell>{org.owner}</TableCell>

                <TableCell>{org.plan}</TableCell>

                <TableCell>{org.temples}</TableCell>

                <TableCell>
                  <Badge
                    variant={
                      org.status === "Active"
                        ? "default"
                        : org.status === "Trial"
                        ? "secondary"
                        : "destructive"
                    }
                  >
                    {org.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}