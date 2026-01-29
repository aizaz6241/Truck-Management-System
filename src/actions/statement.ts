"use server";

import { prisma as db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getStatements() {
  try {
    const statements = await db.statement.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, data: statements };
  } catch (error) {
    console.error("Error fetching statements:", error);
    return { success: false, error: "Failed to fetch statements" };
  }
}

export async function getStatement(id: number) {
  try {
    const statement = await db.statement.findUnique({
      where: { id },
    });
    return { success: true, data: statement };
  } catch (error) {
    console.error("Error fetching statement:", error);
    return { success: false, error: "Failed to fetch statement" };
  }
}

export async function getContractorData(contractorId: number) {
  try {
    const invoices = await db.invoice.findMany({
      where: { contractorId },
      select: {
        id: true,
        invoiceNo: true,
        date: true,
        totalAmount: true,
        contractor: { select: { name: true } }
      },
      orderBy: { date: "asc" }
    });

    const payments = await db.payment.findMany({
      where: {
        invoice: { contractorId }
      },
      select: {
        id: true,
        date: true,
        amount: true,
        chequeNo: true,
        type: true,
        invoice: { select: { invoiceNo: true, contractor: { select: { name: true } } } }
      },
      orderBy: { date: "asc" }
    });

    return { success: true, data: { invoices, payments } };
  } catch (error) {
    console.error("Error fetching contractor data:", error);
    return { success: false, error: "Failed to fetch contractor data" };
  }
}



export async function getAvailableItems(contractorId: number, existingIds: string[]) {
  try {
     const { data } = await getContractorData(contractorId);
     if (!data) return { success: false, error: "No data found" };

     const existingInvoiceIds = new Set(
        existingIds.filter(id => id.startsWith('inv-')).map(id => parseInt(id.replace('inv-', '')))
     );
     const existingPaymentIds = new Set(
        existingIds.filter(id => id.startsWith('pay-')).map(id => parseInt(id.replace('pay-', '')))
     );

     const availableInvoices = data.invoices.filter(i => !existingInvoiceIds.has(i.id)).map(inv => ({
            id: `inv-${inv.id}`,
            originalId: inv.id,
            type: 'INVOICE',
            date: inv.date,
            description: inv.invoiceNo,
            amount: inv.totalAmount,
            contractorName: inv.contractor.name
     }));

     const availablePayments = data.payments.filter(p => !existingPaymentIds.has(p.id)).map(pay => ({
            id: `pay-${pay.id}`,
            originalId: pay.id,
            type: 'PAYMENT',
            date: pay.date,
            description: pay.chequeNo ? `Cheque #${pay.chequeNo}` : `Payment (${pay.type})`,
            amount: pay.amount,
            contractorName: pay.invoice.contractor.name
     }));
     
     const merged = [...availableInvoices, ...availablePayments].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

     return { success: true, data: merged };

  } catch (error) {
    console.error("Error fetching available items:", error);
    return { success: false, error: "Failed to fetch available items" };
  }
}

export async function updateStatement(id: number, details: string) {
    try {
        await db.statement.update({
            where: { id },
            data: { details }
        });
        revalidatePath("/admin/statements");
        revalidatePath(`/admin/statements/${id}`);
        return { success: true };
    } catch (error) {
        console.error("Error updating statement:", error);
        return { success: false, error: "Failed to update statement" };
    }
}

export async function generateStatement(data: { name: string; type: string; details: string; date?: Date; contractorId?: number; letterhead?: string }) {
  try {
    const statement = await db.statement.create({
      data: {
        name: data.name,
        type: data.type,
        details: data.details,
        date: data.date || new Date(),
        contractor: data.contractorId ? { connect: { id: data.contractorId } } : undefined,
        letterhead: data.letterhead || "RVT"
      },
    });

    revalidatePath("/admin/statements");
    return { success: true, data: statement };
  } catch (error) {
    console.error("Error generating statement:", error);
    return { success: false, error: "Failed to generate statement" };
  }
}

export async function deleteStatement(id: number) {
  try {
    await db.statement.delete({
      where: { id },
    });
    revalidatePath("/admin/statements");
    return { success: true };
  } catch (error) {
    console.error("Error deleting statement:", error);
  }
}

export async function getContractorStatements(contractorId: number) {
  try {
    const statements = await db.statement.findMany({
      where: { contractorId },
      orderBy: { createdAt: "desc" },
    });
    return { success: true, data: statements };
  } catch (error) {
    console.error("Error fetching contractor statements:", error);
    return { success: false, error: "Failed to fetch statements" };
  }
}

