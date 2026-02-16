
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { auth } from "@/auth";

export async function POST(req: Request) {
    try {
        const session = await auth();
        const adminKey = req.headers.get("x-admin-key");
        const secret = process.env.AUTH_SECRET;
        const fallbackKey = "temp-admin-setup-2024";

        // Allow if authenticated OR if correct admin key is provided (or fallback)
        if (!session?.user?.email && (!adminKey || (adminKey !== secret && adminKey !== fallbackKey))) {
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
