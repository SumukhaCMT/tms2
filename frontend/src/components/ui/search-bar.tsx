import { useEffect, useRef, useState } from "react"
import { Search, X } from "lucide-react"

import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"

interface SearchBarProps {
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
  className?: string
}

export function SearchBar({ onSearch, placeholder = "Search...", delay = 400, className }: SearchBarProps) {
  const [value, setValue] = useState("")
  const onSearchRef = useRef(onSearch)
  const lastSearch = useRef("")

  useEffect(() => {
    onSearchRef.current = onSearch
  }, [onSearch])

  useEffect(() => {
    const term = value.trim()
    if (term === lastSearch.current) return
    const timer = setTimeout(() => {
      lastSearch.current = term
      onSearchRef.current(term)
    }, delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return (
    <InputGroup className={className ?? "w-full md:w-64"}>
      <InputGroupAddon>
        <Search />
      </InputGroupAddon>
      <InputGroupInput value={value} placeholder={placeholder} onChange={(event) => setValue(event.target.value)} />
      {value && (
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" className="cursor-pointer" aria-label="Clear search" onClick={() => setValue("")}>
            <X />
          </InputGroupButton>
        </InputGroupAddon>
      )}
    </InputGroup>
  )
}
