// import { useState } from "react";
// import type { FormEvent } from "react";
// import { useDispatch } from "react-redux";
// import { Minus, Plus, Ticket, LoaderCircle } from "lucide-react";

// import type { AppDispatch } from "@/app/store";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";

// import { createTokenIssue, fetchTokens,createTokenIssue,} from "../tokenThunks";
// import type { IssueTokenPayload } from "../tokenTypes";

// const PAGE_SIZE = 10;

// export type TokenForIssue = {
//   id: number;
//   temple_id: number;
//   temple_name?: string | null;
//   token_name: string;
//   token_code: string;
//   token_status: "active" | "inactive";
//   token_display_order?: number | null;
//   token_description?: string | null;
//   seva_name?: string | null;
//   seva_id?: number | null;
//   deity_name?: string | null;
//   deity_id?: number | null;
//   seva_amount?: number | string | null;
//   seva_gst_percent?: number | string | null;
// };

// interface IssueTokenDialogProps {
//   token: TokenForIssue | null;
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   page: number;
//   search: string;
// }

// function getLocalDateString(): string {
//   const date = new Date();
//   const year = date.getFullYear();
//   const month = String(date.getMonth() + 1).padStart(2, "0");
//   const day = String(date.getDate()).padStart(2, "0");

//   return `${year}-${month}-${day}`;
// }

// function formatRupees(amount: number): string {
//   return new Intl.NumberFormat("en-IN", {
//     style: "currency",
//     currency: "INR",
//     maximumFractionDigits: 2,
//   }).format(amount);
// }

// export default function IssueTokenDialog({
//   token,
//   open,
//   onOpenChange,
//   page,
//   search,
// }: IssueTokenDialogProps) {
//   const dispatch = useDispatch<AppDispatch>();

//   const [quantity, setQuantity] = useState(1);
//   const [performedDate, setPerformedDate] = useState(getLocalDateString);
//   const [paymentMethod, setPaymentMethod] = useState("Cash");
//   const [remark, setRemark] = useState("");
//   const [saving, setSaving] = useState(false);
//   const [error, setError] = useState("");
//   const [successMessage, setSuccessMessage] = useState("");
// const [issuedTokenId, setIssuedTokenId] = useState<number | null>(null);
// const [printing, setPrinting] = useState(false);
//   const sevaAmount = Number(token?.seva_amount ?? 0);
//   const subtotal = sevaAmount * quantity;

//   function changeQuantity(nextQuantity: number) {
//     if (!Number.isInteger(nextQuantity)) return;

//     setQuantity(Math.max(1, Math.min(999, nextQuantity)));
//   }

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     if (!token || saving) return;

//     if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
//       setError("Quantity must be between 1 and 999.");
//       return;
//     }

//     if (!performedDate) {
//       setError("Please select the seva date.");
//       return;
//     }

//     if (!Number.isFinite(sevaAmount) || sevaAmount < 0) {
//       setError("The seva amount is unavailable. Refresh the token list and try again.");
//       return;
//     }

//     setSaving(true);
//     setError("");
//     setSuccessMessage("");

//     try {
//       const payload: IssueTokenPayload = {
//         token_id: token.id,
//         temple_id: token.temple_id,
//         token_quantity: quantity,
//         token_performed_date: performedDate,
//         token_payment_method: paymentMethod,
//         token_remark: remark.trim() || null,
//       };

//       const result = await dispatch(createTokenIssue(payload)).unwrap();

//       const issueResult = result as typeof result & {
//         token_receipt_number?: string | null;
//         receipt_number?: string | null;
//       };

//       const receiptNumber =
//         issueResult.token_receipt_number ||
//         issueResult.receipt_number;

//       setSuccessMessage(
//         receiptNumber
//           ? `Token issued successfully. Receipt: ${receiptNumber}`
//           : "Token issued successfully.",
//       );

