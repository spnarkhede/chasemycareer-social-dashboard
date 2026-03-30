// app/dashboard/links/page.tsx
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Link as LinkIcon, BarChart3, QrCode, Share2, Edit, Trash2, Eye } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export default function LinksDashboard() {
  const [linkPages, setLinkPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newPage, setNewPage] = useState({
    username: "",
    displayName: "",
    bio: "",
  });

  useEffect(() => {
    loadLinkPages();
  }, []);

  async function loadLinkPages() {
    try {
      const response = await fetch("/api/links");
      const data = await response.json();
      setLinkPages(data);
    } catch (error) {
      toast.error("Failed to load link pages");
    } finally {
      setLoading(false);
    }
  }

  async function createLinkPage() {
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPage),
      });

      if (!response.ok) throw new Error("Failed to create");

      toast.success("Link page created!");
      setIsCreateDialogOpen(false);
      loadLinkPages();
      setNewPage({ username: "", displayName: "", bio: "" });
    } catch (error) {
      toast.error("Failed to create link page");
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    try {
      await fetch(`/api/links/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive }),
      });
      toast.success(isActive ? "Link page activated" : "Link page deactivated");
      loadLinkPages();
    } catch (error) {
      toast.error("Failed to update");
    }
  }

  async function deleteLinkPage(id: string) {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    
    try {
      await fetch(`/api/links/${id}`, { method: "DELETE" });
      toast.success("Link page deleted");
      loadLinkPages();
    } catch (error) {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Link Pages</h1>
          <p className="text-muted-foreground">
            Manage your Linktree-style pages for social media
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Create Link Page
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Link Page</DialogTitle>
              <DialogDescription>
                Create a public page with all your social media links
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username (URL)</Label>
                <div className="flex">
                  <span className="px-3 py-2 bg-muted rounded-l-md border border-r-0">
                    chasemycareer.com/
                  </span>
                  <Input
                    id="username"
                    placeholder="yourname"
                    value={newPage.username}
                    onChange={(e) => setNewPage({ ...newPage, username: e.target.value })}
                    className="rounded-l-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input
                  id="displayName"
                  placeholder="Your Name"
                  value={newPage.displayName}
                  onChange={(e) => setNewPage({ ...newPage, displayName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Input
                  id="bio"
                  placeholder="Tell people about yourself"
                  value={newPage.bio}
                  onChange={(e) => setNewPage({ ...newPage, bio: e.target.value })}
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={createLinkPage}>Create Page</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{linkPages.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {linkPages.reduce((acc, page) => acc + page.viewCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {linkPages.reduce((acc, page) => acc + page.clickCount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Link Pages Table */}
      <Card>
        <CardHeader>
          <CardTitle>Your Link Pages</CardTitle>
          <CardDescription>Manage and customize your public link pages</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Page</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Views</TableHead>
                <TableHead>Clicks</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {linkPages.map((page) => (
                <TableRow key={page.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {page.avatar && (
                        <img src={page.avatar} alt="" className="w-8 h-8 rounded-full" />
                      )}
                      <span className="font-medium">{page.displayName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm">/{page.username}</code>
                  </TableCell>
                  <TableCell>{page.viewCount.toLocaleString()}</TableCell>
                  <TableCell>{page.clickCount.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={page.isActive ? "default" : "secondary"}>
                      {page.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/${page.username}`} target="_blank">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/dashboard/links/${page.id}`}>
                          <Edit className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`/api/links/qr?username=${page.username}`} target="_blank">
                          <QrCode className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="icon" asChild>
                        <a href={`https://twitter.com/intent/tweet?text=Check out my links! ${process.env.NEXT_PUBLIC_APP_URL}/${page.username}`} target="_blank">
                          <Share2 className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleActive(page.id, !page.isActive)}
                      >
                        <Switch checked={page.isActive} className="scale-75" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteLinkPage(page.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {linkPages.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No link pages yet. Create your first one!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>💡 Pro Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Add your link page URL to all social media bios (Instagram, Twitter, TikTok, etc.)</li>
            <li>• Use UTM parameters to track which platform drives the most traffic</li>
            <li>• Schedule links to activate/deactivate automatically for campaigns</li>
            <li>• Share the QR code on business cards, presentations, or print materials</li>
            <li>• Customize themes to match your brand colors</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}