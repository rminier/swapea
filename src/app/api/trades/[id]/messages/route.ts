import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { z } from "zod";

const messageSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { content } = messageSchema.parse(body);

    const trade = await prisma.trade.findUnique({
      where: { id },
      include: { offer: true },
    });

    if (!trade) {
      return NextResponse.json({ error: "Trade not found" }, { status: 404 });
    }

    // Verify user is part of the trade
    const targetListing = await prisma.listing.findUnique({ where: { id: trade.offer.targetListingId } });
    if (session.user.id !== trade.offer.proposingUserId && session.user.id !== targetListing?.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        tradeId: id,
        senderId: session.user.id,
        content,
      },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      }
    });

    // Create notification for the other participant
    try {
      const recipientId = session.user.id === trade.offer.proposingUserId 
        ? targetListing?.userId 
        : trade.offer.proposingUserId;

      if (recipientId) {
        await prisma.notification.create({
          data: {
            userId: recipientId,
            type: "CHAT_MESSAGE",
            content: `New message in trade room: "${content.substring(0, 30)}${content.length > 30 ? "..." : ""}"`,
            link: `/trades/${id}`,
          }
        });
      }
    } catch (notifErr) {
      console.warn("Failed to create message notification:", notifErr);
    }

    // Trigger pusher event
    try {
      await pusherServer.trigger(`trade-${id}`, "new-message", message);
    } catch (pusherError) {
      console.warn("Pusher failed to trigger, continuing...", pusherError);
    }

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error("Message creation error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: { tradeId: id },
      include: {
        sender: { select: { id: true, name: true, image: true } }
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Fetch messages error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
