import DriverNav from "@/components/DriverNav";

export default function DriverLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <DriverNav />
            {children}
        </>
    );
}
