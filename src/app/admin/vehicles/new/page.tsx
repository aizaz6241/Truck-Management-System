import VehicleForm from "@/components/VehicleForm";

export default function NewVehiclePage() {
    return (
        <div className="container" style={{ marginTop: "2rem" }}>
            <h1 style={{ marginBottom: "2rem", textAlign: "center" }}>Add New Vehicle</h1>
            <VehicleForm />
        </div>
    );
}
