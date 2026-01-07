import { prisma } from "@/lib/db";
import DriverForm from "@/components/DriverForm";

export default async function NewDriverPage() {
    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>Add New Driver</h1>
            <DriverForm />
        </div>
    );
}
