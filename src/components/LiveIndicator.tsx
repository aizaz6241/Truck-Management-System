import React from "react";

export default function LiveIndicator() {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 bg-green-50 rounded-full border border-green-100"
      title="Dashboard auto-refreshes every 2 minutes"
    >
      <div className="relative flex h-3 w-3">
        <span className="animate-ripple absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </div>
      <span className="text-xs font-semibold text-green-700">Live Data</span>
    </div>
  );
}
