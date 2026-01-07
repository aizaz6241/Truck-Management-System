"use client";

import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";
import Link from "next/link";

export default function DashboardCharts({
    trend7Days,
    trend30Days,
    trend1Year,
    todayTrips
}: {
    trend7Days: any[],
    trend30Days: any[],
    trend1Year: any[],
    todayTrips: any[]
}) {
    const [trendRange, setTrendRange] = useState<"7d" | "30d" | "1y">("7d");

    let data = trend7Days;
    if (trendRange === "30d") data = trend30Days;
    if (trendRange === "1y") data = trend1Year;

    return (
        <div style={{ marginTop: "2rem" }}>
            {/* Today's Trips Section */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                    <h3 style={{ margin: 0 }}>Today's Trips ({todayTrips.length})</h3>
                    <Link href="/admin/trips?date=" className="btn" style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}>View All</Link>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                    <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 0.5rem 0", color: "#666" }}>Total Trips</h4>
                        <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>{todayTrips.length}</p>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 0.5rem 0", color: "#666" }}>RVT Trips</h4>
                        <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--secondary-color)" }}>
                            {todayTrips.filter(t => t.vehicle.ownership === "RVT").length}
                        </p>
                    </div>
                    <div style={{ textAlign: "center", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                        <h4 style={{ margin: "0 0 0.5rem 0", color: "#666" }}>Taxi Trips</h4>
                        <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#e67e22" }}>
                            {todayTrips.filter(t => t.vehicle.ownership === "Taxi").length}
                        </p>
                    </div>
                </div>
            </div>

            {/* Trends Section */}
            <div className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", flexWrap: "wrap", gap: "1rem" }}>
                    <h3 style={{ margin: 0 }}>Trips Trend</h3>
                    <div style={{ display: "flex", gap: "0.5rem", backgroundColor: "#f0f0f0", padding: "0.25rem", borderRadius: "8px" }}>
                        <button
                            onClick={() => setTrendRange("7d")}
                            className="btn"
                            style={{
                                padding: "0.25rem 0.75rem",
                                fontSize: "0.875rem",
                                backgroundColor: trendRange === "7d" ? "white" : "transparent",
                                color: trendRange === "7d" ? "var(--primary-color)" : "#666",
                                boxShadow: trendRange === "7d" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                border: "none"
                            }}
                        >
                            7 Days
                        </button>
                        <button
                            onClick={() => setTrendRange("30d")}
                            className="btn"
                            style={{
                                padding: "0.25rem 0.75rem",
                                fontSize: "0.875rem",
                                backgroundColor: trendRange === "30d" ? "white" : "transparent",
                                color: trendRange === "30d" ? "var(--primary-color)" : "#666",
                                boxShadow: trendRange === "30d" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                border: "none"
                            }}
                        >
                            30 Days
                        </button>
                        <button
                            onClick={() => setTrendRange("1y")}
                            className="btn"
                            style={{
                                padding: "0.25rem 0.75rem",
                                fontSize: "0.875rem",
                                backgroundColor: trendRange === "1y" ? "white" : "transparent",
                                color: trendRange === "1y" ? "var(--primary-color)" : "#666",
                                boxShadow: trendRange === "1y" ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
                                border: "none"
                            }}
                        >
                            1 Year
                        </button>
                    </div>
                </div>

                <div style={{ height: "300px", width: "100%" }}>
                    <ResponsiveContainer width="100%" height="100%">
                        {trendRange === "1y" || trendRange === "30d" ? (
                            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary-color)" stopOpacity={0.8} />
                                        <stop offset="95%" stopColor="var(--primary-color)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey={trendRange === "1y" ? "name" : "date"}
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    tickFormatter={(val) => {
                                        if (trendRange === "1y") return val;
                                        const d = new Date(val);
                                        return `${d.getDate()}/${d.getMonth() + 1}`;
                                    }}
                                />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} />
                                <Tooltip
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    labelFormatter={(label) => {
                                        if (trendRange === "1y") return label;
                                        return new Date(label).toLocaleDateString();
                                    }}
                                />
                                <Area type="monotone" dataKey="count" stroke="var(--primary-color)" fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        ) : (
                            <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    axisLine={false}
                                    tick={{ fontSize: 12, fill: '#666' }}
                                    tickFormatter={(val) => {
                                        const d = new Date(val);
                                        return ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"][d.getDay()];
                                    }}
                                />
                                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#666' }} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: '#f5f5f5' }}
                                    contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    labelFormatter={(label) => new Date(label).toDateString()}
                                />
                                <Bar dataKey="count" fill="var(--primary-color)" radius={[4, 4, 0, 0]} maxBarSize={50} />
                            </BarChart>
                        )}
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
