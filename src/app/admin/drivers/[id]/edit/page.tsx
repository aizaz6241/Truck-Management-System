import { prisma } from "@/lib/db";
import DriverForm from "@/components/DriverForm";
import { notFound } from "next/navigation";

export default async function EditDriverPage(props: { params: Promise<{ id: string }> }) {
    const params = await props.params;
    const id = parseInt(params.id);
    if (isNaN(id)) return notFound();

    const driver = await prisma.user.findUnique({ where: { id, role: "DRIVER" } });
    if (!driver) return notFound();

    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>Edit Driver</h1>
            {/* Recompile trigger */}
            <DriverForm driver={driver} />
        </div>
    );
}
