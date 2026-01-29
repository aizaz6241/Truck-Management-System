
import { Prisma } from "@prisma/client";

// This should compile if the types are correct
const input: Prisma.StatementCreateInput = {
  name: "Test",
  type: "TEST",
  contractor: {
    connect: { id: 1 }
  }
};

console.log("Types are correct");
