"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { requireAdminAction } from "@/lib/requireAdmin";

export async function deleteContact(id: string) {
  await requireAdminAction();
  await prisma.contact.delete({
    where: { id },
  });
  revalidatePath("/admin/contact");
}
