"use client"

import { Button } from "@/components/ui/button"
import { useTutorial } from "@/contexts/tutorial-context"
import { BookOpen } from "lucide-react"
import { useState } from "react"

export default function TutorialButton() {
  const { startTutorial } = useTutorial()
  const [isHovering, setIsHovering] = useState(false)

  return (
    <Button
      variant="ghost"
      size="sm"
      className={`text-white hover:bg-amber-700 transition-all duration-300 ${isHovering ? "scale-105" : "scale-100"}`}
      onClick={startTutorial}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <BookOpen className={`h-5 w-5 mr-1 transition-transform duration-300 ${isHovering ? "rotate-12" : "rotate-0"}`} />
      <span className="hidden sm:inline">チュートリアル</span>
    </Button>
  )
}