//       // Refresh the list in the background. A refresh failure should not
//       // turn a successful token issuance into an issuance error.
//       void dispatch(
//         fetchTokens({
//           page,
//           limit: PAGE_SIZE,
//           search: search.trim() || undefined,
//         }),
//       );
//     } catch (err: unknown) {
//       setError(
//         typeof err === "string"
//           ? err
//           : err instanceof Error
//             ? err.message
//             : "Unable to issue the token.",
//       );
//     } finally {
//       setSaving(false);
//     }
//   }

//   if (!token) return null;

//   return (
//     <Dialog
//       open={open}
//       onOpenChange={(nextOpen) => {
//         if (!saving) onOpenChange(nextOpen);
//       }}
//     >
//       <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Ticket className="size-5" />
//             {successMessage ? "Token Issued Successfully" : "Issue Token"}
//           </DialogTitle>

//           <DialogDescription>
//             {successMessage
//               ? "The token issue request was completed."
//               : "Enter the quantity, seva date, and payment details."}
//           </DialogDescription>
//         </DialogHeader>

//         {successMessage ? (
//           <div className="space-y-4">
//             <div
//               role="status"
//               className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800"
//             >
//               {successMessage}
//             </div>
//             <Button
//               type="button"
//               variant="outline"
//               onClick={() => {
//                 // Implement token receipt printing logic here
//               }}
//             >
//               Print Token Receipt
//             </Button>
//             <DialogFooter>
//               <Button type="button" onClick={() => onOpenChange(false)}>
//                 Done
//               </Button>
//             </DialogFooter>
//           </div>
//         ) : (
//           <form onSubmit={handleSubmit} className="space-y-5">
//             <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
//               <div>
//                 <p className="text-xs text-muted-foreground">Temple</p>
//                 <p className="font-medium">
//                   {token.temple_name?.trim() || `Temple #${token.temple_id}`}
//                 </p>
//               </div>

//               <div>
//                 <p className="text-xs text-muted-foreground">Token name</p>
//                 <p className="font-medium">{token.token_name}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-muted-foreground">Token code</p>
//                 <p className="font-medium">{token.token_code}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-muted-foreground">Deity</p>
//                 <p className="font-medium">{token.deity_name?.trim() || "—"}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-muted-foreground">Seva</p>
//                 <p className="font-medium">{token.seva_name?.trim() || "—"}</p>
//               </div>

//               <div>
//                 <p className="text-xs text-muted-foreground">Amount per token</p>
//                 <p className="font-semibold">{formatRupees(sevaAmount)}</p>
//               </div>
//             </div>

//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div className="space-y-2">
//                 <label htmlFor="issue-quantity" className="text-sm font-medium">
//                   Quantity *
//                 </label>

//                 <div className="flex items-center gap-3">
//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="icon"
//                     aria-label="Decrease quantity"
//                     disabled={saving || quantity <= 1}
//                     onClick={() => changeQuantity(quantity - 1)}
//                   >
//                     <Minus className="size-4" />
//                   </Button>

//                   <Input
//                     id="issue-quantity"
//                     type="number"
//                     min={1}
//                     max={999}
//                     step={1}
//                     required
//                     className="text-center"
//                     value={quantity}
//                     disabled={saving}
//                     onChange={(event) => {
//                       const value = event.target.value;

//                       if (value === "") {
//                         setQuantity(0);
//                       } else {
//                         changeQuantity(Number(value));
//                       }
//                     }}
//                   />

//                   <Button
//                     type="button"
//                     variant="outline"
//                     size="icon"
//                     aria-label="Increase quantity"
//                     disabled={saving || quantity >= 999}
//                     onClick={() => changeQuantity(quantity + 1)}
//                   >
//                     <Plus className="size-4" />
//                   </Button>
//                 </div>
//               </div>

//               <div className="space-y-2">
//                 <label
//                   htmlFor="issue-performed-date"
//                   className="text-sm font-medium"
//                 >
//                   Seva date *
//                 </label>

