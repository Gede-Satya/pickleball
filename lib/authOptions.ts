import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { isRateLimited, resetAttempts, getClientIp } from '@/lib/rateLimit'
import bcrypt from 'bcryptjs'

const MAX_ATTEMPTS = 5
const WINDOW_MS = 60 * 1000

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials, req) {
        const ipKey = `ip:${getClientIp(req)}`
        const emailKey = `email:${credentials?.email}`

        if (isRateLimited(ipKey, MAX_ATTEMPTS, WINDOW_MS) || isRateLimited(emailKey, MAX_ATTEMPTS, WINDOW_MS)) {
          throw new Error('Terlalu banyak percobaan login. Coba lagi dalam 60 detik.')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials!.email },
        })

        if (!user) {
          // Pesan generik untuk mencegah user enumeration;
          // rate limit tetap menangani brute force.
          throw new Error('Email atau password salah')
        }

        const isValid = await bcrypt.compare(credentials!.password, user.password)

        if (!isValid) {
          throw new Error('Email atau password salah')
        }

        resetAttempts(ipKey)
        resetAttempts(emailKey)

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          role: user.role,
        }
      },
    }),
  ],

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 jam — cukup untuk admin, menurunkan risiko session hijack
  },

  pages: {
    signIn: '/admin/login',
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as { role?: string }).role
      }
      return token
    },

    async session({ session, token }) {
      if (session.user) {
        (session.user as { role?: string }).role = token.role as string
      }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}
