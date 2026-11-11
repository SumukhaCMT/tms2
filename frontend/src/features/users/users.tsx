import { ShoppingCart } from "lucide-react"
import { Link } from "react-router-dom"

import { TableBody, TableRow, TableCell } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { RowAction, RowActions } from "@/components/row-actions"
import { Checkbox } from "@/components/ui/checkbox"
import { BulkActionBar } from "@/components/bulk-action-bar"
import { useRowSelection } from "@/hooks/useRowSelection"
import { ListToolbar } from "@/components/ui/list-toolbar"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

import { useUsersList } from "./useUsersList"
import { RecordCard, RecordCardGrid } from "@/components/ui/record-card"
import { StatusSelect } from "@/components/ui/status-select"

export default function Users() {
  const {
    users,
    limit,
    limitReached,
    statuses,
    isLoading,
    currentPage,
    view,
    setView,
    updatingId,
    totalPages,
    startIndex,
    endIndex,
    currentUsers,
    handlePageChange,
    handlePrevPage,
    handleNextPage,
    handleStatusChange,
    handleDelete,
    handleBulkDelete,
    search,
    handleSearch,
  } = useUsersList()
  const selection = useRowSelection(currentUsers.map((user) => user.id))

  async function deleteSelected() {
    if (await handleBulkDelete(selection.selectedIds)) selection.clear()
  }

  return (
    <div className="w-full space-y-4">
      <ListToolbar
        title="Users"
        actions={
          <>
            {limitReached ? (
              <Tooltip>
                <TooltipTrigger render={<span tabIndex={0} className="inline-flex cursor-not-allowed" />}>
                  <Button disabled>Add User</Button>
                </TooltipTrigger>
                <TooltipContent>User limit exceeded. Delete a user or buy more users.</TooltipContent>
              </Tooltip>
            ) : (
              <Button render={<Link to="/users/add" />}>Add User</Button>
            )}

            <Button variant="outline" render={<Link to="/org-user-permissions" />}>
              User Permissions
            </Button>

            {limit && limitReached && (
              <Button variant="outline" render={<Link to="/plans" />}>
                <ShoppingCart /> Buy Users
              </Button>
            )}
          </>
        }
        onSearch={handleSearch}
        searchPlaceholder="Search users..."
        view={view}
        onViewChange={setView}
      />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      )}

      {!isLoading && users.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed py-16 text-center">
          <p className="text-sm font-medium">{search ? "No matching users" : "No users created yet"}</p>
          <p className="mt-1 text-sm text-muted-foreground">{search ? "Try a different search term." : "Users you create for your temples will show up here."}</p>
        </div>
      )}

      {!isLoading && users.length > 0 && (
        <>
          <BulkActionBar count={selection.selectedIds.length} onClear={selection.clear} onDelete={() => void deleteSelected()} />
          {view === "list" && (
            <ResizableTable
              columns={[
                { id: "select", label: <Checkbox checked={selection.allChecked} indeterminate={selection.someChecked} onCheckedChange={selection.toggleAll} aria-label="Select all" />, size: 4, minSize: 3 },
                { id: "sl-no", label: "Sl.no", size: 5 },
                { id: "user-code", label: "User Code", size: 10 },
                { id: "name", label: "Name", size: 10 },
                { id: "temple", label: "Temple", size: 10 },
                { id: "email", label: "Email", size: 10 },
                { id: "phone", label: "Phone", size: 10 },
                { id: "role", label: "Role", size: 10 },
                { id: "status", label: "Status", size: 10 },
                { id: "created", label: "Created", size: 10 },
                { id: "actions", label: "Actions", size: 10, className: "justify-end" },
              ]}
            >
              <TableBody>
                {currentUsers.map((user, index) => (
                  <TableRow key={user.id} data-state={selection.isSelected(user.id) ? "selected" : undefined}>
                    <TableCell>
                      <Checkbox checked={selection.isSelected(user.id)} onCheckedChange={() => selection.toggle(user.id)} aria-label="Select row" />
                    </TableCell>
                    <TableCell>{startIndex + index + 1}</TableCell>
                    <TableCell className="font-medium">{user.user_code}</TableCell>
                    <TableCell>{user.user_name}</TableCell>
                    <TableCell>{user.temp_name ?? "-"}</TableCell>
                    <TableCell>{user.user_email ?? "-"}</TableCell>
                    <TableCell>{user.user_phone ?? "-"}</TableCell>
                    <TableCell>{user.user_role}</TableCell>
                    <TableCell>
                      <StatusSelect value={user.user_status} options={statuses} disabled={updatingId === user.id} onChange={(status) => handleStatusChange(user, status)} />
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                    <TableCell>
                      <RowActions>
                        <RowAction type="view" title="View user" to={`/users/${user.id}`} />
                        <RowAction type="edit" title="Edit user" to={`/users/${user.id}/edit`} />
                        <RowAction type="delete" title="Delete user" onClick={() => handleDelete(user)} />
                      </RowActions>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </ResizableTable>
          )}

          {view === "grid" && (
            <RecordCardGrid>
              {currentUsers.map((user, index) => (
                <RecordCard
                  key={user.id}
                  index={startIndex + index + 1}
                  title={user.user_name}
                  subtitle={user.user_code}
                  badge={<StatusSelect value={user.user_status} options={statuses} disabled={updatingId === user.id} onChange={(status) => handleStatusChange(user, status)} />}
                  fields={[
                    { label: "Temple", value: user.temp_name ?? "-" },
                    { label: "Role", value: user.user_role },
                    { label: "Email", value: user.user_email ?? "-" },
                    { label: "Phone", value: user.user_phone ?? "-" },
                  ]}
                  actions={
                    <>
                      <RowAction type="view" title="View user" to={`/users/${user.id}`} />
                      <RowAction type="edit" title="Edit user" to={`/users/${user.id}/edit`} />
                      <RowAction type="delete" title="Delete user" onClick={() => handleDelete(user)} />
                    </>
                  }
                />
              ))}
            </RecordCardGrid>
          )}

          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, users.length)} of {users.length} users
            </div>
            <Pagination className="mx-0 w-auto">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      handlePrevPage()
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => (
                  <PaginationItem key={index + 1}>
                    <PaginationLink
                      href="#"
                      isActive={currentPage === index + 1}
                      onClick={(event) => {
                        event.preventDefault()
                        handlePageChange(index + 1)
                      }}
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault()
                      handleNextPage()
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </>
      )}
    </div>
  )
}
