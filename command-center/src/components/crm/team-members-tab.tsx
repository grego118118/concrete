"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { createTeamMember, updateTeamMember, deleteTeamMember } from "@/app/actions/team"
import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Pencil, Trash2, UserPlus } from "lucide-react"

interface TeamMember {
    id: string
    name: string | null
    email: string
    role: "ADMIN" | "TECHNICIAN" | "OFFICE"
}

interface TeamMembersTabProps {
    members: TeamMember[]
}

export function TeamMembersTab({ members }: TeamMembersTabProps) {
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
    const [isPending, startTransition] = useTransition()

    async function handleInvite(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            try {
                await createTeamMember(formData)
                toast.success("Team member invited successfully")
                setIsInviteOpen(false)
            } catch (error: any) {
                toast.error(error.message || "Failed to invite team member")
            }
        })
    }

    async function handleUpdate(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!editingMember) return

        const formData = new FormData(event.currentTarget)

        startTransition(async () => {
            try {
                await updateTeamMember(editingMember.id, formData)
                toast.success("Team member updated successfully")
                setEditingMember(null)
            } catch (error) {
                toast.error("Failed to update team member")
            }
        })
    }

    async function handleDelete(id: string) {
        startTransition(async () => {
            try {
                await deleteTeamMember(id)
                toast.success("Team member removed")
            } catch (error) {
                toast.error("Failed to remove team member")
            }
        })
    }

    function getInitials(name: string | null, email: string) {
        if (name) {
            return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        }
        return email.slice(0, 2).toUpperCase()
    }

    function getRoleBadgeColor(role: string) {
        switch (role) {
            case 'ADMIN': return 'bg-red-100 text-red-800'
            case 'OFFICE': return 'bg-blue-100 text-blue-800'
            case 'TECHNICIAN': return 'bg-green-100 text-green-800'
            default: return 'bg-gray-100 text-gray-800'
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Team Members</CardTitle>
                <CardDescription>Manage who has access to this workspace.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {members.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">
                        No team members yet. Invite your first team member below.
                    </p>
                ) : (
                    members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between space-x-4 p-3 rounded-lg border">
                            <div className="flex items-center space-x-4">
                                <Avatar>
                                    <AvatarFallback>{getInitials(member.name, member.email)}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-sm font-medium leading-none">{member.name || 'Unnamed'}</p>
                                    <p className="text-xs text-muted-foreground">{member.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                                    {member.role}
                                </span>

                                {/* Edit Button */}
                                <Dialog open={editingMember?.id === member.id} onOpenChange={(open) => !open && setEditingMember(null)}>
                                    <DialogTrigger asChild>
                                        <Button variant="ghost" size="icon" onClick={() => setEditingMember(member)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="p-0 sm:max-w-[425px]">
                                        <form onSubmit={handleUpdate} className="flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
                                            <DialogHeader className="p-6 pb-2 border-b text-left">
                                                <DialogTitle>Edit Team Member</DialogTitle>
                                                <DialogDescription>Update team member details.</DialogDescription>
                                            </DialogHeader>
                                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="edit-name">Name</Label>
                                                    <Input id="edit-name" name="name" defaultValue={member.name || ''} required />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-email">Email Address</Label>
                                                    <Input id="edit-email" name="email" type="email" defaultValue={member.email} required />
                                                </div>
                                                <div className="grid gap-2">
                                                    <Label htmlFor="edit-role">Role</Label>
                                                    <Select name="role" defaultValue={member.role}>
                                                        <SelectTrigger id="edit-role">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                                            <SelectItem value="OFFICE">Office</SelectItem>
                                                            <SelectItem value="TECHNICIAN">Technician</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <div className="p-6 pt-2 border-t bg-muted/50">
                                                <Button type="submit" className="w-full h-11" disabled={isPending}>
                                                    {isPending ? "Saving..." : "Save Changes"}
                                                </Button>
                                            </div>
                                        </form>
                                    </DialogContent>
                                </Dialog>

                                {/* Delete Button */}
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This will remove {member.name || member.email} from your team. This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(member.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                                Remove
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
            <CardFooter>
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline">
                            <UserPlus className="mr-2 h-4 w-4" />
                            Invite Team Member
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 sm:max-w-[425px]">
                        <form onSubmit={handleInvite} className="flex flex-col max-h-[100dvh] sm:max-h-[90vh]">
                            <DialogHeader className="p-6 pb-2 border-b text-left">
                                <DialogTitle>Invite Team Member</DialogTitle>
                                <DialogDescription>
                                    Add a new member to your team.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto p-6 space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" placeholder="John Doe" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" placeholder="john@example.com" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="role">Permission Level</Label>
                                    <Select name="role" defaultValue="TECHNICIAN">
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="ADMIN">Admin (Full Access)</SelectItem>
                                            <SelectItem value="OFFICE">Office (Scheduling & Billing)</SelectItem>
                                            <SelectItem value="TECHNICIAN">Technician (Job Management)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="p-6 pt-2 border-t bg-muted/50">
                                <Button type="submit" className="w-full h-11" disabled={isPending}>
                                    {isPending ? "Inviting..." : "Send Invite"}
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </CardFooter>
        </Card>
    )
}
