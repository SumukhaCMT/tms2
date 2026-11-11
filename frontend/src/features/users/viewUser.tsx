import { useMemo, useState, type ReactNode } from "react"
import { ClipboardList, LogIn, Pencil } from "lucide-react"
import { Link } from "react-router-dom"

import DataPagination from "@/components/layout/DataPagination"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TableBody, TableCell, TableRow } from "@/components/ui/table"
import { ResizableTable } from "@/components/resizable-table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DetailColumns, DetailMessage, DetailPage, DetailSection, DetailStats } from "@/components/ui/detail-page"

import { useViewUser } from "./useViewUser"
import { capitalize, formatDateTime, formatModule, type ActivityLogRow, type UserActivity, type UserProfile } from "./usersTypes"

const PAGE_SIZE = 10

const STATUS_VARIANT = { active: "default", inactive: "secondary", suspended: "destructive" } as const

function DataTable({ headers, empty, children, count }: { headers: string[]; empty: string; children: ReactNode; count: number }) {
  if (!count) return <DetailMessage>{empty}</DetailMessage>
  return (
    <ResizableTable columns={headers.map((header) => ({ id: header, label: header, size: 10 }))}>
      <TableBody>{children}</TableBody>
    </ResizableTable>
  )
}

export default function ViewUser() {
  const { id, user, activity, loading } = useViewUser()

  return (
    <UserDetailsView
      user={user}
      activity={activity}
      isLoading={loading}
      empty="User not found."
      actions={
        <Button render={<Link to={`/users/${id}/edit`} />}>
          <Pencil /> Edit
        </Button>
      }
    />
  )
}

interface UserDetailsViewProps {
  user: UserProfile | null
  activity: UserActivity | null
  isLoading?: boolean
  empty?: string
  actions?: ReactNode
}

export function UserDetailsView({ user, activity, isLoading, empty = "Profile not found.", actions }: UserDetailsViewProps) {
  const initials = user ? user.user_name.split(" ").map((part) => part[0]).slice(0, 2).join("").toUpperCase() : ""
  const lastLogin = user && activity ? formatDateTime(user.user_last_login_at ?? activity.logins.find((login) => login.success)?.login_at ?? null) : "-"

  return (
    <DetailPage
      title={
        user ? (
          <span className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            {user.user_name}
          </span>
        ) : (
          "User Details"
        )
      }
      description={user ? `${user.user_code}${user.user_role_name ? ` · ${user.user_role_name}` : ""}` : "User profile and activity"}
      badges={user && <Badge variant={STATUS_VARIANT[user.user_status as keyof typeof STATUS_VARIANT] ?? "outline"}>{capitalize(user.user_status)}</Badge>}
      actions={user && actions}
      isLoading={isLoading}
      empty={(!user || !activity) && empty}
    >
      {user && activity && (
        <>
          <DetailStats
            items={[
              { label: "Records Created", value: activity.logs.length, icon: ClipboardList },
              { label: "Modules", value: new Set(activity.logs.map((log) => log.module)).size, icon: ClipboardList },
              { label: "Logins", value: activity.logins.length, icon: LogIn },
              { label: "Last Login", value: lastLogin, icon: LogIn },
            ]}
          />

          <DetailColumns
            aside={
              <>
                <DetailSection
                  title="Profile"
                  fields={[
                    { label: "Email", value: user.user_email, full: true },
                    { label: "Phone", value: user.user_phone },
                    { label: "Temple", value: user.temp_name },
                    { label: "Role", value: user.user_role_name },
                    { label: "Designation", value: user.designation_name },
                  ]}
                />
                <DetailSection
                  title="Record Information"
                  fields={[
                    { label: "Created", value: formatDateTime(user.created_at) },
                    { label: "Last Updated", value: formatDateTime(user.updated_at) },
                  ]}
                />
              </>
            }
          >
            <ActivityTabs activity={activity} />
          </DetailColumns>
        </>
      )}
    </DetailPage>
  )
}

