"use server";

import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createInvoice(data: {
    contractorId: number;
    tripIds: number[];
    materialName: string;
    route: string; // "From|To"
    letterhead?: string;
}) {
    console.log("SERVER: createInvoice called with data:", JSON.stringify(data, null, 2));

    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        console.log("SERVER: Unauthorized access attempt");
        return { message: "Unauthorized" };
    }

    // 1. Fetch selected trips to verify
    const trips = await prisma.trip.findMany({
        where: { id: { in: data.tripIds } },
        include: { vehicle: true }
    });
    console.log(`SERVER: Found ${trips.length} trips`);

    if (trips.length === 0) return { message: "No trips selected" };

    // 2. Calculate Total Amount
    let totalAmount = 0;

    // ... (logic finding contractor) ...
    const contractor = await prisma.contractor.findUnique({
        where: { id: data.contractorId },
        include: {
            sites: {
                include: {
                    materials: true
                }
            }
        }
    });

    if (!contractor) {
        console.log("SERVER: Contractor not found");
        return { message: "Contractor not found" };
    }
    console.log(`SERVER: Found contractor: ${contractor.name}`);

    const [from, to] = data.route.split("|");
    
    // Find the material
    let targetMaterial: any = null;
    
    for (const site of contractor.sites) {
        const found = site.materials.find(m => 
            m.name.trim() === data.materialName.trim() && 
            m.locationFrom.trim() === from.trim() && 
            m.locationTo.trim() === to.trim()
        );
        if (found) {
            targetMaterial = found;
            break;
        }
    }

    if (!targetMaterial) {
        console.log("SERVER: Target material/price not found for route");
        return { message: "Could not find a price defined for this material and route under this contractor." };
    }
    console.log(`SERVER: Found target material price: ${targetMaterial.price}`);

    // Calculate
    for (const trip of trips) {
        if (targetMaterial.unit === "Per Trip") {
            totalAmount += targetMaterial.price;
        } else if (targetMaterial.unit === "Per Ton") {
            const capacity = parseFloat(trip.vehicle.capacity || "0");
            totalAmount += targetMaterial.price * capacity;
        } else {
             totalAmount += targetMaterial.price; 
        }
    }
    
    // Log accumulated Net Amount
    console.log(`SERVER: Net Amount (pre-VAT): ${totalAmount}`);

    // Add 5% VAT
    const netAmount = totalAmount;
    const vatAmount = netAmount * 0.05;
    totalAmount = netAmount + vatAmount;

    // Round to 2 decimals to ensure clean currency storage
    totalAmount = Math.round(totalAmount * 100) / 100;

    console.log(`SERVER: VAT Amount: ${vatAmount}`);
    console.log(`SERVER: Final Gross Amount (incl. 5% VAT): ${totalAmount}`);

    // Format: RVT/[Month]/[Year]/[Abbr]/[Count]
    const now = new Date();
    const monthAbbr = now.toLocaleString('default', { month: 'short' }).toUpperCase(); 
    const yearShort = now.getFullYear().toString().slice(-2); 
    // @ts-ignore
    const contractorAbbr = contractor.abbreviation || "GEN"; 

    const prefixBase = `RVT/${monthAbbr}/${yearShort}/${contractorAbbr}/`;

    // 1. Get the last created invoice for this contractor
    const lastInvoice = await prisma.invoice.findFirst({
        where: { contractorId: data.contractorId },
        orderBy: { id: 'desc' } 
    });

    let nextSequence = 1;

    if (lastInvoice && lastInvoice.invoiceNo) {
        const parts = lastInvoice.invoiceNo.split('/');
        if (parts.length >= 1) {
            const lastNumStr = parts[parts.length - 1]; 
            const lastNum = parseInt(lastNumStr, 10);
            if (!isNaN(lastNum)) {
                nextSequence = lastNum + 1;
            }
        }
    }

    const nextNumStr = nextSequence.toString().padStart(3, "0"); 
    const invoiceNo = `${prefixBase}${nextNumStr}`;
    console.log(`SERVER: Generated invoiceNo: ${invoiceNo}`);

    // 4. Create Invoice
    // @ts-ignore
    const invoice = await prisma.invoice.create({
        data: {
            invoiceNo,
            contractorId: data.contractorId,
            totalAmount,
            status: "Unpaid",
            letterhead: data.letterhead || "RVT",
            trips: {
                connect: data.tripIds.map(id => ({ id }))
            }
        }
    });

    revalidatePath("/admin/invoices"); 
    return { success: true, invoiceId: invoice.id };
}

import { removeInvoiceFromAllStatements, updateInvoiceInAllStatements } from "@/actions/statement";

