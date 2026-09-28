import {prisma} from "@/lib/db/prisma";

export async function getUsers(){
    return prisma.user.findMany({
        select:{
            id:true,
            email:true,
            name:true,
            phone:true,
            role:true,
            status:true,
            approvedAt:true,
            createdAt:true,
            updatedAt:true
        },
        orderBy:{
            createdAt:"desc"
        }
    });
}

export async function getuserById(id: string){
    return prisma.user.findUnique({
        where: {id},
        select:{
            id:true,
            email:true,
            name:true,
            phone:true,
            role:true,
            status:true,
            approvedAt:true,
            createdAt:true,
            updatedAt:true
        }
    })
}