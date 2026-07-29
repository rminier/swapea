import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: { user: true }
  });

  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({
    ...listing,
    images: JSON.parse(listing.images as string),
    tags: JSON.parse(listing.tags as string),
  });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const listing = await prisma.listing.findUnique({ where: { id } });
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const updatedListing = await prisma.listing.update({
    where: { id },
    data: {
      ...body,
      // If updating arrays, stringify them
      images: body.images ? JSON.stringify(body.images) : undefined,
      tags: body.tags ? JSON.stringify(body.tags) : undefined,
    }
  });

  return NextResponse.json(updatedListing);
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const listing = await prisma.listing.findUnique({ where: { id } });
  
  if (!listing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (listing.userId !== session.user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Soft delete
  await prisma.listing.update({
    where: { id },
    data: { softDeleted: true }
  });

  return NextResponse.json({ success: true });
}
