"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { Moon, Sun } from "lucide-react"
import { flushSync } from "react-dom"

import { cn } from "@/lib/utils"

interface AnimatedThemeTogglerProps extends React.ComponentPropsWithoutRef<"button"> {
  duration?: number
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export const AnimatedThemeToggler = ({
  className,
  duration = 400,
  theme: controlledTheme,
  onThemeChange,
  ...props
}: AnimatedThemeTogglerProps) => {
  const [isDark, setIsDark] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (controlledTheme !== undefined) {
      setIsDark(controlledTheme === 'dark')
      return
    }

    const updateTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    return () => observer.disconnect()
  }, [controlledTheme])

  const toggleTheme = useCallback(async () => {
    if (!buttonRef.current) return

    const newTheme = isDark ? 'light' : 'dark'

    if (onThemeChange) {
      onThemeChange(newTheme)
      return
    }

    if ('startViewTransition' in document) {
      await (document as any).startViewTransition(() => {
        flushSync(() => {
          setIsDark(!isDark)
          document.documentElement.classList.toggle("dark")
          localStorage.setItem("theme", newTheme)
        })
      }).ready

      const { top, left, width, height } =
        buttonRef.current.getBoundingClientRect()
      const x = left + width / 2
      const y = top + height / 2
      const maxRadius = Math.hypot(
        Math.max(left, window.innerWidth - left),
        Math.max(top, window.innerHeight - top)
      )

      document.documentElement.animate(
        {
          clipPath: [
            `circle(0px at ${x}px ${y}px)`,
            `circle(${maxRadius}px at ${x}px ${y}px)`,
          ],
        },
        {
          duration,
          easing: "ease-in-out",
          pseudoElement: "::view-transition-new(root)",
        }
      )
    } else {
      flushSync(() => {
        setIsDark(!isDark)
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("theme", newTheme)
      })
    }
  }, [isDark, duration, onThemeChange])

  return (
    <button
      ref={buttonRef}
      onClick={toggleTheme}
      className={cn(
        "relative inline-flex h-14 w-14 items-center justify-center rounded-full border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 transition-all hover:scale-110 hover:shadow-lg",
        className
      )}
      {...props}
    >
      {isDark ? (
        <Sun className="h-6 w-6 text-yellow-500" />
      ) : (
        <Moon className="h-6 w-6 text-indigo-600" />
      )}
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