export async function addInvoiceToStatement(statementId: number, invoiceId: number) {
    try {
        const statement = await db.statement.findUnique({ where: { id: statementId } });
        if (!statement) return { success: false, error: "Statement not found" };

        const invoice = await db.invoice.findUnique({ 
            where: { id: invoiceId },
            include: { contractor: true }
        });
        if (!invoice) return { success: false, error: "Invoice not found" };

        // Parse existing items
        let items: any[] = [];
        try {
            if (statement.details) {
                const parsed = JSON.parse(statement.details);
                if (parsed.items && Array.isArray(parsed.items)) {
                    items = parsed.items;
                }
            }
        } catch (e) {
            console.error("Error parsing statement details:", e);
        }

        // Create new item
        const newItem = {
            id: `inv-${invoice.id}`,
            originalId: invoice.id,
            date: new Date(invoice.date).toLocaleDateString("en-GB"),
            description: invoice.invoiceNo,
            credit: invoice.totalAmount,
            debit: 0,
            vehicle: "",
            balance: 0, 
            type: 'INVOICE'
        };

        // Append and recalculate
        const newItems = [...items, newItem];
        
        let runningBalance = 0;
        const recalculatedItems = newItems.map(item => {
            if (item.credit > 0) runningBalance += item.credit;
            if (item.debit > 0) runningBalance -= item.debit;
            return { ...item, balance: runningBalance };
        });

        // Update statement details
        // We preserve other fields if they exist in the parsed JSON, but we have to re-read it properly.
        let statementData: any = {
            contractorName: invoice.contractor.name,
            date: new Date().toLocaleDateString("en-GB"),
            lpoNo: "", // Default or preserve?
            site: "", 
            items: []
        };

        if (statement.details) {
             try {
                statementData = JSON.parse(statement.details);
             } catch(e) {}
        }
        
        statementData.items = recalculatedItems;

        await db.statement.update({
            where: { id: statementId },
            data: { details: JSON.stringify(statementData) }
        });

        revalidatePath("/admin/statements");
        revalidatePath(`/admin/statements/${statementId}`);
        return { success: true };

    } catch (error) {
        console.error("Error adding invoice to statement:", error);
        return { success: false, error: "Failed to add invoice to statement" };
    }
}

export async function removeInvoiceFromAllStatements(invoiceId: number, contractorId: number) {
  try {
    // 1. Get all statements for this contractor
    const statements = await db.statement.findMany({
      where: { contractorId }
    });

    for (const stmt of statements) {
      if (!stmt.details) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(stmt.details);
      } catch (e) {
        continue;
      }

      if (!parsed.items || !Array.isArray(parsed.items)) continue;

      // 2. Check if invoice exists in this statement
      // We look for originalId === invoiceId AND type === 'INVOICE'
      // or id === `inv-${invoiceId}`
      const targetId = `inv-${invoiceId}`;
      const exists = parsed.items.some((item: any) => item.id === targetId || item.originalId === invoiceId);

      if (exists) {
        // 3. Remove and Recalculate
        const newItems = parsed.items.filter((item: any) => item.id !== targetId && item.originalId !== invoiceId);

        let runningBalance = 0;
        const recalculatedItems = newItems.map((item: any) => {
             if (item.credit > 0) runningBalance += item.credit;
             if (item.debit > 0) runningBalance -= item.debit;
             return { ...item, balance: runningBalance };
        });

        parsed.items = recalculatedItems;

        // 4. Update Statement
        await db.statement.update({
          where: { id: stmt.id },
          data: { details: JSON.stringify(parsed) }
        });
        
        revalidatePath(`/admin/statements/${stmt.id}`);
      }
    }
    revalidatePath("/admin/statements");
    return { success: true };
  } catch (error) {
    console.error("Error removing invoice from statements:", error);
    return { success: false, error: "Failed to cleanup statements" };
  }
}

export async function updateInvoiceInAllStatements(invoiceId: number, contractorId: number, newAmount: number) {
  try {
    const statements = await db.statement.findMany({
      where: { contractorId }
    });

    for (const stmt of statements) {
      if (!stmt.details) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(stmt.details);
      } catch (e) {
        continue;
      }

      if (!parsed.items || !Array.isArray(parsed.items)) continue;

      // Check if invoice exists
      const targetId = `inv-${invoiceId}`;
      const itemIndex = parsed.items.findIndex((item: any) => item.id === targetId || item.originalId === invoiceId);

      if (itemIndex !== -1) {
        // Update the amount
        parsed.items[itemIndex].credit = newAmount;
        
        // Recalculate balances
        let runningBalance = 0;
        const recalculatedItems = parsed.items.map((item: any) => {
             if (item.credit > 0) runningBalance += item.credit;
             if (item.debit > 0) runningBalance -= item.debit;
             return { ...item, balance: runningBalance };
        });

        parsed.items = recalculatedItems;

        await db.statement.update({
          where: { id: stmt.id },
          data: { details: JSON.stringify(parsed) }
        });
        
        revalidatePath(`/admin/statements/${stmt.id}`);
      }
    }
    revalidatePath("/admin/statements");
    return { success: true };
  } catch (error) {
    console.error("Error updating invoice in statements:", error);
    return { success: false, error: "Failed to update statements" };
  }
}

