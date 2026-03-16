import { withAuth } from "next-auth/middleware"

export default withAuth({
  pages: {
    signIn: "/admin/login"
  },
  callbacks: {
    authorized: ({ token }) => {
      if (!token) return false
      return token.role === "ADMIN"
    }
  }
})

export const config = {
  matcher: ["/admin/:path*"]
}