//                 <Input
//                   id="issue-performed-date"
//                   type="date"
//                   value={performedDate}
//                   onChange={(event) => setPerformedDate(event.target.value)}
//                   required
//                   disabled={saving}
//                 />
//               </div>
//             </div>

//             <div className="space-y-2">
//               <label
//                 htmlFor="issue-payment-method"
//                 className="text-sm font-medium"
//               >
//                 Payment method *
//               </label>

//               <select
//                 id="issue-payment-method"
//                 value={paymentMethod}
//                 onChange={(event) => setPaymentMethod(event.target.value)}
//                 disabled={saving}
//                 className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
//                 required
//               >
//                 <option value="Cash">Cash</option>
//                 <option value="UPI">UPI</option>
//                 <option value="Card">Card</option>
//                 <option value="Bank Transfer">Bank Transfer</option>
//                 <option value="Other">Other</option>
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label htmlFor="issue-remark" className="text-sm font-medium">
//                 Remark
//               </label>

//               <Input
//                 id="issue-remark"
//                 value={remark}
//                 onChange={(event) => setRemark(event.target.value)}
//                 placeholder="Optional remark"
//                 maxLength={500}
//                 disabled={saving}
//               />
//             </div>

//             <div className="space-y-2 rounded-lg border p-4">
//               <div className="flex justify-between text-sm">
//                 <span className="text-muted-foreground">Amount per token</span>
//                 <span>{formatRupees(sevaAmount)}</span>
//               </div>

//               <div className="flex justify-between text-sm">
//                 <span className="text-muted-foreground">Quantity</span>
//                 <span>{quantity}</span>
//               </div>

//               <div className="flex justify-between border-t pt-3">
//                 <span className="font-semibold">Subtotal</span>
//                 <span className="text-lg font-bold">{formatRupees(subtotal)}</span>
//               </div>

//               <p className="text-xs text-muted-foreground">
//                 The server should calculate the final amount and applicable GST.
//               </p>
//             </div>

//             {error && (
//               <div
//                 role="alert"
//                 className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
//               >
//                 {error}
//               </div>
//             )}

//             <DialogFooter className="gap-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 disabled={saving}
//                 onClick={() => onOpenChange(false)}
//               >
//                 Cancel
//               </Button>

//               <Button
//                 type="submit"
//                 disabled={saving || quantity < 1 || quantity > 999}
//               >
//                 {saving ? (
//                   <>
//                     <LoaderCircle className="mr-2 size-4 animate-spin" />
//                     Issuing...
//                   </>
//                 ) : (
//                   <>
//                     <Ticket className="mr-2 size-4" />
//                     Issue Token
//                   </>
//                 )}
//               </Button>
//             </DialogFooter>
//           </form>
//         )}
//       </DialogContent>
//     </Dialog>
//   );
// }



import { useState } from "react";
import type { FormEvent } from "react";
import { useDispatch } from "react-redux";
import {
  Minus,
  Plus,
  Ticket,
  LoaderCircle,
  Printer,
} from "lucide-react";

import type { AppDispatch } from "@/app/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  createTokenIssue,
  fetchTokens,
  printTokenReceipt,
} from "../tokenThunks";

import type {
  IssueTokenPayload,
  IssuedToken,
} from "../tokenTypes";

const PAGE_SIZE = 10;

export type TokenForIssue = {
  id: number;
  temple_id: number;
  temple_name?: string | null;
  token_name: string;
  token_code: string;
  token_status: "active" | "inactive";
  token_display_order?: number | null;
  token_description?: string | null;
  seva_name?: string | null;
  seva_id?: number | null;
  deity_name?: string | null;
  deity_id?: number | null;
  seva_amount?: number | string | null;
  seva_gst_percent?: number | string | null;
  //  token_max_tokens: number | null;
   max_limit: number | null;
   token_remaining_tokens: number | null;
   total_issued : number | null;
};

interface IssueTokenDialogProps {
  token: TokenForIssue | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  page: number;
  search: string;
}

