import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: React.ReactNode;
  change: string;
  color: string;
}

export default function StatCard({
  title,
  value,
  icon,
  change,
  color,
}: Props) {
  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      <CardContent className={`${color} text-white p-6`}>
        <div className="flex items-center justify-between">
          <div className="rounded-xl bg-white/20 p-3">
            {icon}
          </div>

          <div className="flex items-center gap-1 text-sm">
            <TrendingUp className="h-4 w-4" />
            {change}
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-sm opacity-90">
            {title}
          </h3>

          <h2 className="mt-2 text-3xl font-bold">
            {value}
          </h2>
        </div>
      </CardContent>
    </Card>
  );
}