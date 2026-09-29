import {
  Building2,
  Landmark,
  Users,
  IndianRupee,
} from "lucide-react";

import StatCard from "./StatCard";

export default function StatsCards() {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

      <StatCard
        title="Organizations"
        value="128"
        change="+12%"
        color="bg-gradient-to-r from-violet-600 to-indigo-600"
        icon={<Building2 className="h-7 w-7" />}
      />

      <StatCard
        title="Temples"
        value="1,248"
        change="+8%"
        color="bg-gradient-to-r from-emerald-600 to-green-500"
        icon={<Landmark className="h-7 w-7" />}
      />

      <StatCard
        title="Users"
        value="84,216"
        change="+16%"
        color="bg-gradient-to-r from-sky-600 to-cyan-500"
        icon={<Users className="h-7 w-7" />}
      />

      <StatCard
        title="Revenue"
        value="₹2.45 Cr"
        change="+24%"
        color="bg-gradient-to-r from-orange-500 to-red-500"
        icon={<IndianRupee className="h-7 w-7" />}
      />

    </div>
  );
}