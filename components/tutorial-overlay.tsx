"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { useTutorial, type TutorialStep } from "@/contexts/tutorial-context"
import { X } from "lucide-react"
import ContextMenu from "@/components/context-menu"
import type { PlacedItem } from "@/types/types"

export default function TutorialOverlay() {
  const { isActive, currentStep, nextStep, prevStep, skipTutorial, targetRef } = useTutorial()
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, height: 0 })
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedStep, setDisplayedStep] = useState<TutorialStep>(null)
  const [animationDirection, setAnimationDirection] = useState<"next" | "prev" | null>(null)

  // コンテキストメニューのデモ用の状態
  const [showDemoContextMenu, setShowDemoContextMenu] = useState(false)
  const [demoContextMenuPosition, setDemoContextMenuPosition] = useState({ x: 0, y: 0 })

  // 前回のステップを記録するためのref
  const prevStepRef = useRef<TutorialStep>(null)

  // ウィンドウサイズの変更を監視
  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      })
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // ステップが変更されたときのアニメーション処理
  useEffect(() => {
    if (currentStep !== prevStepRef.current) {
      if (currentStep && prevStepRef.current) {
        // 方向を判断
        const currentIndex = getTutorialStepIndex(currentStep)
        const prevIndex = getTutorialStepIndex(prevStepRef.current)

        setAnimationDirection(currentIndex > prevIndex ? "next" : "prev")
      }

      if (currentStep) {
        setIsTransitioning(true)

        // コンテキストメニューのデモを非表示
        setShowDemoContextMenu(false)

        // 古いコンテンツをフェードアウト
        setTimeout(() => {
          setDisplayedStep(currentStep)

          // 新しいコンテンツをフェードイン
          setTimeout(() => {
            setIsTransitioning(false)

            // コンテキストメニューのステップの場合、デモを表示
            if (currentStep === "context-menu") {
              setupContextMenuDemo()
            }
          }, 300)
        }, 300)
      } else {
        setDisplayedStep(null)
        setShowDemoContextMenu(false)
      }

      prevStepRef.current = currentStep
    }
  }, [currentStep])

  // コンテキストメニューのデモをセットアップ
  const setupContextMenuDemo = () => {
    if (targetRef && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect()

      // ターゲット要素の中央付近にコンテキストメニューを表示
      const x = rect.left + rect.width / 2 + 100
      const y = rect.top + rect.height / 2 - 50

      setDemoContextMenuPosition({ x, y })
      setShowDemoContextMenu(true)
    }
  }

  // 初期表示時
  useEffect(() => {
    if (currentStep && !displayedStep) {
      setDisplayedStep(currentStep)

      // コンテキストメニューのステップの場合、デモを表示
      if (currentStep === "context-menu") {
        setTimeout(() => {
          setupContextMenuDemo()
        }, 500)
      }
    }
  }, [currentStep, displayedStep])

  // ターゲット要素の位置を計算
  useEffect(() => {
    if (targetRef && targetRef.current) {
      const rect = targetRef.current.getBoundingClientRect()

      // アニメーションのためにsetTimeoutを使用
      setTimeout(() => {
        setPosition({
          top: rect.top + window.scrollY,
          left: rect.left + window.scrollX,
          width: rect.width,
          height: rect.height,
        })
      }, 50)
    } else {
      // ターゲットがない場合は中央に表示
      setPosition({
        top: window.innerHeight / 2 - 150,
        left: window.innerWidth / 2 - 200,
        width: 400,
        height: 300,
      })
    }
  }, [targetRef, displayedStep, windowSize])

  // チュートリアルステップのインデックスを取得
  function getTutorialStepIndex(step: TutorialStep): number {
    const steps: TutorialStep[] = [
      "welcome",
      "select-sweet",
      "drag-drop",
      "context-menu",
      "product-info",
      "settings",
      "save-load",
      "customer-code-save",
      "print",
      "complete",
    ]
    return steps.indexOf(step)
  }

  // カスタムのnextStepとprevStep関数
  const handleNextStep = () => {
    setAnimationDirection("next")
    setIsTransitioning(true)
    setTimeout(() => {
      nextStep()
    }, 300)
  }

  const handlePrevStep = () => {
    setAnimationDirection("prev")
    setIsTransitioning(true)
    setTimeout(() => {
      prevStep()
    }, 300)
  }

  // デモ用の和菓子アイテム
  const demoSweetItem: PlacedItem = {
    id: "demo-sweet",
    itemId: "sweet1",
    type: "sweet",
    x: 3,
    y: 3,
    width: 2,
    height: 2,
    rotation: 0,
    isLocked: false,
    imageUrl: "/images/wagashi/kuriman.png",
    name: "栗饅頭",
    price: 250,
  }

  // コンテキストメニューのダミー関数
  const handleDummyAction = () => { }

  if (!isActive) return null

  // チュートリアルのコンテンツを取得
  const { title, content, hasTarget } = getTutorialContent(displayedStep)

  // ポップアップの位置を計算
  let popupStyle = calculatePopupPosition(position, windowSize, hasTarget)

  // コンテキストメニューのデモ表示時は位置を調整
  if (displayedStep === "context-menu" && showDemoContextMenu) {
    popupStyle = {
      top: `${demoContextMenuPosition.y + 150}px`,
      left: `${demoContextMenuPosition.x - 160}px`,
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-none">
      {/* 半透明のオーバーレイ */}
      <div
        className="absolute inset-0 bg-black/50 pointer-events-auto transition-opacity duration-500"
        onClick={skipTutorial}
        style={{ opacity: isTransitioning ? 0.3 : 0.5 }}
      />

      {/* ターゲット要素のハイライト */}
      {hasTarget && targetRef && targetRef.current && (
        <div
          className="absolute bg-transparent border-4 border-amber-500 rounded-md z-10 transition-all duration-500 ease-in-out"
          style={{
            top: position.top - 8,
            left: position.left - 8,
            width: position.width + 16,
            height: position.height + 16,
            boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.5)",
            opacity: isTransitioning ? 0 : 1,
          }}
        />
      )}

      {/* コンテキストメニューのデモ表示 */}
      {displayedStep === "context-menu" && showDemoContextMenu && (
        <div className="pointer-events-none">
          {/* デモ用の和菓子アイテム */}
          <div
            className="absolute bg-white border border-amber-200 rounded-sm overflow-hidden"
            style={{
              left: demoContextMenuPosition.x - 100,
              top: demoContextMenuPosition.y - 40,
              width: 80,
              height: 80,
              zIndex: 9998,
            }}
          >
            <img
              src="/images/wagashi/kuriman.png"
              alt="栗饅頭"
              className="w-full h-full"
              style={{ objectFit: "contain" }}
            />
          </div>

          {/* デモ用のコンテキストメニュー */}
          <div className="pointer-events-none">
            <ContextMenu
              x={demoContextMenuPosition.x}
              y={demoContextMenuPosition.y}
              item={demoSweetItem}
              onDelete={handleDummyAction}
              onToggleLock={handleDummyAction}
              onRotate={handleDummyAction}
              onShowInfo={handleDummyAction}
              onClose={handleDummyAction}
            />
          </div>
        </div>
      )}

      {/* チュートリアルポップアップ */}
      <div
        className={`absolute bg-white rounded-lg shadow-xl p-6 w-80 pointer-events-auto transition-all duration-500 ease-in-out`}
        style={{
          ...popupStyle,
          zIndex: 9999,
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning
            ? `translate(${animationDirection === "next" ? "20px" : "-20px"}, 0) scale(0.95)`
            : `translate(0, 0) scale(1)`,
        }}
      >
        <button
          onClick={skipTutorial}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="チュートリアルを閉じる"
        >
          <X size={20} />
        </button>

        <div className={`transition-opacity duration-300 ${isTransitioning ? "opacity-0" : "opacity-100"}`}>
          <h3 className="text-lg font-bold text-amber-800 mb-2">{title}</h3>
          <div className="text-sm text-gray-600 mb-4">{content}</div>
        </div>

        <div className="flex justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrevStep}
            disabled={displayedStep === "welcome" || isTransitioning}
            className="transition-all duration-200"
          >
            前へ
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleNextStep}
            disabled={isTransitioning}
            className="transition-all duration-200"
          >
            {displayedStep === "complete" ? "完了" : "次へ"}
          </Button>
        </div>

        {/* プログレスインジケーター */}
        <div className="mt-4 flex justify-center space-x-1">
          {[
            "welcome",
            "select-sweet",
            "drag-drop",
            "context-menu",
            "product-info",
            "settings",
            "save-load",
            "customer-code-save",
            "print",
            "complete",
          ].map((step) => (
            <div
              key={step}
              className={`h-1.5 rounded-full transition-all duration-300 ${step === displayedStep ? "w-4 bg-amber-600" : "w-2 bg-amber-300"
                }`}
            />
          ))}
        </div>

        <div className="mt-4 text-center">
          <button onClick={skipTutorial} className="text-xs text-gray-500 hover:text-amber-800 transition-colors">
            チュートリアルをスキップ
          </button>
        </div>
      </div>
    </div>
  )
}

