import {prisma} from "@/lib/db/prisma";

export async function findDepartments(){
    return prisma.department.findMany({
        orderBy:{
            name: "asc"
        },
        include:{
            headDoctor:{
                select:{
                    id:true,
                    specialization:true,
                    licenseNumber:true,
                    user:{
                        select:{
                            id:true,
                            name:true,
                            email:true
                        }
                    }
                }
            },
            _count:{
                select:{
                    doctors:true,
                    otRooms:true,
                    equipment:true,
                    schedules:true
                }
            }
        },
    })
}

export async function findDepartmentById(id: string){
    return prisma.department.findUnique({
        where:{
            id,
        },
        include:{
            headDoctor:{
                select:{
                    id:true,
                    specialization:true,
                    licenseNumber:true,
                    user:{
                        select:{
                            id:true,
                            name:true,
                            email:true
                        }
                    }
                }
            },
            doctors:{
                select:{
                    id:true,
                    specialization:true,
                    licenseNumber:true,
                    user:{
                        select:{
                            id:true,
                            name:true,
                            email:true
                        }
                    }
                }
            },
            _count:{
                select:{
                    doctors:true,
                    otRooms:true,
                    equipment:true,
                    schedules:true
                }
            }
        }
    })
}