// import * as React from "react"

// const MOBILE_BREAKPOINT = 768

// export function useIsMobile() {
//   const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

//   React.useEffect(() => {
//     const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
//     const onChange = () => {
//       setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     }
//     mql.addEventListener("change", onChange)
//     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//     return () => mql.removeEventListener("change", onChange)
//   }, [])

//   return !!isMobile
// }


// /*
// C:\Users\deepa\Desktop\TMS\frontend\src\hooks\use-mobile.ts
//   14:5  error  Error: Calling setState synchronously within an effect can trigger cascading renders

// Effects are intended to synchronize state between React and external systems such as manually updating the DOM, state management libraries, or other platform APIs. In general, the body of an effect should do one or both of the following:
// * Update external systems with the latest state from React.
// * Subscribe for updates from some external system, calling setState in a callback function when external state changes.

// Calling setState synchronously within an effect body causes cascading renders that can hurt performance, and is not recommended. (https://react.dev/learn/you-might-not-need-an-effect).

// C:\Users\deepa\Desktop\TMS\frontend\src\hooks\use-mobile.ts:14:5
//   12 |     }
//   13 |     mql.addEventListener("change", onChange)
// > 14 |     setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
//      |     ^^^^^^^^^^^ Avoid calling setState() directly within an effect
//   15 |     return () => mql.removeEventListener("change", onChange)
//   16 |   }, [])
//   17 |  react-hooks/set-state-in-effect  

// ✖ 1 problem (1 error, 0 warnings)
//  *\


import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false
    }

    return window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    ).matches
  })

  React.useEffect(() => {
    const mql = window.matchMedia(
      `(max-width: ${MOBILE_BREAKPOINT - 1}px)`
    )

    const onChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    mql.addEventListener("change", onChange)

    return () => {
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return isMobile
}