import { db } from "@/config/db";
import { usersTable } from "@/config/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
    const user = await currentUser();

    try {
        // Check if User Already Exist
        const users = await db.select().from(usersTable)
        //@ts-ignore
        .where (eq(usersTable.email,user?.primaryEmailAddress?.emailAddress))
        // If Not Then Create NEW User

        if (users?.length == 0){
            const result = await db.insert(usersTable).values({
            //@ts-ignore
            name:user?.fullName,
            email:user?.primaryEmailAddress?.emailAddress,
            credits:10
            //@ts-ignore
        }).returning({ usersTable})
        return NextResponse.json(result[0]?.usersTable);
        }
        return NextResponse.json(users[0]);
    }
    catch (e) {
            return NextResponse.json(e);
    }
}

export async function GET (req: NextRequest) {
    const {searchParams}=new URL(req.url);
    const sessionId=searchParams.get('sessionId');
    const user=await currentUser();
    //@ts-ignore
    const result = await db.select().from (SessionChatTable)
    //@ts-ignore
    .where (eq (SessionChatTable.sessionId, sessionId));

    return NextResponse.json(result[0]);

    }