export async function deleteInvoice(id: number) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        // 0. Get Invoice to find Contractor and cleanup statements
        const invoice = await prisma.invoice.findUnique({
            where: { id }
        });

        if (invoice && invoice.contractorId) {
             await removeInvoiceFromAllStatements(id, invoice.contractorId);
        }

        await prisma.trip.updateMany({
            where: { 
                // @ts-ignore
                invoiceId: id 
            },
            data: { 
                // @ts-ignore
                invoiceId: null 
            }
        });

        // @ts-ignore
        await prisma.invoice.delete({
            where: { id }
        });

        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (e) {
        return { message: "Failed to delete invoice" };
    }
}

export async function getUninvoicedTrips(contractorId: number, materialName: string, route: string) {
    console.log("getUninvoicedTrips called with:", { contractorId, materialName, route });
    const [from, to] = route.split("|");
    const trips = await prisma.trip.findMany({
        where: {
            materialType: materialName,
            fromLocation: from,
            toLocation: to,
            // @ts-ignore
            invoiceId: null 
        },
        include: {
            vehicle: true,
            driver: true
        },
        orderBy: { date: 'desc' }
    });
    return trips;
}

export async function getAllUninvoicedTrips() {
    // @ts-ignore
    const trips = await prisma.trip.findMany({
        where: {
            // @ts-ignore
            invoiceId: null 
        },
        include: {
            vehicle: true,
            driver: true
        },
        orderBy: { date: 'desc' }
    });
    return trips;
}

export async function getContractorFilterOptions(contractorId: number) {
    const contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
        include: {
            sites: {
                include: { materials: true }
            }
        }
    });

    if (!contractor) return { materials: [], routes: [] };

    const materials = new Set<string>();
    const routes = new Set<string>();

    contractor.sites.forEach(site => {
        site.materials.forEach(m => {
            materials.add(m.name);
            routes.add(`${m.locationFrom}|${m.locationTo}`);
        });
    });

    return {
        materials: Array.from(materials),
        routes: Array.from(routes)
    };
}

export async function updateInvoiceMetadata(id: number, metadata: string, totalAmount?: number) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        const dataToUpdate: any = { metadata };
        if (totalAmount !== undefined) {
             // Ensure we store the clean 2-decimal rounded gross amount
             dataToUpdate.totalAmount = Math.round(totalAmount * 100) / 100;
        }

        // @ts-ignore
        await prisma.invoice.update({
            where: { id },
             // @ts-ignore
            data: dataToUpdate
        });

        if (totalAmount !== undefined) {
             const inv = await prisma.invoice.findUnique({ where: { id }});
             if (inv && inv.contractorId) {
                  // Round again to be safe
                  const safeAmount = Math.round(totalAmount * 100) / 100;
                  await updateInvoiceInAllStatements(id, inv.contractorId, safeAmount);
             }
        }

        revalidatePath(`/admin/invoices/${id}`);
        revalidatePath("/admin/invoices"); // Revalidate list as well
        return { success: true };
    } catch (e) {
        return { message: "Failed to update invoice" };
    }
}

export async function getContractorValidCombinations(contractorId: number) {
    const contractor = await prisma.contractor.findUnique({
        where: { id: contractorId },
        include: {
            sites: {
                include: { materials: true }
            }
        }
    });

    if (!contractor) return [];

    const combinations: { material: string, from: string, to: string }[] = [];

    contractor.sites.forEach(site => {
        site.materials.forEach(m => {
            combinations.push({
                material: m.name,
                from: m.locationFrom,
                to: m.locationTo
            });
        });
    });

    return combinations;
}

export async function getInvoicePayments(invoiceId: number) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") return [];

    try {
        // @ts-ignore
        const payments = await prisma.payment.findMany({
            where: { invoiceId },
            orderBy: { date: 'desc' }
        });
        return payments;
    } catch (e) {
        return [];
    }
}

export async function recordPayment(invoiceId: number, data: {
    paymentDate: Date;
    paymentType: string;
    amount: number;
    chequeImageUrl?: string;
    note?: string;
    chequeNo?: string;
    bankName?: string;
}) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId }
        });
        
        if (!invoice) return { message: "Invoice not found" };

        // @ts-ignore
        const newPaidAmount = (invoice.paidAmount || 0) + data.amount;
        
        let newStatus = invoice.status;
        if (newPaidAmount >= (invoice.totalAmount - 0.1)) {
            newStatus = "Paid";
        } else if (newPaidAmount > 0) {
            newStatus = "Partial";
        }

        // 2. Transaction: Create Payment + Update Invoice
        const [payment] = await prisma.$transaction([
            // @ts-ignore
            prisma.payment.create({
                data: {
                    invoiceId: invoiceId,
                    date: data.paymentDate,
                    amount: data.amount,
                    type: data.paymentType,
                    chequeImageUrl: data.chequeImageUrl,
                    note: data.note,
                    chequeNo: data.chequeNo,
                    bankName: data.bankName
                }
            }),
            // @ts-ignore
            prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    paidAmount: newPaidAmount,
                    status: newStatus
                } as any
            })
        ]);

        revalidatePath("/admin/invoices");
        // @ts-ignore
        return { success: true, paymentId: payment.id };
    } catch (e: any) {
        console.error("Record Payment Error:", e);
        return { message: e.message || "Failed to record payment" };
    }
}

