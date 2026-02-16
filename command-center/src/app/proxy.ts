
import NextAuth from "next-auth"
import { authConfig } from "../auth.config"

export const proxy = (req: any) => {
    console.log("Proxy executing for path:", req.nextUrl.pathname);
    return NextAuth(authConfig).auth(req);
}
export default proxy

export const config = {
    // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
