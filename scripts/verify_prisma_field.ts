import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    // Attempt to access the types or property
    // We won't actually run this, just checking if it compiles/runs without type error if we were to compile it.
    // But since I can't compile-check easily, I'll run it and see if it throws "Unknown argument"
    
    // We'll verify if the property exists in the model definition at runtime
    // @ts-ignore
    const dmmf = prisma._dmmf;
    // @ts-ignore
    const model = dmmf.modelMap.Statement;
    const field = model.fields.find((f: any) => f.name === 'contractorId');
    
    if (field) {
        console.log("Validation Success: contractorId exists in Statement model.");
    } else {
        console.error("Validation Fail: contractorId DOES NOT EXIST in Statement model.");
        process.exit(1);
    }

  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
