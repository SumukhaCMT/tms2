import { Outlet } from "react-router-dom";

export default function Tokens() {
  return (
    <div className="w-full space-y-6">
      <Outlet />
    </div>
  );
}