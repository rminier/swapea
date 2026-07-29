"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Camera, Link as LinkIcon, MapPin, Globe } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  username: z.string().min(3).regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  bio: z.string().max(500).optional(),
  location: z.string().optional(),
  website: z.string().url().or(z.literal("")).optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  linkedin: z.string().optional(),
  privacySettings: z.object({
    showEmail: z.boolean(),
    showLocation: z.boolean(),
    showTrades: z.boolean(),
  }),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface InitialProfileData {
  name?: string | null;
  username?: string | null;
  bio?: string | null;
  location?: string | null;
  website?: string | null;
  twitter?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  image?: string | null;
  privacySettings?: string | null;
}

export function EditProfileForm({ initialData }: { initialData: InitialProfileData }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialData.name || "",
      username: initialData.username || "",
      bio: initialData.bio || "",
      location: initialData.location || "",
      website: initialData.website || "",
      twitter: initialData.twitter || "",
      instagram: initialData.instagram || "",
      linkedin: initialData.linkedin || "",
      privacySettings: initialData.privacySettings ? JSON.parse(initialData.privacySettings) : {
        showEmail: false,
        showLocation: true,
        showTrades: true,
      },
    },
  });

  async function onSubmit(values: ProfileFormValues) {
    setIsLoading(true);
    try {
      const res = await fetch("/api/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      if (res.ok) {
        toast.success("Profile updated successfully!");
      } else {
        const error = await res.json();
        toast.error(error.error || "Update failed");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    // Placeholder for actual upload logic (Cloudinary/S3)
    setTimeout(() => {
      setIsUploading(false);
      toast.success("Avatar uploaded! (Simulation)");
    }, 2000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
        {/* Avatar Section */}
        <Card className="border-border/50 bg-card/30 backdrop-blur-md rounded-3xl overflow-hidden">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="relative">
                <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                  <AvatarImage src={initialData.image} />
                  <AvatarFallback className="text-2xl font-bold bg-muted">{initialData.name?.[0]}</AvatarFallback>
                </Avatar>
                <label className="absolute bottom-0 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                  <input type="file" className="hidden" onChange={handleAvatarUpload} accept="image/*" />
                </label>
                {isUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="space-y-1 text-center md:text-left">
                <h3 className="text-xl font-bold">Profile Picture</h3>
                <p className="text-sm text-muted-foreground">PNG, JPG or GIF. Max 5MB.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            {/* Basic Info */}
            <Card className="border-border/50 bg-card/30 rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading">Basic Information</CardTitle>
                <CardDescription>Tell the community who you are.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} className="rounded-xl bg-background/50 border-border/50" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                            <Input {...field} className="pl-8 rounded-xl bg-background/50 border-border/50" />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea {...field} className="min-h-[120px] rounded-2xl bg-background/50 border-border/50 resize-none" />
                      </FormControl>
                      <FormDescription>Max 500 characters.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} className="pl-10 rounded-xl bg-background/50 border-border/50" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Social & Web */}
            <Card className="border-border/50 bg-card/30 rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading">Web & Social</CardTitle>
                <CardDescription>Connect your online presence.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Personal Website</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input {...field} placeholder="https://yourwebsite.com" className="pl-10 rounded-xl bg-background/50 border-border/50" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="twitter"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Twitter</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="@username" className="pl-10 rounded-xl bg-background/50 border-border/50" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="instagram"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Instagram</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="@username" className="pl-10 rounded-xl bg-background/50 border-border/50" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="linkedin"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>LinkedIn</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input {...field} placeholder="https://linkedin.com/in/username" className="pl-10 rounded-xl bg-background/50 border-border/50" />
                          </div>
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <aside className="space-y-8">
            {/* Privacy Section */}
            <Card className="border-border/50 bg-card/30 rounded-3xl overflow-hidden">
              <CardHeader>
                <CardTitle className="font-heading text-lg">Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <FormField
                  control={form.control}
                  name="privacySettings.showEmail"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-2">
                      <div className="space-y-0.5">
                        <FormLabel>Public Email</FormLabel>
                        <FormDescription className="text-[10px]">Show your email on profile</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="privacySettings.showLocation"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-2">
                      <div className="space-y-0.5">
                        <FormLabel>Public Location</FormLabel>
                        <FormDescription className="text-[10px]">Show where you trade from</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="privacySettings.showTrades"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between p-2">
                      <div className="space-y-0.5">
                        <FormLabel>Public History</FormLabel>
                        <FormDescription className="text-[10px]">Show completed trade count</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Button type="submit" disabled={isLoading} className="w-full rounded-2xl py-6 text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 hover:scale-[1.02] transition-transform">
              {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Save Changes
            </Button>
          </aside>
        </div>
      </form>
    </Form>
  );
}
