"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, PieChart, Pie, Cell, Legend } from "recharts";
import Link from "next/link";
import { getPieStats, FilterType } from "@/actions/analytics";

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

    // Pie Chart State
    const [pieFilter, setPieFilter] = useState<FilterType>("today");
    const [customDate, setCustomDate] = useState(""); // For date, month, year inputs
    const [pieStats, setPieStats] = useState({
        rvt: todayTrips.filter(t => t.vehicle.ownership === "RVT").length,
        taxi: todayTrips.filter(t => t.vehicle.ownership === "Taxi").length,
        total: todayTrips.length
    });
    const [loadingPie, setLoadingPie] = useState(false);

    let data = trend7Days;
    if (trendRange === "30d") data = trend30Days;
    if (trendRange === "1y") data = trend1Year;

    useEffect(() => {
        async function fetchPieData() {
            setLoadingPie(true);
            try {
                if ((pieFilter === 'date' || pieFilter === 'month' || pieFilter === 'year') && !customDate) {
                    setLoadingPie(false);
                    return;
                }

                const stats = await getPieStats(pieFilter, customDate);
                setPieStats(stats);
            } catch (error) {
                console.error("Failed to fetch pie stats", error);
            } finally {
                setLoadingPie(false);
            }
        }

        fetchPieData();
    }, [pieFilter, customDate]);

    const pieData = [
        { name: 'RVT', value: pieStats.rvt },
        { name: 'Taxi', value: pieStats.taxi },
    ];

    const COLORS = ['var(--secondary-color)', '#e67e22'];

    return (
        <div style={{ marginTop: "2rem" }}>
            {/* Today's Trips Section */}
            <div className="card" style={{ marginBottom: "2rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
                    <h3 style={{ margin: 0 }}>
                        {pieFilter === 'today' ? "Today's Trips" : "Trips Distribution"} ({pieStats.total})
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                        <select
                            value={pieFilter}
                            onChange={(e) => {
                                setPieFilter(e.target.value as FilterType);
                                setCustomDate("");
                            }}
                            className="form-select"
                            style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", width: "auto" }}
                        >
                            <option value="today">Today</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                            <option value="6m">Last 6 Months</option>
                            <option value="1y">Last 1 Year</option>
                            <option value="date">Specific Date</option>
                            <option value="month">Specific Month</option>
                            <option value="year">Specific Year</option>
                        </select>

                        {pieFilter === 'date' && (
                            <input
                                type="date"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="form-input"
                                style={{ padding: "0.25rem", width: "auto", fontSize: "0.875rem" }}
                            />
                        )}
                        {pieFilter === 'month' && (
                            <input
                                type="month"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="form-input"
                                style={{ padding: "0.25rem", width: "auto", fontSize: "0.875rem" }}
                            />
                        )}
                        {pieFilter === 'year' && (
                            <input
                                type="number"
                                placeholder="Year"
                                value={customDate}
                                onChange={(e) => setCustomDate(e.target.value)}
                                className="form-input"
                                style={{ padding: "0.25rem", width: "100px", fontSize: "0.875rem" }}
                            />
                        )}

                        {pieFilter === 'today' && (
                            <Link href="/admin/trips?date=" className="btn" style={{ fontSize: "0.875rem", padding: "0.25rem 0.5rem" }}>View All</Link>
                        )}
                    </div>
                </div>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "2rem", alignItems: "center" }}>
                    {/* Left Column: Stats Cards */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem", flex: "1 1 300px", width: "100%" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                            <h4 style={{ margin: 0, color: "#666" }}>Total Trips</h4>
                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--primary-color)" }}>{loadingPie ? "..." : pieStats.total}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                            <h4 style={{ margin: 0, color: "#666" }}>RVT Trips</h4>
                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "var(--secondary-color)" }}>{loadingPie ? "..." : pieStats.rvt}</p>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
                            <h4 style={{ margin: 0, color: "#666" }}>Taxi Trips</h4>
                            <p style={{ margin: 0, fontSize: "1.5rem", fontWeight: "bold", color: "#e67e22" }}>{loadingPie ? "..." : pieStats.taxi}</p>
                        </div>
                    </div>

                    {/* Right Column: Pie Chart */}
                    <div style={{ height: "250px", flex: "1 1 300px", width: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                        {todayTrips.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
                                            const RADIAN = Math.PI / 180;
                                            // Place label outside the chart
                                            const radius = outerRadius + 20;
                                            const angle = midAngle || 0;
                                            const x = cx + radius * Math.cos(-angle * RADIAN);
                                            const y = cy + radius * Math.sin(-angle * RADIAN);
                                            const p = percent || 0;
                                            return p > 0 ? (
                                                <text x={x} y={y} fill="black" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 'bold' }}>
                                                    {`${(p * 100).toFixed(0)}%`}
                                                </text>
                                            ) : null;
                                        }}
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <div style={{ color: "#999", fontStyle: "italic" }}>No trips today</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Trends Section - Unchanged */}
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
