import { EditProfileForm } from "@/components/profile/edit-profile-form";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function EditProfilePage() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/auth/login?callbackUrl=/profile/edit");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user) {
    return <div>User not found in database.</div>;
  }

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container max-w-5xl mx-auto px-4 space-y-10">
        <div>
          <h1 className="text-4xl font-black tracking-tight font-heading">Edit Profile</h1>
          <p className="text-lg text-muted-foreground mt-2">Manage your public presence and account settings.</p>
        </div>
        
        <EditProfileForm initialData={{
          ...user,
          privacySettings: typeof user.privacySettings === "string" ? user.privacySettings : JSON.stringify(user.privacySettings),
        }} />
      </div>
    </div>
  );
}
