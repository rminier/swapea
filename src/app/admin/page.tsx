"use client";

import { useQuery } from "@tanstack/react-query";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ShieldAlert, Trash2 } from "lucide-react";

export default function AdminDashboard() {
  const { data: listings, isLoading: listingsLoading, refetch } = useQuery({
    queryKey: ["admin", "listings"],
    queryFn: async () => {
      const res = await fetch("/api/admin/listings");
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
  });

  const handleAction = async (action: string, id: string) => {
    try {
      const res = await fetch("/api/admin/actions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, id }),
      });
      if (!res.ok) throw new Error("Failed action");
      toast.success(`Action ${action} completed`);
      refetch();
    } catch {
      toast.error("Action failed");
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex items-center gap-3 mb-8">
        <ShieldAlert className="w-8 h-8 text-red-500" />
        <h1 className="text-3xl font-bold tracking-tight">Admin Moderation</h1>
      </div>

      <Tabs defaultValue="listings">
        <TabsList className="mb-6">
          <TabsTrigger value="listings">Listings</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>
        
        <TabsContent value="listings" className="bg-card/50 border border-border/50 rounded-lg p-6 shadow-sm">
          {listingsLoading ? (
            <div className="p-8 flex justify-center"><div className="animate-spin w-8 h-8 rounded-full border-b-2 border-primary"></div></div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Listing</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Reports</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {listings?.map((listing: { id: string; title: string; images: string[]; softDeleted: boolean; user: { name: string }; _count: { reports: number } }) => (
                  <TableRow key={listing.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={listing.images[0]} alt="" className="w-10 h-10 rounded object-cover" />
                        <span className="line-clamp-1">{listing.title}</span>
                      </div>
                    </TableCell>
                    <TableCell>{listing.user.name}</TableCell>
                    <TableCell>
                      {listing.softDeleted ? (
                        <Badge variant="destructive">Deleted</Badge>
                      ) : (
                        <Badge variant="outline" className="text-green-500 bg-green-500/10">Active</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={listing._count.reports > 0 ? "destructive" : "secondary"}>
                        {listing._count.reports}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {!listing.softDeleted && (
                        <Button variant="destructive" size="sm" onClick={() => handleAction("delete_listing", listing.id)}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Soft Delete
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
