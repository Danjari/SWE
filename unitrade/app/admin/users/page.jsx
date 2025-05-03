"use client"

import { useState } from "react"
import { Ban, Eye, Search, X, Check, AlertTriangle, History, ShoppingBag, Flag } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ModeToggle } from "@/components/mode-toggle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {users} from "@/lib/dummydata"


export default function UserManagement() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState(users[0] || null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isBanDialogOpen, setIsBanDialogOpen] = useState(false)
  const [userList, setUserList] = useState(users)
  const [showSuccessBanner, setShowSuccessBanner] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")

  const filteredUsers = userList.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const handleBanUser = () => {
    setUserList(
      userList.map((user) =>
        user.id === selectedUser?.id ? { ...user, status: user.status === "Banned" ? "Active" : "Banned" } : user,
      ),
    )
    setIsBanDialogOpen(false)
    setSuccessMessage(`User ${selectedUser?.status === "Banned" ? "unbanned" : "banned"} successfully`)
    setShowSuccessBanner(true)
    setTimeout(() => setShowSuccessBanner(false), 3000)
  }

  const getFlagSeverity = (count) => {
    if (count === 0) return "text-green-500"
    if (count <= 2) return "text-amber-500"
    return "text-red-500"
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {showSuccessBanner && (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-lg bg-green-100 px-4 py-2 text-green-800 dark:bg-green-900 dark:text-green-100">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4" />
            {successMessage}
          </div>
          <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setShowSuccessBanner(false)}>
            <X className="h-3 w-3" />
          </Button>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage users and review reported accounts</p>
        </div>
        <ModeToggle />
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Users</CardTitle>
              <CardDescription>{filteredUsers.length} users registered on the platform</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search users..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Email</TableHead>
                  <TableHead className="hidden md:table-cell">Role</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.department}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{user.email}</TableCell>
                      <TableCell className="hidden md:table-cell">{user.role}</TableCell>
                      <TableCell>
                        <div className={`flex items-center gap-1 ${getFlagSeverity(user.flagCount)}`}>
                          <Flag className="h-4 w-4" />
                          <span>{user.flagCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "outline" : "destructive"}>{user.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsProfileOpen(true)
                            }}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View
                          </Button>
                          <Button
                            variant={user.status === "Banned" ? "outline" : "destructive"}
                            size="sm"
                            onClick={() => {
                              setSelectedUser(user)
                              setIsBanDialogOpen(true)
                            }}
                          >
                            <Ban className="mr-2 h-4 w-4" />
                            {user.status === "Banned" ? "Unban" : "Ban"}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Profile Dialog */}
      <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>User Profile</DialogTitle>
            <DialogDescription>Detailed information about the selected user</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="mt-4 space-y-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{selectedUser.name}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={selectedUser.status === "Active" ? "outline" : "destructive"}>
                      {selectedUser.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Joined {format(selectedUser.joinDate, "MMM d, yyyy")}
                    </p>
                  </div>
                </div>
              </div>

              {selectedUser.flagCount > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>User has been flagged {selectedUser.flagCount} times</AlertTitle>
                  <AlertDescription>
                    This user has received multiple reports. Review their activity carefully.
                  </AlertDescription>
                </Alert>
              )}

              <Tabs defaultValue="listings">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="listings">
                    <ShoppingBag className="mr-2 h-4 w-4" />
                    Listings
                  </TabsTrigger>
                  <TabsTrigger value="transactions">
                    <History className="mr-2 h-4 w-4" />
                    Transactions
                  </TabsTrigger>
                  <TabsTrigger value="reports">
                    <Flag className="mr-2 h-4 w-4" />
                    Reports
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="listings" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Title</TableHead>
                          <TableHead>Price</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.listings.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center">
                              No listings found
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedUser.listings.map((listing) => (
                            <TableRow key={listing.id}>
                              <TableCell className="font-medium">{listing.title}</TableCell>
                              <TableCell>{listing.price}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    listing.status === "Active"
                                      ? "outline"
                                      : listing.status === "Flagged"
                                        ? "destructive"
                                        : "secondary"
                                  }
                                >
                                  {listing.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="transactions" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Type</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Amount</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.transactions.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No transactions found
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedUser.transactions.map((transaction) => (
                            <TableRow key={transaction.id}>
                              <TableCell>
                                <Badge variant={transaction.type === "Sale" ? "outline" : "secondary"}>
                                  {transaction.type}
                                </Badge>
                              </TableCell>
                              <TableCell className="font-medium">{transaction.item}</TableCell>
                              <TableCell>{transaction.amount}</TableCell>
                              <TableCell>{format(transaction.date, "MMM d, yyyy")}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="reports" className="mt-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Reason</TableHead>
                          <TableHead>Item</TableHead>
                          <TableHead>Reported By</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {selectedUser.reports.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center">
                              No reports found
                            </TableCell>
                          </TableRow>
                        ) : (
                          selectedUser.reports.map((report) => (
                            <TableRow key={report.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4 text-amber-500" />
                                  <span>{report.reason}</span>
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{report.item}</TableCell>
                              <TableCell>{report.reportedBy}</TableCell>
                              <TableCell>{format(report.date, "MMM d, yyyy")}</TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter className="mt-6">
            <Button variant="outline" onClick={() => setIsProfileOpen(false)}>
              Close
            </Button>
            {selectedUser && (
              <Button
                variant={selectedUser.status === "Banned" ? "outline" : "destructive"}
                onClick={() => {
                  setIsProfileOpen(false)
                  setIsBanDialogOpen(true)
                }}
              >
                <Ban className="mr-2 h-4 w-4" />
                {selectedUser.status === "Banned" ? "Unban User" : "Ban User"}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Ban User Confirmation Dialog */}
      <Dialog open={isBanDialogOpen} onOpenChange={setIsBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedUser?.status === "Banned" ? "Unban User" : "Ban User"}</DialogTitle>
            <DialogDescription>
              {selectedUser?.status === "Banned"
                ? "Are you sure you want to unban this user? They will regain access to the marketplace."
                : "Are you sure you want to ban this user? They will lose access to the marketplace."}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4">
            {selectedUser && (
              <div className="flex items-start space-x-4">
                <Avatar>
                  <AvatarImage src={selectedUser.avatar} alt={selectedUser.name} />
                  <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{selectedUser.name}</h4>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.flagCount > 0 && (
                    <p className="text-sm text-red-500 mt-1">Flagged {selectedUser.flagCount} times</p>
                  )}
                </div>
              </div>
            )}
          </div>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsBanDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant={selectedUser?.status === "Banned" ? "default" : "destructive"} onClick={handleBanUser}>
              {selectedUser?.status === "Banned" ? "Unban User" : "Ban User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

