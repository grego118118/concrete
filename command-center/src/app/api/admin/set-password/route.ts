
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        // In a real app, strict admin check here. For now, checking if authenticated
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: "Email and password required" }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await db.user.update({
            where: { email },
            data: { password: hashedPassword },
        });

        return NextResponse.json({ success: true, userId: user.id });
    } catch (error: any) {
        console.error("Set password error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
