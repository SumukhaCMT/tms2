// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// import { Progress } from "@/components/ui/progress";

// const health = [
//   {
//     name: "API",
//     value: 98,
//   },
//   {
//     name: "Database",
//     value: 100,
//   },
//   {
//     name: "Storage",
//     value: 82,
//   },
//   {
//     name: "CPU",
//     value: 45,
//   },
// ];

// export default function PlatformHealth() {
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Platform Health</CardTitle>
//       </CardHeader>

//       <CardContent className="space-y-5">
//         {health.map((item) => (
//           <div key={item.name}>
//             <div className="flex justify-between text-sm mb-2">
//               <span>{item.name}</span>
//               <span>{item.value}%</span>
//             </div>

//             <Progress value={item.value} />
//           </div>
//         ))}
//       </CardContent>
//     </Card>
//   );
// }


import { useEffect, useState } from "react";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Progress } from "@/components/ui/progress";
import { API_URL } from "@/axios/axios";

type Status = "checking" | "connected" | "disconnected";

interface HealthItem {
  name: string;
  status: Status;
  detail: string;
}

const API_BASE_URL = API_URL.replace(/\/api\/?$/, "");

export default function PlatformHealth() {
  const [health, setHealth] = useState<HealthItem[]>([
    {
      name: "API",
      status: "checking",
      detail: "Checking backend...",
    },
    {
      name: "Database",
      status: "checking",
      detail: "Checking MySQL connection...",
    },
  ]);

  const [lastChecked, setLastChecked] = useState<string>("—");

  useEffect(() => {
    let active = true;

    const checkHealth = async () => {
      const results: HealthItem[] = [];

      // Check backend
      try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const result = await response.json();

        results.push({
          name: "API",
          status: response.ok ? "connected" : "disconnected",
          detail: response.ok
            ? result.message ?? "Backend is running"
            : "Backend health check failed",
        });
      } catch {
        results.push({
          name: "API",
          status: "disconnected",
          detail: "Backend is unreachable",
        });
      }

      // Check database connectivity
      try {
        const response = await fetch(
          `${API_BASE_URL}/databaseconnectivity`,
        );

        const result = await response.json();

        const connected = response.ok && result.success === true;

        results.push({
          name: "Database",
          status: connected ? "connected" : "disconnected",
          detail: result.message ?? (
            connected
              ? "Database connection successful"
              : "Database connection failed"
          ),
        });
      } catch {
        results.push({
          name: "Database",
          status: "disconnected",
          detail: "Unable to check database connection",
        });
      }

      if (active) {
        setHealth(results);
        setLastChecked(new Date().toLocaleString());
      }
    };

    void checkHealth();

    const timer = window.setInterval(() => {
      void checkHealth();
    }, 30_000);

    return () => {
      active = false;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Platform Health</CardTitle>
      </CardHeader>

      <CardContent className="space-y-5">
        {health.map((item) => {
          const connected = item.status === "connected";
          const checking = item.status === "checking";

          return (
            <div key={item.name}>
              <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                <span>{item.name}</span>

                <span
                  className={
                    connected
                      ? "font-medium text-green-600"
                      : checking
                        ? "font-medium text-yellow-600"
                        : "font-medium text-red-600"
                  }
                >
                  {connected
                    ? "Connected"
                    : checking
                      ? "Checking..."
                      : "Disconnected"}
                </span>
              </div>

              <Progress
                value={checking ? 50 : connected ? 100 : 0}
              />

              <p className="mt-1 text-xs text-muted-foreground">
                {item.detail}
              </p>
            </div>
          );
        })}

        <div className="border-t pt-3 text-xs text-muted-foreground">
          Auto-refresh: Every 30 seconds
          <br />
          Last checked: {lastChecked}
        </div>
      </CardContent>
    </Card>
  );
}