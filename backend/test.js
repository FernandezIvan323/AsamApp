import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  try {
    const events = await prisma.event.findMany();
    console.log("Success:", events);
  } catch (e) {
    console.error("Error:", e);
  }
}
main();
