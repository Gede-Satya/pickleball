import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const body = await req.json();

  // Cegah menjadikan node sebagai parent dari dirinya sendiri
  if (body.parentId === params.id) {
    return NextResponse.json(
      { error: "Tidak bisa menjadikan diri sendiri sebagai atasan" },
      { status: 400 }
    );
  }

  const updated = await prisma.orgStructure.update({
    where: { id: params.id },
    data: {
      name: body.name,
      position: body.position,
      order: body.order ?? 0,
      parentId: body.parentId || null,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await prisma.orgStructure.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}