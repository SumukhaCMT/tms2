import { Link } from "react-router-dom"
import { Heart } from "lucide-react"
import logo from "@/assets/cmtlogo.webp"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

const links = [
  { to: "/privacy-policy", label: "Privacy Policy" },
  { to: "/terms", label: "Terms" },
]

export default function Footer() {
  return (
    <footer className="border-t bg-background px-4 py-3 md:px-6">
      <div className="flex flex-col items-center gap-3 text-xs text-muted-foreground md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} TMS Software. All rights reserved.</p>

        <a
          href="https://codemythought.in/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 transition-colors hover:text-foreground"
        >
          <span>Developed by</span>
          <img src={logo} alt="CodeMyThought" className="h-10 w-auto object-contain" />
        </a>

        <div className="flex h-4 items-center gap-3">
          {links.map((link) => (
            <Link key={link.to} to={link.to} className="transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <Separator orientation="vertical" className="hidden sm:block" />
          <span className="hidden items-center gap-1 sm:flex">
            Made with <Heart className="size-3 fill-red-500 text-red-500" />
            <Badge variant="outline">TMS v1.0.0</Badge>
          </span>
        </div>
      </div>
    </footer>
  )
}
