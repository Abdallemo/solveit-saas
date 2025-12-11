"use client";

import { ChevronDown, ChevronUp, MoreHorizontal, Search } from "lucide-react";
import { Fragment, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserRoleType } from "@/drizzle/schemas";
import {
  activeUser,
  allModeratorsType,
  allUsersType,
  updatUserRoleByid,
} from "@/features/users/server/actions";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

const roles: { value: UserRoleType; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "POSTER", label: "Poster" },
  { value: "SOLVER", label: "Solver" },
];

export default function ModeratorsPageComponent({
  modertors,
}: {
  modertors: allModeratorsType;
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const router = useRouter();
  const [hasChanges, setHasChanges] = useState(false);

  const [userData, setUserData] = useState(modertors);
  const [modifiedUsers, setModifiedUsers] = useState<
    Record<string, Partial<allUsersType[0]>>
  >({});

  const filteredUsers = userData
    .filter(
      (user) =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === "" || user.role === selectedRole),
    )
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const dateA = new Date(a.createdAt!).getTime();
      const dateB = new Date(b.createdAt!).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const handleSaveChanges = async () => {
    try {
      for (const userId in modifiedUsers) {
        const updates = modifiedUsers[userId];
        if (updates.role) {
          await updatUserRoleByid(userId, updates.role as UserRoleType);
        }
        if (updates.emailVerified) {
          await activeUser(userId, updates.emailVerified);
        }
      }

      setModifiedUsers({});

      setHasChanges(false);
      toast.success("Successfully saved changes.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes.");
    }
  };
  const undoChanges = () => {
    // setUserData(modertors);
    setModifiedUsers({});

    setHasChanges(false);
  };
  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
          <p className="text-muted-foreground">
            Manage your users and their permissions
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2 mb-6 justify-between">
        <div className="flex items-center space-x-2 mb-6">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        {hasChanges && (
          <div className="flex justify-end mt-4 gap-2">
            <Button variant={"secondary"} onClick={undoChanges}>
              Undo
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>

              <TableHead>Availability</TableHead>
              <TableHead>Cases</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last Active</TableHead>
              <TableHead>Stats</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <Fragment key={user.id}>
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="size-6">
                        <AvatarFallback>
                          {user.name?.[0]?.toUpperCase()}
                        </AvatarFallback>
                        <AvatarImage src={user.image!} />
                      </Avatar>
                      <div>
                        <div className="font-medium">{user.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant={"success"} onClick={() => {}}>
                      Active
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => router.push(`/moderator/${user.id}/cases`)}
                    >
                      {user.Cases}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {new Date(user.createdAt!).toLocaleDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm">
                      {user.createdAt.toDateString()}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="link"
                      className="p-0 h-auto font-medium"
                      onClick={() => router.push(`/moderator/${user.id}/stats`)}
                    >
                      View Stats
                    </Button>
                  </TableCell>

                  <TableCell className="text-center flex items-center justify-end gap-2">
                    {/* Collapse Toggle */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(user.id)}
                      className="p-0"
                    >
                      {expandedRows[user.id] ? <ChevronUp /> : <ChevronDown />}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`Reassigning ${user.name}...`)
                          }
                        >
                          Remove / Reassign from Dispute
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/moderator/${user.id}/audit`)
                          }
                        >
                          View Audit Log
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            toast.info(`Notifying ${user.name}...`)
                          }
                        >
                          Send Notification
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => router.push(`/moderator/${user.id}`)}
                        >
                          View Profile
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>

                {expandedRows[user.id] &&
                  user.disputes?.length > 0 &&
                  user.disputes.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell colSpan={7} className="p-4">
                        <div className="space-y-2">
                          <div
                            key={d.id}
                            className="flex justify-between items-center border p-2 rounded-md"
                          >
                            <div>
                              #{d.id.slice(-8)} ({d.refundStatus})
                            </div>
                            <div className="space-x-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  toast.info(`Reassigning dispute ${d.id}...`)
                                }
                              >
                                Reassign
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() =>
                                  toast.error(
                                    `Removed dispute ${d.id} from ${user.name}`,
                                  )
                                }
                              >
                                Remove
                              </Button>
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {userData.length} users
        </div>
      </div>
    </div>
  );
}
