import LoadingSpinner from "@/components/LoadingSpinner";

export default function Loading() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "50vh",
        width: "100%",
        padding: "2rem",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <LoadingSpinner size={40} color="#2563eb" />
        <p style={{ color: "#6b7280", fontSize: "0.9rem", fontWeight: 500 }}>
          Loading...
        </p>
      </div>
    </div>
  );
}
