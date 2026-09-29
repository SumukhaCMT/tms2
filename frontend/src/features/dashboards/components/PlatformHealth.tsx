import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";

const health = [
  {
    name: "API",
    value: 98,
  },
  {
    name: "Database",
    value: 100,
  },
  {
    name: "Storage",
    value: 82,
  },
  {
    name: "CPU",
    value: 45,
  },
];

export default function PlatformHealth() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Health</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {health.map((item) => (
          <div key={item.name}>
            <div className="flex justify-between text-sm mb-2">
              <span>{item.name}</span>
              <span>{item.value}%</span>
            </div>

            <Progress value={item.value} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}