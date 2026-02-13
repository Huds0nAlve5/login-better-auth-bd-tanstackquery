import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 1. Criamos uma função ou variável para guardar o cliente
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prismaClientSingleton = () => {
  return new PrismaClient({ adapter });
};

// 2. Definimos um tipo para o objeto global
declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

// 3. se já existir no 'global', usa o que tem.
// Se não (como na primeira vez), cria um novo.
const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

// 4. Em desenvolvimento, salva no global para não criar outro no recarregamento
if (process.env.NODE_ENV !== "production") globalThis.prisma = prisma;
