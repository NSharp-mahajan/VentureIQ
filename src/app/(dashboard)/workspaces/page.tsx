"use client";

import { useState, useEffect } from "react";
import { Users, Plus, Loader2, Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface Workspace {
  _id: string;
  name: string;
  description: string;
  role: string;
  joinedAt: string;
}

interface Invitation {
  _id: string;
  workspaceId: {
    _id: string;
    name: string;
  };
  email: string;
  status: string;
}

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [wsRes, invRes] = await Promise.all([
          fetch("/api/workspaces"),
          fetch("/api/invitations/accept")
        ]);
        const wsData = await wsRes.json();
        const invData = await invRes.json();
        
        if (Array.isArray(wsData)) setWorkspaces(wsData);
        if (Array.isArray(invData)) setInvitations(invData);
      } catch (error) {
        toast.error("Failed to load workspaces");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const refreshData = async () => {
    try {
      const [wsRes, invRes] = await Promise.all([
        fetch("/api/workspaces"),
        fetch("/api/invitations/accept")
      ]);
      const wsData = await wsRes.json();
      const invData = await invRes.json();
      
      if (Array.isArray(wsData)) setWorkspaces(wsData);
      if (Array.isArray(invData)) setInvitations(invData);
    } catch (error) {
      toast.error("Failed to load workspaces");
    }
  };

  const handleCreate = async () => {
    if (!newName.trim()) return toast.error("Workspace name is required");
    setIsCreating(true);
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, description: newDesc }),
      });
      if (res.ok) {
        toast.success("Workspace created");
        setIsCreateOpen(false);
        setNewName("");
        setNewDesc("");
        refreshData();
      } else {
        toast.error("Failed to create workspace");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptInvite = async (invitationId: string) => {
    try {
      const res = await fetch("/api/invitations/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ invitationId }),
      });
      if (res.ok) {
        toast.success("Joined workspace!");
        refreshData();
      } else {
        toast.error("Failed to accept invitation");
      }
    } catch (error) {
      toast.error("An error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold font-heading flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Team Workspaces
          </h1>
          <p className="text-muted-foreground mt-2">
            Collaborate on VentureIQ reports with your team.
          </p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger render={<Button className="gap-2" />}>
            <Plus className="w-4 h-4" /> Create Workspace
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Workspace</DialogTitle>
              <DialogDescription>
                Set up a new shared environment for your team.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Workspace Name</label>
                <Input 
                  value={newName} 
                  onChange={(e) => setNewName(e.target.value)} 
                  placeholder="e.g., Q3 Due Diligence" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description (Optional)</label>
                <Textarea 
                  value={newDesc} 
                  onChange={(e) => setNewDesc(e.target.value)} 
                  placeholder="Briefly describe the purpose of this workspace..." 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
              <Button onClick={handleCreate} disabled={isCreating}>
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Create
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {invitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Pending Invitations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invitations.map((inv) => (
              <Card key={inv._id} className="border-indigo-500/20 bg-indigo-50/50 dark:bg-indigo-950/20">
                <CardHeader>
                  <CardTitle className="text-lg">{inv.workspaceId.name}</CardTitle>
                  <CardDescription>You have been invited to join this workspace.</CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-end gap-2">
                  <Button variant="outline" size="sm" className="text-destructive"><X className="w-4 h-4 mr-1"/> Decline</Button>
                  <Button size="sm" onClick={() => handleAcceptInvite(inv._id)}><Check className="w-4 h-4 mr-1"/> Accept</Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workspaces.map((ws) => (
          <Card key={ws._id} className="hover:border-primary/50 transition-colors flex flex-col h-full">
            <CardHeader>
              <div className="flex justify-between items-start">
                <CardTitle>{ws.name}</CardTitle>
                <Badge variant={ws.role === "OWNER" ? "default" : "secondary"}>{ws.role}</Badge>
              </div>
              <CardDescription className="line-clamp-2 mt-2">
                {ws.description || "No description provided."}
              </CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-6">
              <Link href={`/workspaces/${ws._id}`} className="w-full">
                <Button variant="outline" className="w-full gap-2">
                  Enter Workspace <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
        {workspaces.length === 0 && invitations.length === 0 && (
          <div className="col-span-full py-12 text-center border border-dashed rounded-xl bg-secondary/20">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium">No Workspaces Found</h3>
            <p className="text-muted-foreground mt-1 max-w-sm mx-auto">
              You are not a member of any workspaces yet. Create one to start collaborating!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
