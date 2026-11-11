import { useSyncExternalStore } from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { closeConfirm, getConfirmState, subscribeConfirm } from "@/components/confirm-delete"

export function ConfirmDeleteDialog() {
  const state = useSyncExternalStore(subscribeConfirm, getConfirmState)

  return (
    <AlertDialog open={!!state} onOpenChange={(open) => !open && closeConfirm(false)}>
      <AlertDialogContent size={state?.items?.length ? "default" : "sm"}>
        <AlertDialogHeader>
          <AlertDialogTitle>{state?.title}</AlertDialogTitle>
          <AlertDialogDescription>{state?.description}</AlertDialogDescription>
        </AlertDialogHeader>
        {!!state?.items?.length && (
          <ul className="max-h-56 divide-y overflow-y-auto rounded-md border text-sm">
            {state.items.map((item, index) => (
              <li key={index} className="flex gap-2 px-3 py-2">
                <span className="text-muted-foreground tabular-nums">{index + 1}.</span>
                <span className="break-words">{item}</span>
              </li>
            ))}
          </ul>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" className="cursor-pointer" onClick={() => closeConfirm(true)}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
