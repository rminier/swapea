import { describe, it, expect } from "vitest";
import { z } from "zod";

// Shared validation schema
const listingSchema = z.object({
  title: z.string().min(3).max(100),
  description: z.string().min(10),
  category: z.string().min(1),
  condition: z.enum(["NEW", "LIKE_NEW", "GOOD", "FAIR", "POOR"]),
  location: z.string().min(2),
  images: z.array(z.string().url()).min(1),
  tags: z.array(z.string()).default([]),
});

describe("Listing Validation", () => {
  it("should validate a correct listing", () => {
    const validListing = {
      title: "Vintage Camera",
      description: "A very nice vintage camera in good condition.",
      category: "Electronics",
      condition: "GOOD",
      location: "New York, NY",
      images: ["https://example.com/image.jpg"],
    };

    const result = listingSchema.safeParse(validListing);
    expect(result.success).toBe(true);
  });

  it("should fail validation if title is too short", () => {
    const invalidListing = {
      title: "Hi", // < 3 chars
      description: "A very nice vintage camera in good condition.",
      category: "Electronics",
      condition: "GOOD",
      location: "New York, NY",
      images: ["https://example.com/image.jpg"],
    };

    const result = listingSchema.safeParse(invalidListing);
    expect(result.success).toBe(false);
  });

  it("should fail if no images are provided", () => {
    const invalidListing = {
      title: "Vintage Camera",
      description: "A very nice vintage camera in good condition.",
      category: "Electronics",
      condition: "GOOD",
      location: "New York, NY",
      images: [], // empty
    };

    const result = listingSchema.safeParse(invalidListing);
    expect(result.success).toBe(false);
  });
});