function getLocalDateString(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatRupees(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export default function IssueTokenDialog({
  token,
  open,
  onOpenChange,
  page,
  search,
}: IssueTokenDialogProps) {
  const dispatch = useDispatch<AppDispatch>();

  const [quantity, setQuantity] = useState(1);
  const [performedDate, setPerformedDate] = useState(getLocalDateString);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [remark, setRemark] = useState("");

  const [saving, setSaving] = useState(false);
  const [printing, setPrinting] = useState(false);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [issuedTokenId, setIssuedTokenId] = useState<number | null>(null);

  const sevaAmount = Number(token?.seva_amount ?? 0);
  const subtotal = sevaAmount * quantity;

  function changeQuantity(nextQuantity: number) {
    if (!Number.isInteger(nextQuantity)) return;

    setQuantity(Math.max(1, Math.min(999, nextQuantity)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || saving) return;

    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) {
      setError("Quantity must be between 1 and 999.");
      return;
    }

    if (!performedDate) {
      setError("Please select the seva date.");
      return;
    }

    if (!Number.isFinite(sevaAmount) || sevaAmount < 0) {
      setError(
        "The seva amount is unavailable. Refresh the token list and try again.",
      );
      return;
    }

    setSaving(true);
    setError("");
    setSuccessMessage("");
    setIssuedTokenId(null);

    try {
      const payload: IssueTokenPayload = {
        token_id: token.id,
        temple_id: token.temple_id,
        token_quantity: quantity,
        token_performed_date: performedDate,
        token_payment_method: paymentMethod,
        token_remark: remark.trim() || null,
      };

      const result: IssuedToken = await dispatch(
        createTokenIssue(payload),
      ).unwrap();

      // Issuance has succeeded. Do not treat a missing ID as an
      // issuance failure; only printing requires the ID.
      const id = Number(result.id);

      if (Number.isInteger(id) && id > 0) {
        setIssuedTokenId(id);
      }

      const receiptNumber =
        result.token_receipt_number || result.receipt_number;

      setSuccessMessage(
        receiptNumber
          ? `Token issued successfully. Receipt: ${receiptNumber}`
          : "Token issued successfully.",
      );

      // Refresh token list without affecting the successful issue.
      void dispatch(
        fetchTokens({
          page,
          limit: PAGE_SIZE,
          search: search.trim() || undefined,
        }),
      );
    } catch (err: unknown) {
      setError(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Unable to issue the token.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handlePrintReceipt() {
    if (!issuedTokenId || printing) return;

    setPrinting(true);
    setError("");

    // Open the window immediately from the click to avoid popup blockers.
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Please allow pop-ups to print the receipt.");
      setPrinting(false);
      return;
    }

    try {
      const html = await dispatch(
        printTokenReceipt(issuedTokenId),
      ).unwrap();

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
    } catch (err: unknown) {
      printWindow.close();

      setError(
        typeof err === "string"
          ? err
          : err instanceof Error
            ? err.message
            : "Unable to print the receipt.",
      );
    } finally {
      setPrinting(false);
    }
  }

  function handleDone() {
    setQuantity(1);
    setPerformedDate(getLocalDateString());
    setPaymentMethod("Cash");
    setRemark("");
    setError("");
    setSuccessMessage("");
    setIssuedTokenId(null);

    onOpenChange(false);
  }

  if (!token) return null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!saving && !printing) {
          if (!nextOpen && successMessage) {
            handleDone();
          } else {
            onOpenChange(nextOpen);
          }
        }
      }}
    >
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="size-5" />
            {successMessage
              ? "Token Issued Successfully"
              : "Issue Token"}
          </DialogTitle>

          <DialogDescription>
            {successMessage
              ? "The token issue request was completed."
              : "Enter the quantity, seva date, and payment details."}
          </DialogDescription>
        </DialogHeader>

        {successMessage ? (
          <div className="space-y-4">
            <div
              role="status"
              className="rounded-md border border-green-200 bg-green-50 p-4 text-sm text-green-800"
            >
              {successMessage}
            </div>

            {!issuedTokenId && (
              <p className="text-sm text-amber-600">
                Receipt printing is unavailable because the API did not
                return the issued-token ID. You can still find this
                issued token in the issued-token list.
              </p>
            )}

            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={!issuedTokenId || printing}
              onClick={handlePrintReceipt}
            >
              {printing ? (
                <>
                  <LoaderCircle className="mr-2 size-4 animate-spin" />
                  Preparing Receipt...
                </>
              ) : (
                <>
                  <Printer className="mr-2 size-4" />
                  Print Token Receipt
                </>
              )}
            </Button>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <DialogFooter>
              <Button
                type="button"
                onClick={handleDone}
                disabled={printing}
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-muted-foreground">Temple</p>
                <p className="font-medium">
                  {token.temple_name?.trim() ||
                    `Temple #${token.temple_id}`}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Token name
                </p>
                <p className="font-medium">{token.token_name}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Token code
                </p>
                <p className="font-medium">{token.token_code}</p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Deity</p>
                <p className="font-medium">
                  {token.deity_name?.trim() || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">Seva</p>
                <p className="font-medium">
                  {token.seva_name?.trim() || "—"}
                </p>
              </div>

              <div>
                <p className="text-xs text-muted-foreground">
                  Amount per token
                </p>
                <p className="font-semibold">
                  {formatRupees(sevaAmount)}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label
                  htmlFor="issue-quantity"
                  className="text-sm font-medium"
                >
                  Quantity *
                </label>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Decrease quantity"
                    disabled={saving || quantity <= 1}
                    onClick={() => changeQuantity(quantity - 1)}
                  >
                    <Minus className="size-4" />
                  </Button>

                  <Input
                    id="issue-quantity"
                    type="number"
                    min={1}
                    max={999}
                    step={1}
                    required
                    className="text-center"
                    value={quantity}
                    disabled={saving}
                    onChange={(event) => {
                      const value = event.target.value;

                      if (value === "") {
                        setQuantity(0);
                      } else {
                        changeQuantity(Number(value));
                      }
                    }}
                  />

                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    aria-label="Increase quantity"
                    disabled={saving || quantity >= 999}
                    onClick={() => changeQuantity(quantity + 1)}
                  >
                    <Plus className="size-4" />
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="issue-performed-date"
                  className="text-sm font-medium"
                >
                  Seva date *
                </label>

                <Input
                  id="issue-performed-date"
                  type="date"
                  value={performedDate}
                  onChange={(event) =>
                    setPerformedDate(event.target.value)
                  }
                  required
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="issue-payment-method"
                className="text-sm font-medium"
              >
                Payment method *
              </label>

              <select
                id="issue-payment-method"
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(event.target.value)
                }
                disabled={saving}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="Cash">Cash</option>
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="issue-remark"
                className="text-sm font-medium"
              >
                Remark
              </label>

              <Input
                id="issue-remark"
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="Optional remark"
                maxLength={500}
                disabled={saving}
              />
            </div>

            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Amount per token
                </span>
                <span>{formatRupees(sevaAmount)}</span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Quantity</span>
                <span>{quantity}</span>
              </div>

              <div className="flex justify-between border-t pt-3">
                <span className="font-semibold">Subtotal</span>
                <span className="text-lg font-bold">
                  {formatRupees(subtotal)}
                </span>
              </div>

              <p className="text-xs text-muted-foreground">
                The server should calculate the final amount and
                applicable GST.
              </p>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
              >
                {error}
              </div>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                disabled={saving}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={saving || quantity < 1 || quantity > 999}
              >
                {saving ? (
                  <>
                    <LoaderCircle className="mr-2 size-4 animate-spin" />
                    Issuing...
                  </>
                ) : (
                  <>
                    <Ticket className="mr-2 size-4" />
                    Issue Token
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