export async function getAllPayments() {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") return [];

    try {
        // @ts-ignore
        const payments = await prisma.payment.findMany({
            include: {
                invoice: {
                    include: {
                        contractor: true,
                        trips: {
                            take: 1
                        }
                    }
                }
            },
            orderBy: { date: 'desc' }
        });
        return payments;
    } catch (e) {
        return [];
    }
}

export async function toggleInvoiceReceived(id: number, status: boolean) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        // @ts-ignore
        await prisma.invoice.update({
            where: { id },
             // @ts-ignore
            data: { isReceived: status }
        });
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (e) {
        return { message: "Failed to update invoice status" };
    }
}

export async function markInvoiceAsReceived(id: number, date: Date, url: string) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        // @ts-ignore
        await prisma.invoice.update({
            where: { id },
             // @ts-ignore
            data: { 
                isReceived: true,
                receivedDate: date,
                receivedCopyUrl: url
            } as any
        });
        revalidatePath("/admin/invoices");
        return { success: true };
    } catch (e) {
        console.error("Error marking invoice as received:", e);
        return { message: "Failed to mark invoice as received: " + (e as Error).message };
    }
}

export async function deletePayment(paymentId: number) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        const payment = await prisma.payment.findUnique({
             where: { id: paymentId },
             include: { invoice: true }
        });
        
        if (!payment) return { message: "Payment not found" };

        const invoiceId = payment.invoiceId;

        // 1. Sync with Statements
        // @ts-ignore
        if (payment.invoice && payment.invoice.contractorId) {
             const { removePaymentFromStatements } = await import("@/actions/statement");
             // @ts-ignore
             await removePaymentFromStatements(paymentId, payment.invoice.contractorId);
        }

        // 2. Delete Payment
        await prisma.payment.delete({
            where: { id: paymentId }
        });

        // 3. Recalculate Invoice Status
        const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId }});
        if (invoice) {
             const newPaidAmount = (invoice.paidAmount || 0) - payment.amount;
             let newStatus = invoice.status;
             
             // Simple status logic
             if (newPaidAmount <= 0) newStatus = "Unpaid";
             else if (newPaidAmount >= (invoice.totalAmount - 0.1)) newStatus = "Paid";
             else newStatus = "Partial";

             // @ts-ignore
             await prisma.invoice.update({
                 where: { id: invoiceId },
                 data: {
                     paidAmount: newPaidAmount < 0 ? 0 : newPaidAmount,
                     status: newStatus
                 } as any
             });
        }

        revalidatePath(`/admin/invoices/${invoiceId}`);
        return { success: true };
    } catch (e) {
        return { message: "Failed to delete payment" };
    }
}

export async function updatePayment(paymentId: number, data: any) {
    const session = await getSession();
    if (!session || session.user.role !== "ADMIN") {
        return { message: "Unauthorized" };
    }

    try {
        const payment = await prisma.payment.findUnique({
             where: { id: paymentId },
             include: { invoice: true }
        });
        
        if (!payment) return { message: "Payment not found" };

        // 1. Calculate difference
        const oldAmount = payment.amount;
        const newAmount = data.amount !== undefined ? data.amount : oldAmount;
        const diff = newAmount - oldAmount;

        // 2. Sync with Statements
        // @ts-ignore
        if (payment.invoice && payment.invoice.contractorId) {
             const { updatePaymentInStatements } = await import("@/actions/statement");
             // @ts-ignore
             await updatePaymentInStatements(paymentId, payment.invoice.contractorId, data);
        }

        // 3. Update Payment
        await prisma.payment.update({
            where: { id: paymentId },
            data: {
                date: data.date ? new Date(data.date) : undefined,
                amount: data.amount,
                type: data.type,
                chequeNo: data.chequeNo,
                bankName: data.bankName,
                note: data.note,
                chequeImageUrl: data.chequeImageUrl
            }
        });

        // 4. Update Invoice (Only if amount changed)
        if (diff !== 0) {
            const invoice = await prisma.invoice.findUnique({ where: { id: payment.invoiceId }});
            if (invoice) {
                const newPaidAmount = (invoice.paidAmount || 0) + diff;
                let newStatus = invoice.status;
                
                // Simple status logic
                if (newPaidAmount <= 0.1) newStatus = "Unpaid";
                else if (newPaidAmount >= (invoice.totalAmount - 0.1)) newStatus = "Paid";
                else newStatus = "Partial";

                // @ts-ignore
                await prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: {
                        paidAmount: newPaidAmount < 0 ? 0 : newPaidAmount,
                        status: newStatus
                    } as any
                });
            }
        }

        revalidatePath(`/admin/invoices/${payment.invoiceId}`);
        return { success: true };
    } catch (e) {
        return { message: "Failed to update payment" };
    }
}
