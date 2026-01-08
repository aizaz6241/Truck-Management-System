import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function LogsPage(props: { searchParams: Promise<{ filter?: string }> }) {
    const searchParams = await props.searchParams;
    const session = await getSession();
    if (session?.user?.role !== "ADMIN") return redirect("/login");

    const filter = searchParams.filter;
    let where = {};
    if (filter === 'driver') where = { actorRole: 'DRIVER' };
    if (filter === 'admin') where = { actorRole: 'ADMIN' };
    if (filter === 'create') where = { action: 'CREATE' };
    if (filter === 'update') where = { action: 'UPDATE' };
    if (filter === 'delete') where = { action: 'DELETE' };

    // @ts-ignore - ActivityLog might not be in generated types yet
    const logs = await prisma.activityLog.findMany({
        where,
        orderBy: { date: 'desc' }
    });

    // Group by date (YYYY-MM-DD)
    const groupedLogs = logs.reduce((acc: any, log: any) => {
        const dateKey = log.date.toISOString().split('T')[0];
        if (!acc[dateKey]) acc[dateKey] = [];
        acc[dateKey].push(log);
        return acc;
    }, {});

    return (
        <div className="log-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 className="log-title">Activity Logs</h1>
            </div>

            <div className="log-filters">
                <FilterLink current={filter} value={undefined} label="All" />
                <div className="log-filter-divider"></div>
                <FilterLink current={filter} value="driver" label="Drivers" />
                <FilterLink current={filter} value="admin" label="Admins" />
                <div className="log-filter-divider"></div>
                <FilterLink current={filter} value="create" label="Created" />
                <FilterLink current={filter} value="update" label="Updated" />
                <FilterLink current={filter} value="delete" label="Deleted" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {Object.keys(groupedLogs).length > 0 ? Object.keys(groupedLogs).map((dateKey: string) => (
                    <div key={dateKey} className="log-group">
                        <div className="log-group-header">
                            <h3 className="log-group-date">
                                {new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </h3>
                            <span className="log-group-count">{groupedLogs[dateKey].length} Actions</span>
                        </div>
                        <div className="log-table-wrapper">
                            <table className="log-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: '120px' }}>Time</th>
                                        <th style={{ width: '100px' }}>Action</th>
                                        <th>Description</th>
                                        <th style={{ width: '200px' }}>User</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedLogs[dateKey].map((log: any) => (
                                        <tr key={log.id}>
                                            <td>
                                                <div className="log-time">
                                                    {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`log-badge ${getActionBadgeClass(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="log-details-text">{log.details}</div>
                                                <div className="log-details-meta">
                                                    <span style={{ textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{log.entity}</span>
                                                    <span>•</span>
                                                    <span style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#9ca3af' }}>ID: {log.entityId}</span>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="log-user">
                                                    <div className="log-user-avatar">
                                                        {log.actorName.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="log-user-name">{log.actorName}</div>
                                                        <div className="log-user-role">{log.actorRole}</div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )) : (
                    <div className="log-empty">
                        <div className="log-empty-icon">
                            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                            </svg>
                        </div>
                        <p style={{ fontSize: '1.125rem', fontWeight: 500, color: '#111827' }}>No logs found</p>
                        <p style={{ color: '#6b7280', marginTop: '0.25rem' }}>Try adjusting your filters to see more results.</p>
                        <Link href="/admin/logs" className="log-empty-link">
                            Clear Filters &rarr;
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}

function FilterLink({ current, value, label }: { current?: string, value?: string, label: string }) {
    const isActive = current === value;
    const href = value ? `/admin/logs?filter=${value}` : '/admin/logs';

    return (
        <Link
            href={href}
            className={`log-filter-btn ${isActive ? 'active' : 'inactive'}`}
        >
            {label}
        </Link>
    );
}

function getActionBadgeClass(action: string) {
    switch (action) {
        case 'CREATE': return 'badge-create';
        case 'UPDATE': return 'badge-update';
        case 'DELETE': return 'badge-delete';
        default: return 'badge-default';
    }
}
