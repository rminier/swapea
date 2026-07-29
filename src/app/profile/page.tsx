import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ProfileBasePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.username) {
    if (!session) {
      redirect("/auth/login?callbackUrl=/profile");
    }
    // If logged in but no username (unlikely if signup is mandatory), 
    // maybe go to edit profile to set one
    redirect("/profile/edit");
  }

  redirect(`/profile/${session.user.username}`);
}