export async function addPaymentToStatement(statementId: number, paymentId: number) {
    try {
        const statement = await db.statement.findUnique({ where: { id: statementId } });
        if (!statement) return { success: false, error: "Statement not found" };

        const payment = await db.payment.findUnique({ 
            where: { id: paymentId },
            include: { invoice: { include: { contractor: true } } }
        });
        if (!payment) return { success: false, error: "Payment not found" };

        let items: any[] = [];
        try {
            if (statement.details) {
                const parsed = JSON.parse(statement.details);
                if (parsed.items && Array.isArray(parsed.items)) {
                    items = parsed.items;
                }
            }
        } catch (e) {
            console.error("Error parsing statement details:", e);
        }

        // Check exists
        const targetId = `pay-${payment.id}`;
        if (items.some((i: any) => i.id === targetId || (i.originalId === payment.id && i.type === 'PAYMENT'))) {
            return { success: false, error: "Payment already in statement" };
        }

        const newItem = {
            id: targetId,
            originalId: payment.id,
            date: new Date(payment.date).toLocaleDateString("en-GB"),
            description: `Payment - ${payment.type}${payment.chequeNo ? ` (${payment.chequeNo})` : ''}`,
            credit: 0,
            debit: payment.amount,
            vehicle: "",
            balance: 0,
            type: 'PAYMENT'
        };

        const newItems = [...items, newItem];
        
        let runningBalance = 0;
        const recalculatedItems = newItems.map(item => {
            if (item.credit > 0) runningBalance += item.credit;
            if (item.debit > 0) runningBalance -= item.debit;
            return { ...item, balance: runningBalance };
        });

        let statementData: any = {
            contractorName: payment.invoice.contractor.name,
            date: new Date().toLocaleDateString("en-GB"),
            lpoNo: "", 
            site: "", 
            items: []
        };

        if (statement.details) {
             try {
                statementData = JSON.parse(statement.details);
             } catch(e) {}
        }
        statementData.items = recalculatedItems;

        await db.statement.update({
            where: { id: statementId },
            data: { details: JSON.stringify(statementData) }
        });

        revalidatePath("/admin/statements");
        revalidatePath(`/admin/statements/${statementId}`);
        return { success: true };

    } catch (error) {
        console.error("Error adding payment to statement:", error);
        return { success: false, error: "Failed to add payment" };
    }
}

export async function removePaymentFromStatements(paymentId: number, contractorId: number) {
  try {
    const statements = await db.statement.findMany({
      where: { contractorId }
    });

    for (const stmt of statements) {
      if (!stmt.details) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(stmt.details);
      } catch (e) { continue; }

      if (!parsed.items || !Array.isArray(parsed.items)) continue;

      const targetId = `pay-${paymentId}`;
      const exists = parsed.items.some((item: any) => item.id === targetId || (item.originalId === paymentId && item.type === 'PAYMENT'));

      if (exists) {
        const newItems = parsed.items.filter((item: any) => item.id !== targetId && !(item.originalId === paymentId && item.type === 'PAYMENT'));

        let runningBalance = 0;
        const recalculatedItems = newItems.map((item: any) => {
             if (item.credit > 0) runningBalance += item.credit;
             if (item.debit > 0) runningBalance -= item.debit;
             return { ...item, balance: runningBalance };
        });

        parsed.items = recalculatedItems;

        await db.statement.update({
          where: { id: stmt.id },
          data: { details: JSON.stringify(parsed) }
        });
        
        revalidatePath(`/admin/statements/${stmt.id}`);
      }
    }
    revalidatePath("/admin/statements");
    return { success: true };
  } catch (error) {
    console.error("Error removing payment from statements:", error);
    return { success: false, error: "Failed to cleanup statements" };
  }
}

export async function updatePaymentInStatements(paymentId: number, contractorId: number, newData: any) {
  try {
    const statements = await db.statement.findMany({
      where: { contractorId }
    });

    for (const stmt of statements) {
      if (!stmt.details) continue;

      let parsed: any;
      try {
        parsed = JSON.parse(stmt.details);
      } catch (e) { continue; }

      if (!parsed.items || !Array.isArray(parsed.items)) continue;

      const targetId = `pay-${paymentId}`;
      const itemIndex = parsed.items.findIndex((item: any) => item.id === targetId || (item.originalId === paymentId && item.type === 'PAYMENT'));

      if (itemIndex !== -1) {
        // Update fields
        if (newData.amount !== undefined) parsed.items[itemIndex].debit = newData.amount;
        if (newData.date) parsed.items[itemIndex].date = new Date(newData.date).toLocaleDateString("en-GB");
        
        const type = newData.paymentType || newData.type || "Payment";
        const cheque = newData.chequeNo;
        if (type || cheque) {
             parsed.items[itemIndex].description = `Payment - ${type}${cheque ? ` (${cheque})` : ''}`;
        }

        let runningBalance = 0;
        const recalculatedItems = parsed.items.map((item: any) => {
             if (item.credit > 0) runningBalance += item.credit;
             if (item.debit > 0) runningBalance -= item.debit;
             return { ...item, balance: runningBalance };
        });

        parsed.items = recalculatedItems;

        await db.statement.update({
          where: { id: stmt.id },
          data: { details: JSON.stringify(parsed) }
        });
        
        revalidatePath(`/admin/statements/${stmt.id}`);
      }
    }
    revalidatePath("/admin/statements");
    return { success: true };
  } catch (error) {
    console.error("Error updating payment in statements:", error);
    return { success: false, error: "Failed to update statements" };
  }
}
