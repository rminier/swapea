import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image } = await req.json();
    if (!image) {
      return NextResponse.json({ error: "No image payload provided" }, { status: 400 });
    }

    // Check if Cloudinary environment variables are configured
    const isCloudinaryConfigured = !!(
      (process.env.CLOUDINARY_URL || process.env.CLOUDINARY_API_KEY) &&
      (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || process.env.CLOUDINARY_CLOUD_NAME)
    );

    if (!isCloudinaryConfigured) {
      // Fallback demo response if Cloudinary credentials are not configured in local environment
      console.warn("Cloudinary credentials not set. Returning demo upload URL.");
      return NextResponse.json({
        url: image.startsWith("data:") 
          ? "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&q=80&w=600"
          : image,
        isDemoFallback: true,
      });
    }

    const uploadResult = await cloudinary.uploader.upload(image, {
      folder: "swapea_listings",
      resource_type: "image",
    });

    return NextResponse.json({ url: uploadResult.secure_url });
  } catch (error: unknown) {
    console.error("Cloudinary upload error:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
}
