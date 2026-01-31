import { prisma } from "@/lib/db";
import TaxiOwnerList from "@/components/taxi/TaxiOwnerList";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TaxiOwnersPage() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const owners = await prisma.taxiOwner.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { vehicles: true },
      },
    },
  });

  return (
    <div className="container mx-auto p-4">
      <TaxiOwnerList owners={owners} />
    </div>
  );
}
