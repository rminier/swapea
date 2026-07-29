import { ListingForm } from "@/components/listing-form";

export const metadata = {
  title: "Create a Listing | Swapea",
  description: "List your item for trade",
};

export default function NewListingPage() {
  return (
    <div className="container py-10 md:py-16 mx-auto px-4">
      <ListingForm />
    </div>
  );
}
