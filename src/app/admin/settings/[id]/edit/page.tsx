import { prisma } from "@/lib/db"; // Start of file
import { getSession } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import AdminEditForm from "@/components/AdminEditForm";
import Link from "next/link";

export default async function EditAdminPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") return redirect("/login");

    const id = parseInt(params.id);
    const admin = await prisma.user.findUnique({
        where: { id, role: "ADMIN" }
    });

    if (!admin) return notFound();

    return (
        <div className="container mx-auto p-6" style={{ maxWidth: '42rem' }}>
            <Link href="/admin/settings" style={{ display: 'inline-flex', alignItems: 'center', color: '#4b5563', marginBottom: '1.5rem', textDecoration: 'none' }}>
                &larr; Back to Settings
            </Link>

            <div className="settings-card">
                <h1 className="settings-card-title">Edit Admin: {admin.name}</h1>
                <AdminEditForm admin={admin} />
            </div>
        </div>
    );
}
