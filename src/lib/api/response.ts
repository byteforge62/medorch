import { NextResponse } from "next/server";

export function apiSuccess<T>(
    data:T,
    status:200
){
    return NextResponse.json({
        success:true,
        data
    },
{status})
}


export function apiError(
    message: string,
    status: number,
    details?: unknown,
    requestId?: string,
){
    return NextResponse.json({
        success:false,
        message,
        ...(details !== undefined ? {details} : {}),
        ...(requestId !== undefined ? {requestId} : {}), 
    },
{status})
}