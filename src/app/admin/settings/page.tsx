import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import DeleteAdminButton from "@/components/DeleteAdminButton";
import { ProfileForm, AddAdminForm } from "@/components/AdminSettingsForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
    const session = await getSession();
    const currentUserId = session?.user?.id;

    const admins = await prisma.user.findMany({
        where: { role: "ADMIN" },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="settings-container">
            <h1 className="settings-title">Admin Settings</h1>

            <div className="settings-grid mb-12">
                <ProfileForm />
                <AddAdminForm />
            </div>

            <div className="settings-card">
                <h2 className="settings-card-title">Manage Admins</h2>
                <div className="table-responsive">
                    <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #e5e7eb" }}>
                                <th style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase" }}>Name</th>
                                <th style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase" }}>Email</th>
                                <th style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase" }}>Password</th>
                                <th style={{ padding: "0.75rem", fontSize: "0.875rem", color: "#6b7280", textTransform: "uppercase" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {admins.map(admin => (
                                <tr key={admin.id} style={{ borderBottom: "1px solid #f3f4f6" }}>
                                    <td style={{ padding: "1rem 0.75rem", fontWeight: 500, color: "#1f2937" }}>
                                        {admin.name}
                                        {admin.id === currentUserId && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", backgroundColor: "#e5e7eb", padding: "0.1rem 0.4rem", borderRadius: "99px", color: "#4b5563" }}>YOU</span>}
                                    </td>
                                    <td style={{ padding: "1rem 0.75rem", color: "#4b5563" }}>{admin.email}</td>
                                    <td style={{ padding: "1rem 0.75rem", fontFamily: "monospace", color: "#9ca3af" }}>********</td>
                                    <td style={{ padding: "1rem 0.75rem" }}>
                                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                                            <Link href={`/admin/settings/${admin.id}/edit`} className="btn" style={{ padding: "0.25rem 0.5rem", fontSize: "0.875rem", backgroundColor: "#fff", border: "1px solid #e5e7eb", color: "#374151" }}>Edit</Link>
                                            {admin.id !== currentUserId && <DeleteAdminButton id={admin.id} />}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
