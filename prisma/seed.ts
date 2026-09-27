import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { hashPassword } from "@/lib/auth/password";

const connectionString = process.env.DATABASE_URL;

if(!connectionString){
    throw new Error("DATABASE_URL is not configured");
}

const adapter = new PrismaPg({
    connectionString,
});

const prisma = new PrismaClient({
    adapter
});

async function main(){
    const passwordHash = await hashPassword("MedOrch@Dev123!");

    const admin = await prisma.user.upsert({
        where:{
            email:"admin@medorch.local",
        },
        update:{
            name:"MedOrch Administrator",
            passwordHash,
            role:"ADMIN",
            status:"ACTIVE",
            approvedAt: new Date()
        },
        create:{
            email:"admin@medorch.local",
            name:"MedOrch Administrator",
            passwordHash,
            role:"ADMIN",
            status:"ACTIVE",
            approvedAt: new Date()
        }
    });

    console.log("Development admin created:",{
        id: admin.id,
        email: admin.email,
        role: admin.role,
        status: admin.status
    });
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
}).finally(async () => {
    await prisma.$disconnect()
})