
import { Heart } from "lucide-react"
 import logo from "@/assets/cmtlogo.webp"
export default function Footer() {
  return (
    <footer className="border-t bg-background px-4 py-4 md:px-6">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-muted-foreground sm:flex-row">

        {/* LEFT */}
        <div className="flex items-center gap-1">
          <span>
            © {new Date().getFullYear()} TMS Software.
          </span>

          <span>All rights reserved.</span>
         
        </div>
       <div>

          <span>
           
           <a href="https://codemythought.in/" target="_blank" rel="noopener noreferrer" aria-label="CodeMyThought" >
            <img src={logo} alt="CodeMyThought Logo" className="h-8 w-auto object-contain" />
             </a>
             Devloped by Codemythought
          </span>
          </div>
        {/* CENTER / RIGHT */}
        <div className="flex items-center gap-4">
          <a
            href="/privacy-policy"
            className="transition-colors hover:text-foreground"
          >
            Privacy Policy
          </a>

          <a
            href="/terms"
            className="transition-colors hover:text-foreground"
          >
            Terms
          </a>

          <span className="hidden items-center gap-1 sm:flex">
            Made with
            <Heart className="size-3 fill-current" />
            TMS v1.0.0
          </span>
         
        </div>

      </div>
    </footer>
  )
}

