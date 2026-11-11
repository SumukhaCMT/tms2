import { Autocomplete as AutocompletePrimitive } from "@base-ui/react/autocomplete"
import { cn } from "cn"

const Autocomplete = AutocompletePrimitive.Root
const AutocompleteInput = AutocompletePrimitive.Input
const AutocompleteList = AutocompletePrimitive.List

function AutocompleteContent({
  className,
  sideOffset = 4,
  align = "start",
  ...props
}: AutocompletePrimitive.Popup.Props &
  Pick<AutocompletePrimitive.Positioner.Props, "sideOffset" | "align">) {
  return (
    <AutocompletePrimitive.Portal>
      <AutocompletePrimitive.Positioner sideOffset={sideOffset} align={align} className="isolate z-50 data-empty:hidden">
        <AutocompletePrimitive.Popup
          data-slot="autocomplete-content"
          className={cn(
            "max-h-64 w-(--anchor-width) min-w-56 overflow-y-auto rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            className,
          )}
          {...props}
        />
      </AutocompletePrimitive.Positioner>
    </AutocompletePrimitive.Portal>
  )
}

function AutocompleteItem({ className, ...props }: AutocompletePrimitive.Item.Props) {
  return (
    <AutocompletePrimitive.Item
      data-slot="autocomplete-item"
      className={cn(
        "flex cursor-default flex-col gap-0.5 rounded-md px-2 py-1.5 text-sm outline-none select-none data-highlighted:bg-accent data-highlighted:text-accent-foreground",
        className,
      )}
      {...props}
    />
  )
}

export { Autocomplete, AutocompleteInput, AutocompleteContent, AutocompleteList, AutocompleteItem }
