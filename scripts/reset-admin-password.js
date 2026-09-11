// scripts/reset-admin-password.js
// Mengganti password akun admin/super admin dari environment variables.
// Dipakai saat lupa password atau untuk rotasi password berkala:
//   RESET_ADMIN_EMAIL="admin@example.com" RESET_ADMIN_PASSWORD="pass_baru_kuat" node scripts/reset-admin-password.js
//
// Butuh env: RESET_ADMIN_EMAIL, RESET_ADMIN_PASSWORD.
// Aman dijalankan ulang: hanya mengubah password satu user; tidak menyentuh user lain.

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const email = process.env.RESET_ADMIN_EMAIL;
  const password = process.env.RESET_ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("RESET_ADMIN_EMAIL dan RESET_ADMIN_PASSWORD wajib diisi di environment.");
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("RESET_ADMIN_PASSWORD minimal 8 karakter.");
    process.exit(1);
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.error(`User dengan email ${email} tidak ditemukan.`);
    process.exit(1);
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { email },
    data: { password: hashedPassword },
  });

  console.log(`Password untuk ${email} (role: ${user.role}) berhasil diganti.`);
}

main()
  .catch((err) => {
    console.error("Gagal mengganti password:", err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());