function ActivityLog({ logs }: { logs: ActivityLogRow[] }) {
  const [module, setModule] = useState("all")
  const [page, setPage] = useState(1)
  const modules = useMemo(() => {
    const counts = new Map<string, number>()
    logs.forEach((log) => counts.set(log.module, (counts.get(log.module) ?? 0) + 1))
    return [...counts].sort((a, b) => b[1] - a[1])
  }, [logs])
  const rows = module === "all" ? logs : logs.filter((log) => log.module === module)
  const start = (page - 1) * PAGE_SIZE

  if (!logs.length) return <DetailMessage>No records created yet.</DetailMessage>

  return (
    <Tabs
      value={module}
      onValueChange={(value) => {
        setModule(String(value))
        setPage(1)
      }}
      className="gap-4"
    >
      <TabsList variant="line" className="max-w-full flex-wrap justify-start">
        {[["all", logs.length] as const, ...modules].map(([key, count]) => (
          <TabsTrigger key={key} value={key} className="flex-none cursor-pointer">
            {key === "all" ? "All" : formatModule(key)}
            <Badge variant="secondary" className="h-5 px-1.5 text-xs">{count}</Badge>
          </TabsTrigger>
        ))}
      </TabsList>
      <DataTable headers={["Sl.no", "Module", "Record", "Temple", "Created On"]} empty="" count={rows.length}>
        {rows.slice(start, start + PAGE_SIZE).map((log, index) => (
          <TableRow key={log.id}>
            <TableCell>{start + index + 1}</TableCell>
            <TableCell>{formatModule(log.module)}</TableCell>
            <TableCell className="font-medium">{log.reference ?? (log.record_id ? `#${log.record_id}` : "-")}</TableCell>
            <TableCell>{log.temp_name ?? "-"}</TableCell>
            <TableCell>{formatDateTime(log.created_at)}</TableCell>
          </TableRow>
        ))}
      </DataTable>
      {rows.length > PAGE_SIZE && (
        <DataPagination
          currentPage={page}
          totalPages={Math.ceil(rows.length / PAGE_SIZE)}
          totalItems={rows.length}
          pageSize={PAGE_SIZE}
          itemName="records"
          onPageChange={setPage}
        />
      )}
    </Tabs>
  )
}

function ActivityTabs({ activity }: { activity: UserActivity }) {
  const [loginPage, setLoginPage] = useState(1)
  const loginStart = (loginPage - 1) * PAGE_SIZE
  const hasTransfers = activity.transfers.length > 0

  return (
    <Tabs defaultValue="activity">
      <TabsList>
        <TabsTrigger value="activity">
          Activity Log <Badge variant="secondary" className="h-5 px-1.5 text-xs">{activity.logs.length}</Badge>
        </TabsTrigger>
        <TabsTrigger value="logins">
          Login History <Badge variant="secondary" className="h-5 px-1.5 text-xs">{activity.logins.length}</Badge>
        </TabsTrigger>
        {hasTransfers && (
          <TabsTrigger value="transfers">
            Temple Transfers <Badge variant="secondary" className="h-5 px-1.5 text-xs">{activity.transfers.length}</Badge>
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="activity">
        <DetailSection title="Activity Log" description="Records created by this user, grouped by module.">
          <ActivityLog logs={activity.logs} />
        </DetailSection>
      </TabsContent>

      {hasTransfers && (
        <TabsContent value="transfers">
          <DetailSection title="Temple Transfers" description="Temples this user has been moved between.">
            <DataTable headers={["Date", "From", "To", "Reason", "Transferred By"]} empty="" count={activity.transfers.length}>
              {activity.transfers.map((transfer) => (
                <TableRow key={transfer.id}>
                  <TableCell>{formatDateTime(transfer.transferred_at)}</TableCell>
                  <TableCell>{transfer.from_temple ?? "-"}</TableCell>
                  <TableCell className="font-medium">{transfer.to_temple ?? "-"}</TableCell>
                  <TableCell className="max-w-xs whitespace-normal">{transfer.transfer_reason ?? "-"}</TableCell>
                  <TableCell>{transfer.transferred_by ?? "-"}</TableCell>
                </TableRow>
              ))}
            </DataTable>
          </DetailSection>
        </TabsContent>
      )}

      <TabsContent value="logins">
        <DetailSection title="Login History" description="Last 100 login events.">
          <DataTable headers={["Date", "Status", "Event", "IP Address", "Device"]} empty="No login history." count={activity.logins.length}>
            {activity.logins.slice(loginStart, loginStart + PAGE_SIZE).map((login) => (
              <TableRow key={login.id}>
                <TableCell>{formatDateTime(login.login_at)}</TableCell>
                <TableCell>
                  {login.success ? <Badge>Success</Badge> : <Badge variant="destructive">{login.failure_reason ?? "Failed"}</Badge>}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{formatModule(login.event_type)}</Badge>
                </TableCell>
                <TableCell>{login.ip_address}</TableCell>
                <TableCell className="max-w-xs truncate text-muted-foreground" title={login.user_agent ?? ""}>
                  {login.user_agent ?? "-"}
                </TableCell>
              </TableRow>
            ))}
          </DataTable>
          {activity.logins.length > PAGE_SIZE && (
            <DataPagination
              currentPage={loginPage}
              totalPages={Math.ceil(activity.logins.length / PAGE_SIZE)}
              totalItems={activity.logins.length}
              pageSize={PAGE_SIZE}
              itemName="logins"
              onPageChange={setLoginPage}
            />
          )}
        </DetailSection>
      </TabsContent>
    </Tabs>
  )
}
