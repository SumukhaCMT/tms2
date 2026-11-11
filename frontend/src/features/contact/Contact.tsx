import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { ResizableTable } from "@/components/resizable-table";
import DataPagination from "@/components/layout/DataPagination";
import { showCmtToast } from "@/components/ui/cmt-toast";
import { StatusSelect } from "@/components/ui/status-select";
import { useAuth } from "@/features/auth/useAuth";
import { hasPermission } from "@/permissions/permissions";
import { apiErrorMessage } from "@/features/subscription/services/cartService";
import {
  createContact,
  getContactModules,
  getContacts,
  updateContactStatus,
  type ContactEnquiry,
  type ContactModule,
  type ContactStatus,
} from "./contactService";

const OTHER = "other";
const WORD_LIMIT = 15;

function SeeMoreText({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const words = text.trim().split(/\s+/);
  if (words.length <= WORD_LIMIT) return <>{text}</>;

  return (
    <>
      {expanded ? text : `${words.slice(0, WORD_LIMIT).join(" ")}...`}{" "}
      <button
        type="button"
        className="cursor-pointer font-medium text-primary underline-offset-4 hover:underline"
        onClick={() => setExpanded(!expanded)}
      >
        {expanded ? "See less" : "See more"}
      </button>
    </>
  );
}
const PAGE_SIZE = 10;

export default function Contact() {
  const { user } = useAuth();
  const isSuperAdmin = user?.role_id === 1;
  const showRaisedBy = isSuperAdmin || user?.role_id === 2;
  const canAdd = !isSuperAdmin && hasPermission(user?.permissions?.contact ?? null, "ADD");
  const [modules, setModules] = useState<ContactModule[]>([]);
  const [moduleValue, setModuleValue] = useState("");
  const [other, setOther] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [rows, setRows] = useState<ContactEnquiry[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const subModules = modules.flatMap((mod) => mod.subModules);
  const selectedName =
    moduleValue === OTHER
      ? "Other"
      : subModules.find((sm) => String(sm.id) === moduleValue)?.name;

  const loadHistory = useCallback(() => {
    getContacts(page, PAGE_SIZE)
      .then((res) => {
        setRows(res.data);
        setTotal(res.pagination.total);
        setTotalPages(res.pagination.totalPages);
      })
      .catch(() => setRows([]));
  }, [page]);

  useEffect(() => {
    getContactModules()
      .then(setModules)
      .catch(() => setModules([]));
  }, []);

  useEffect(loadHistory, [loadHistory]);

  const changeStatus = (id: number, status: string) => {
    updateContactStatus(id, status as ContactStatus)
      .then((res) => {
        showCmtToast("success", res.message)
        loadHistory()
      })
      .catch((error) => showCmtToast("expiry", apiErrorMessage(error)))
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    if (moduleValue === OTHER && !other.trim())
      nextErrors.other = "Please specify the module";
    if (!subject.trim()) nextErrors.subject = "Subject is required";
    if (!message.trim()) nextErrors.message = "Message is required";
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSubmitting(true);
    try {
      const res = await createContact({
        sub_module_id:
          moduleValue && moduleValue !== OTHER ? Number(moduleValue) : null,
        other: moduleValue === OTHER ? other.trim() : null,
        subject: subject.trim(),
        message: message.trim(),
      });
      showCmtToast("success", res.message);
      setModuleValue("");
      setOther("");
      setSubject("");
      setMessage("");
      if (page === 1) loadHistory();
      else setPage(1);
    } catch (error) {
      showCmtToast("expiry", apiErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      {canAdd && (
        <Card>
          <CardHeader>
            <CardTitle>Contact Support</CardTitle>
            <CardDescription>
              Facing a technical difficulty? Tell us about it and our team will
              get back to you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <FieldGroup>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel htmlFor="module">Module</FieldLabel>
                    <Select
                      value={moduleValue}
                      onValueChange={(value) =>
                        setModuleValue(String(value ?? ""))
                      }
                    >
                      <SelectTrigger
                        id="module"
                        className="w-full cursor-pointer"
                      >
                        <SelectValue placeholder="Select a module">
                          {selectedName}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {modules.map((mod) => (
                          <SelectGroup key={mod.id}>
                            <SelectLabel>{mod.name}</SelectLabel>
                            {mod.subModules.map((sm) => (
                              <SelectItem key={sm.id} value={String(sm.id)}>
                                {sm.name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        ))}
                        <SelectSeparator />
                        <SelectItem value={OTHER}>Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>

                  <Field data-invalid={!!errors.subject}>
                    <FieldLabel htmlFor="subject">Subject *</FieldLabel>
                    <Input
                      id="subject"
                      value={subject}
                      maxLength={200}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="Short summary of the issue"
                      aria-invalid={!!errors.subject}
                    />
                    <FieldError>{errors.subject}</FieldError>
                  </Field>

                  {moduleValue === OTHER && (
                    <Field data-invalid={!!errors.other}>
                      <FieldLabel htmlFor="other">Other Module *</FieldLabel>
                      <Input
                        id="other"
                        value={other}
                        maxLength={150}
                        onChange={(e) => setOther(e.target.value)}
                        placeholder="Enter the module name"
                        aria-invalid={!!errors.other}
                      />
                      <FieldError>{errors.other}</FieldError>
                    </Field>
                  )}
                </div>

                <Field data-invalid={!!errors.message}>
                  <FieldLabel htmlFor="message">Message *</FieldLabel>
                  <Textarea
                    id="message"
                    rows={5}
                    value={message}
                    maxLength={5000}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe the difficulty you are facing"
                    aria-invalid={!!errors.message}
                  />
                  <FieldError>{errors.message}</FieldError>
                </Field>

                <div className="flex justify-end">
                  <Button type="submit" disabled={submitting}>
                    <Send />
                    {submitting ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Enquiry History</h2>
        <ResizableTable
          columns={[
            { id: "sl-no", label: "Sl. No.", size: 5 },
            ...(showRaisedBy
              ? [
                  { id: "user", label: "Raised By", size: 14 },
                  { id: "org", label: "Organization / Temple", size: 14 },
                ]
              : []),
            { id: "module", label: "Module", size: 10 },
            { id: "subject", label: "Subject", size: 15 },
            { id: "message", label: "Message", size: 24 },
            { id: "date", label: "Date", size: 12 },
            { id: "status", label: "Status", size: 11 },
          ]}
        >
          <TableBody>
            {rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={showRaisedBy ? 8 : 6}
                  className="h-24 text-center"
                >
                  No enquiries found.
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, index) => (
                <TableRow key={row.id}>
                  <TableCell>{(page - 1) * PAGE_SIZE + index + 1}</TableCell>
                  {showRaisedBy && (
                    <>
                      <TableCell>
                        <div className="font-medium">{row.user_name}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.user_email ?? "-"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {row.user_phone ?? "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>{row.org_name ?? "-"}</div>
                        <div className="text-xs text-muted-foreground">
                          {row.temp_name ?? "-"}
                        </div>
                      </TableCell>
                    </>
                  )}
                  <TableCell>{row.module_name ?? "-"}</TableCell>
                  <TableCell>
                    <SeeMoreText text={row.subject} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    <SeeMoreText text={row.message} />
                  </TableCell>
                  <TableCell className="text-xs">
                    {new Date(row.created_at).toLocaleString("en-IN")}
                  </TableCell>
                  <TableCell>
                    <StatusSelect
                      value={row.resolved_at ? "resolved" : "pending"}
                      options={["pending", "resolved"]}
                      onChange={isSuperAdmin && !row.resolved_at ? (status) => changeStatus(row.id, status) : undefined}
                    />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </ResizableTable>

        <DataPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={total}
          pageSize={PAGE_SIZE}
          itemName="enquiries"
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
