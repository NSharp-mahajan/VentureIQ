"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Users, UserPlus, Settings, Activity as ActivityIcon, Loader2, Mail, Shield, UserX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function WorkspaceDetailPage() {
  const params = useParams();
  const id = params.id as string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [workspace, setWorkspace] = useState<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [members, setMembers] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [invitations, setInvitations] = useState<any[]>([]);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [activities, setActivities] = useState<any[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isInviting, setIsInviting] = useState(false);

  useEffect(() => {
    const fetchWorkspaceData = async () => {
      try {
        const [wsRes, membersRes, invitesRes, activitiesRes] = await Promise.all([
          fetch(`/api/workspaces/${id}`),
          fetch(`/api/workspaces/${id}/members`),
          fetch(`/api/workspaces/${id}/invitations`),
          fetch(`/api/workspaces/${id}/activity`),
        ]);
        
        setWorkspace(await wsRes.json());
        setMembers(await membersRes.json());
        setInvitations(await invitesRes.json());
        setActivities(await activitiesRes.json());
      } catch (error) {
        toast.error("Failed to load workspace data");
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkspaceData();
  }, [id]);

  const refreshWorkspaceData = async () => {
    try {
      const [wsRes, membersRes, invitesRes, activitiesRes] = await Promise.all([
        fetch(`/api/workspaces/${id}`),
        fetch(`/api/workspaces/${id}/members`),
        fetch(`/api/workspaces/${id}/invitations`),
        fetch(`/api/workspaces/${id}/activity`),
      ]);
      
      setWorkspace(await wsRes.json());
      setMembers(await membersRes.json());
      setInvitations(await invitesRes.json());
      setActivities(await activitiesRes.json());
    } catch (error) {
      toast.error("Failed to load workspace data");
    }
  };

  const handleInvite = async () => {
    if (!inviteEmail) return;
    setIsInviting(true);
    try {
      const res = await fetch(`/api/workspaces/${id}/invitations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail }),
      });
      if (res.ok) {
        toast.success("Invitation sent");
        setInviteEmail("");
        refreshWorkspaceData();
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (error) {
      toast.error("Error sending invitation");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRevokeInvite = async (invitationId: string) => {
    try {
      const res = await fetch(`/api/workspaces/${id}/invitations?invitationId=${invitationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Invitation revoked");
        refreshWorkspaceData();
      }
    } catch (error) {
      toast.error("Failed to revoke invitation");
    }
  };

  const handleUpdateRole = async (targetUserId: string, role: string) => {
    try {
      const res = await fetch(`/api/workspaces/${id}/members`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId, role }),
      });
      if (res.ok) {
        toast.success("Role updated");
        refreshWorkspaceData();
      } else {
        const err = await res.text();
        toast.error(err || "Failed to update role");
      }
    } catch (error) {
      toast.error("Error updating role");
    }
  };

  const handleRemoveMember = async (targetUserId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`/api/workspaces/${id}/members?targetUserId=${targetUserId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        toast.success("Member removed");
        refreshWorkspaceData();
      } else {
        const err = await res.text();
        toast.error(err || "Failed to remove member");
      }
    } catch (error) {
      toast.error("Error removing member");
    }
  };

  if (isLoading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!workspace || workspace.error) {
    return <div className="p-8 text-center text-destructive">Workspace not found or access denied.</div>;
  }

  const isAdminOrOwner = workspace.role === "OWNER" || workspace.role === "ADMIN";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold font-heading">{workspace.name}</h1>
          <Badge variant={workspace.role === "OWNER" ? "default" : "secondary"}>{workspace.role}</Badge>
        </div>
        <p className="text-muted-foreground mt-2">{workspace.description || "No description provided."}</p>
      </div>

      <Tabs defaultValue="members" className="w-full">
        <TabsList className="mb-6 bg-secondary/50 p-1 w-full sm:w-auto overflow-x-auto flex justify-start h-auto">
          <TabsTrigger value="members" className="py-2"><Users className="w-4 h-4 mr-2"/> Members</TabsTrigger>
          {isAdminOrOwner && <TabsTrigger value="invitations" className="py-2"><Mail className="w-4 h-4 mr-2"/> Invitations</TabsTrigger>}
          <TabsTrigger value="activity" className="py-2"><ActivityIcon className="w-4 h-4 mr-2"/> Activity Feed</TabsTrigger>
          {isAdminOrOwner && <TabsTrigger value="settings" className="py-2"><Settings className="w-4 h-4 mr-2"/> Settings</TabsTrigger>}
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workspace Members</CardTitle>
              <CardDescription>Manage who has access to this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {members.map((member) => (
                  <div key={member.userId} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarFallback><Users className="w-4 h-4"/></AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{member.userId === workspace.ownerId ? "Workspace Creator" : `User ID: ${member.userId.substring(0,8)}...`}</p>
                        <p className="text-xs text-muted-foreground">Joined {formatDistanceToNow(new Date(member.joinedAt))} ago</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {isAdminOrOwner && member.role !== "OWNER" ? (
                        <Select defaultValue={member.role} onValueChange={(val) => handleUpdateRole(member.userId, val)}>
                          <SelectTrigger className="w-[110px] h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="MEMBER">Member</SelectItem>
                            <SelectItem value="ADMIN">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge variant="outline">{member.role}</Badge>
                      )}
                      
                      {isAdminOrOwner && member.role !== "OWNER" && (
                        <Button variant="ghost" size="icon" className="text-destructive h-8 w-8" onClick={() => handleRemoveMember(member.userId)}>
                          <UserX className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdminOrOwner && (
          <TabsContent value="invitations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invite New Members</CardTitle>
                <CardDescription>Send an invitation email for users to join your workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-3">
                  <Input 
                    placeholder="Enter email address" 
                    value={inviteEmail} 
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="max-w-md"
                  />
                  <Button onClick={handleInvite} disabled={isInviting || !inviteEmail}>
                    {isInviting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                    Send Invite
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pending Invitations</CardTitle>
              </CardHeader>
              <CardContent>
                {invitations.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No pending invitations.</p>
                ) : (
                  <div className="space-y-3">
                    {invitations.map((inv) => (
                      <div key={inv._id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Mail className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{inv.email}</span>
                          <Badge variant="secondary" className="text-[10px]">{inv.status}</Badge>
                        </div>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleRevokeInvite(inv._id)}>
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Activity Feed</CardTitle>
              <CardDescription>Recent events in this workspace.</CardDescription>
            </CardHeader>
            <CardContent>
              {activities.length === 0 ? (
                <p className="text-muted-foreground text-sm">No recent activity.</p>
              ) : (
                <div className="space-y-4">
                  {activities.map((activity) => (
                    <div key={activity._id} className="flex gap-4 p-4 rounded-lg bg-secondary/20">
                      <div className="mt-0.5">
                        <Shield className="w-5 h-5 text-indigo-500" />
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-semibold text-foreground">User {activity.userId.substring(0,6)}</span>{" "}
                          <span className="text-muted-foreground">{activity.action}</span>
                          {activity.metadata?.companyName && (
                            <span className="font-medium text-foreground"> {activity.metadata.companyName}</span>
                          )}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(activity.createdAt))} ago
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {isAdminOrOwner && (
          <TabsContent value="settings">
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive">Danger Zone</CardTitle>
                <CardDescription>Irreversible actions for your workspace.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="gap-2">
                  <Trash2 className="w-4 h-4" /> Delete Workspace
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  Deleting this workspace will remove all members and permanently orphan all associated reports.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