// チュートリアルのコンテンツを取得する関数
function getTutorialContent(step: TutorialStep) {
  switch (step) {
    case "welcome":
      return {
        title: "和菓子詰め合わせシミュレーターへようこそ！",
        content:
          "このチュートリアルでは、和菓子詰め合わせシミュレーターの基本的な使い方を説明します。ステップバイステップで操作方法を学びましょう。",
        hasTarget: false,
      }
    case "select-sweet":
      return {
        title: "和菓子を選ぶ",
        content:
          "右側のタブから和菓子のカテゴリを選択できます。「焼き菓子」「餅菓子」「水菓子」「仕切り」から選べます。",
        hasTarget: true,
      }
    case "drag-drop":
      return {
        title: "ドラッグ＆ドロップ",
        content:
          "選んだ和菓子を左側の箱エリアにドラッグ＆ドロップして配置します。グリッド上に和菓子を自由に配置できます。",
        hasTarget: true,
      }
    case "context-menu":
      return {
        title: "コンテキストメニュー",
        content:
          "配置した和菓子を右クリックすると、このようなメニューが表示されます。削除、回転、ロック、商品情報表示などの操作ができます。",
        hasTarget: true,
      }
    case "product-info":
      return {
        title: "商品情報の表示",
        content:
          "和菓子をダブルクリックするか、コンテキストメニューから「商品情報」を選ぶと、詳細情報が表示されます。画像をクリックすると拡大表示できます。",
        hasTarget: true,
      }
    case "settings":
      return {
        title: "表示設定",
        content:
          "ヘッダーの設定アイコンをクリックすると、商品情報の表示項目をカスタマイズできます。必要な情報だけを表示するようにしましょう。",
        hasTarget: true,
      }
    case "save-load":
      return {
        title: "保存と読み込み",
        content:
          "作成した詰め合わせは「保存」ボタンでJSONファイルとして保存できます。「読込」ボタンで以前の作業を復元できます。",
        hasTarget: true,
      }
    case "customer-code-save":
      return {
        title: "カスタマーコード保存",
        content:
          "「カスタマーコード保存」ボタンをクリックすると、作成した詰め合わせがデータベースに保存され、8文字のカスタマーコードが生成されます。このコードを使って、自宅で作成したレイアウトを店舗で復元できます。",
        hasTarget: true,
      }

    case "print":
      return {
        title: "詰め合わせの印刷",
        content:
          "「印刷」ボタンをクリックすると、作成した詰め合わせを印刷できます。タイトルや印刷オプション（商品リスト、価格情報、アレルギー情報など）をカスタマイズして、きれいな印刷物を作成できます。",
        hasTarget: true,
      }
    case "complete":
      return {
        title: "チュートリアル完了！",
        content:
          "おめでとうございます！これで基本的な使い方を学びました。さっそく和菓子の詰め合わせを作成してみましょう。わからないことがあれば、ヘッダーの「？」アイコンからヘルプを確認できます。",
        hasTarget: false,
      }
    default:
      return {
        title: "",
        content: "",
        hasTarget: false,
      }
  }
}

