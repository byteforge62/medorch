import { findUserById,findUserByEmail,findUsers } from "./user.repository";

export async function getUsers(){
    return findUsers();
}

export async function getUserById(id: string){
    return findUserById(id);
}

export async function getUserByEmail(email: string){
    return findUserByEmail(email);
}