import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Baris ajaib untuk menyelamatkan Prisma dari Turbopack
  serverExternalPackages: ["@prisma/client", "bcryptjs"], 
  experimental: {
    serverActions: { bodySizeLimit: "10mb" } // Tambahkan batas ukuran body untuk aksi server (misal untuk upload gambar)
  }
};

export default nextConfig;