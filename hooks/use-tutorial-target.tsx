"use client"

import { useRef, useEffect } from "react"
import { useTutorial } from "@/contexts/tutorial-context"

export function useTutorialTarget(step: string) {
  const ref = useRef<HTMLDivElement>(null)
  const { currentStep, setTargetRef } = useTutorial()

  useEffect(() => {
    if (currentStep === step) {
      setTargetRef(ref)
    }
  }, [currentStep, step, setTargetRef])

  return ref
}
