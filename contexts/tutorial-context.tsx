"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

// チュートリアルのステップを定義
export type TutorialStep =
  | "welcome"
  | "select-sweet"
  | "drag-drop"
  | "context-menu"
  | "product-info"
  | "settings"
  | "save-load"
  | "customer-code-save"
  | "auto-divider"
  | "print"
  | "complete"
  | null

interface TutorialContextType {
  isActive: boolean
  currentStep: TutorialStep
  startTutorial: () => void
  nextStep: () => void
  prevStep: () => void
  skipTutorial: () => void
  completeTutorial: () => void
  targetRef: React.RefObject<HTMLElement> | null
  setTargetRef: (ref: React.RefObject<HTMLElement> | null) => void
}

// デフォルト値を設定
const defaultContextValue: TutorialContextType = {
  isActive: false,
  currentStep: null,
  startTutorial: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTutorial: () => {},
  completeTutorial: () => {},
  targetRef: null,
  setTargetRef: () => {},
}

const TutorialContext = createContext<TutorialContextType>(defaultContextValue)

// チュートリアルのステップ順序
const tutorialSteps: TutorialStep[] = [
  "welcome",
  "select-sweet",
  "drag-drop",
  "context-menu",
  "product-info",
  "settings",
  "save-load",
  "customer-code-save",
  "auto-divider",
  "print",
  "complete",
]

export const TutorialProvider = ({ children }: { children: ReactNode }) => {
  const [isActive, setIsActive] = useState(false)
  const [currentStep, setCurrentStep] = useState<TutorialStep>(null)
  const [targetRef, setTargetRef] = useState<React.RefObject<HTMLElement> | null>(null)
  const [hasCompletedTutorial, setHasCompletedTutorial] = useState(false)

  // ローカルストレージからチュートリアル完了状態を読み込む
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const completed = localStorage.getItem("tutorialCompleted") === "true"
        setHasCompletedTutorial(completed)

        // 初回訪問時は自動的にチュートリアルを開始
        if (!completed) {
          startTutorial()
        }
      } catch (error) {
        console.error("Failed to access localStorage:", error)
      }
    }
  }, [])

  const startTutorial = () => {
    setIsActive(true)
    setCurrentStep("welcome")
  }

  const nextStep = () => {
    const currentIndex = tutorialSteps.indexOf(currentStep)
    if (currentIndex < tutorialSteps.length - 1) {
      setCurrentStep(tutorialSteps[currentIndex + 1])
    } else {
      completeTutorial()
    }
  }

  const prevStep = () => {
    const currentIndex = tutorialSteps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(tutorialSteps[currentIndex - 1])
    }
  }

  const skipTutorial = () => {
    setIsActive(false)
    setCurrentStep(null)
  }

  const completeTutorial = () => {
    setIsActive(false)
    setCurrentStep(null)
    setHasCompletedTutorial(true)

    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("tutorialCompleted", "true")
      } catch (error) {
        console.error("Failed to access localStorage:", error)
      }
    }
  }

  return (
    <TutorialContext.Provider
      value={{
        isActive,
        currentStep,
        startTutorial,
        nextStep,
        prevStep,
        skipTutorial,
        completeTutorial,
        targetRef,
        setTargetRef,
      }}
    >
      {children}
    </TutorialContext.Provider>
  )
}

export const useTutorial = () => {
  const context = useContext(TutorialContext)
  return context
}
