import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Baris ajaib untuk menyelamatkan Prisma dari Turbopack
  serverExternalPackages: ["@prisma/client", "bcryptjs"], 
};

export default nextConfig;