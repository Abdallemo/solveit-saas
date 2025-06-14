"use client";

import {
  MoreHorizontal,
  Plus,
  Search,
  UserCheck,
  UserX,
  Check,
  ChevronsUpDown,
  ArrowUpDown,
} from "lucide-react";
import { useState } from "react";

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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  allUsersType,
  updatUserRoleByid,
  DeleteUserFromDb,
} from "../../server/actions";
import { UserRoleType } from "@/drizzle/schemas";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

const roles: { value: UserRoleType; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "MODERATOR", label: "Moderator" },
  { value: "POSTER", label: "Poster" },
  { value: "SOLVER", label: "Solver" },
];

export default function UserPageComponent({ users }: { users: allUsersType }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [roleOpen, setRoleOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc" | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [userData, setUserData] = useState(users);
  const [modifiedUsers, setModifiedUsers] = useState<
    Record<string, Partial<allUsersType[0]>>
  >({});
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const filteredUsers = userData
    .filter(
      (user) =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedRole === "" || user.role === selectedRole)
    )
    .sort((a, b) => {
      if (!sortOrder) return 0;
      const dateA = new Date(a.createdAt!).getTime();
      const dateB = new Date(b.createdAt!).getTime();
      return sortOrder === "asc" ? dateA - dateB : dateB - dateA;
    });

  const getStatusBadge = (verified: Date | null) =>
    verified ? (
      <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
        Verified
      </Badge>
    ) : (
      <Badge variant="outline">Unverified</Badge>
    );

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge variant="destructive">Admin</Badge>;
      case "MODERATOR":
        return (
          <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
            Moderator
          </Badge>
        );
      case "POSTER":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
            Poster
          </Badge>
        );
      case "SOLVER":
        return <Badge variant="outline">Solver</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  const handleRoleChange = (userId: string, newRole: UserRoleType) => {
    setUserData((prev) =>
      prev.map((user) =>
        user.id === userId ? { ...user, role: newRole } : user
      )
    );

    setModifiedUsers((prev) => ({
      ...prev,
      [userId]: {
        ...(prev[userId] || {}),
        role: newRole,
      },
    }));

    setHasChanges(true);
  };

  const handleUserDelete = (userId: string) => {
    setUserData((prev) => prev.filter((user) => user.id !== userId));
    setDeletedUserIds((prev) => [...prev, userId]);
    setHasChanges(true);
  };

  const handleSaveChanges = async () => {
    try {
      for (const userId in modifiedUsers) {
        const updates = modifiedUsers[userId];
        if (updates.role) {
          await updatUserRoleByid(userId, updates.role as UserRoleType);
        }
      }

      for (const userId of deletedUserIds) {
        await DeleteUserFromDb(userId);
      }

      setModifiedUsers({});
      setDeletedUserIds([]);
      setHasChanges(false);
      toast.success("Successfully saved changes.");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save changes.");
    }
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

          <Popover open={roleOpen} onOpenChange={setRoleOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={roleOpen}
                className="w-[200px] justify-between">
                {selectedRole
                  ? roles.find((role) => role.value === selectedRole)?.label
                  : "Filter by role..."}
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search role..." />
                <CommandList>
                  <CommandEmpty>No role found.</CommandEmpty>
                  <CommandGroup>
                    <CommandItem
                      value=""
                      onSelect={() => {
                        setSelectedRole("");
                        setRoleOpen(false);
                      }}>
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4",
                          selectedRole === "" ? "opacity-100" : "opacity-0"
                        )}
                      />
                      All roles
                    </CommandItem>
                    {roles.map((role) => (
                      <CommandItem
                        key={role.value}
                        value={role.value}
                        onSelect={(currentValue) => {
                          setSelectedRole(
                            currentValue === selectedRole ? "" : currentValue
                          );
                          setRoleOpen(false);
                        }}>
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedRole === role.value
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {role.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
        {hasChanges && (
          <div className="flex justify-end mt-4">
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </div>
        )}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="hidden lg:table-cell">Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-sm font-medium">
                        {user.name
                          ?.split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {user.email}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Select
                    value={user.role ?? undefined}
                    onValueChange={(value) =>
                      handleRoleChange(user.id, value as UserRoleType)
                    }>
                    <SelectTrigger className="w-[130px] h-8 border-0 bg-transparent p-0 focus:ring-0">
                      <SelectValue>{getRoleBadge(user.role ?? "")}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          <div className="flex items-center">
                            {getRoleBadge(role.value)}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>{getStatusBadge(user.emailVerified)}</TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {user.createdAt
                    ? new Date(user.createdAt).toLocaleDateString()
                    : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem>View profile</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setHasChanges(true)}>
                        <UserCheck className="mr-2 h-4 w-4" />
                        Activate user
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setHasChanges(true)}>
                        <UserX className="mr-2 h-4 w-4" />
                        Deactivate user
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => setUserToDelete(user.id)}>
                        Delete user
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <AlertDialog
        open={userToDelete !== null}
        onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this
              user.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)} className="cursor-pointer" >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
            className="bg-destructive hover:cursor-pointer text-white shadow-xs hover:bg-destructive/80 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60"
              onClick={() => {
                if (userToDelete) {
                  handleUserDelete(userToDelete);
                  setUserToDelete(null);
                }
              }}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          Showing {filteredUsers.length} of {userData.length} users
        </div>
      </div>
    </div>
  );
}