// ポップアップの位置を計算する関数
function calculatePopupPosition(
  targetPosition: { top: number; left: number; width: number; height: number },
  windowSize: { width: number; height: number },
  hasTarget: boolean,
) {
  if (!hasTarget) {
    // ターゲットがない場合は中央に表示
    return {
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    }
  }

  // ポップアップの幅と高さ（推定値）
  const popupWidth = 320
  const popupHeight = 300 // プログレスインジケーター追加のため高さを調整

  // ターゲットの中心座標
  const targetCenterX = targetPosition.left + targetPosition.width / 2
  const targetCenterY = targetPosition.top + targetPosition.height / 2

  // 画面の余白（安全マージン）
  const safeMargin = 20

  // 配置方向の優先順位: 下 > 右 > 左 > 上
  // まず下に配置を試みる
  let top = targetPosition.top + targetPosition.height + 16
  let left = targetCenterX - popupWidth / 2

  // 画面下部に収まらない場合
  if (top + popupHeight + safeMargin > windowSize.height) {
    // 右側に配置を試みる
    if (targetPosition.left + targetPosition.width + popupWidth + safeMargin <= windowSize.width) {
      top = targetCenterY - popupHeight / 2
      left = targetPosition.left + targetPosition.width + 16
    }
    // 左側に配置を試みる
    else if (targetPosition.left - popupWidth - safeMargin >= 0) {
      top = targetCenterY - popupHeight / 2
      left = targetPosition.left - popupWidth - 16
    }
    // 上に配置を試みる（最後の手段）
    else if (targetPosition.top - popupHeight - safeMargin >= 0) {
      top = targetPosition.top - popupHeight - 16
      left = targetCenterX - popupWidth / 2
    }
    // どこにも収まらない場合は、画面中央に表示
    else {
      return {
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
      }
    }
  }

  // 左右の調整（画面からはみ出さないようにする）
  if (left + popupWidth + safeMargin > windowSize.width) {
    left = windowSize.width - popupWidth - safeMargin
  }
  if (left < safeMargin) {
    left = safeMargin
  }

  // 上下の調整（画面からはみ出さないようにする）
  if (top + popupHeight + safeMargin > windowSize.height) {
    top = windowSize.height - popupHeight - safeMargin
  }
  if (top < safeMargin) {
    top = safeMargin
  }

  return {
    top: `${top}px`,
    left: `${left}px`,
  }
}
