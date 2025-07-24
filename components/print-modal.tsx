"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useState, useEffect, useRef } from "react"
import PrintLayout from "./print-layout"
import type { PlacedItem } from "@/types/types"
import type { BoxSize } from "@/types/types"
import type { InfoDisplaySettings } from "@/components/info-settings-modal"

interface PrintModalProps {
  placedItems: PlacedItem[]
  boxSize: BoxSize
  infoSettings: InfoDisplaySettings
  onClose: () => void
  selectedStoreId: string
}

export default function PrintModal({ placedItems, boxSize, infoSettings, onClose, selectedStoreId }: PrintModalProps) {
  const [isPrinting, setIsPrinting] = useState(false)
  const [includeItemList, setIncludeItemList] = useState(true)
  const [includePrice, setIncludePrice] = useState(true)
  const [includeAllergies, setIncludeAllergies] = useState(true)
  const [title, setTitle] = useState("和菓子詰め合わせ")
  const [isPreviewReady, setIsPreviewReady] = useState(false)
  const printFrameRef = useRef<HTMLIFrameElement>(null)

  // プレビューの準備
  useEffect(() => {
    // プレビューの準備に少し時間を与える
    const timer = setTimeout(() => {
      setIsPreviewReady(true)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  const handlePrint = () => {
    setIsPrinting(true)

    // 印刷用のHTMLを生成
    const printContent = generatePrintContent()

    // iframeを取得または作成
    let printFrame = printFrameRef.current
    if (!printFrame) {
      printFrame = document.createElement("iframe")
      printFrame.style.position = "fixed"
      printFrame.style.right = "0"
      printFrame.style.bottom = "0"
      printFrame.style.width = "0"
      printFrame.style.height = "0"
      printFrame.style.border = "0"
      document.body.appendChild(printFrame)
    }

    // iframeのドキュメントにコンテンツを書き込む
    const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document
    if (frameDoc) {
      frameDoc.open()
      frameDoc.write(printContent)
      frameDoc.close()

      // スタイルが適用されるのを待ってから印刷
      setTimeout(() => {
        if (printFrame?.contentWindow) {
          printFrame.contentWindow.print()

          // 印刷ダイアログが閉じられた後の処理
          setTimeout(() => {
            setIsPrinting(false)
          }, 1000)
        } else {
          setIsPrinting(false)
        }
      }, 1000)
    } else {
      setIsPrinting(false)
    }
  }

  // 印刷用のHTMLコンテンツを生成する関数
  const generatePrintContent = () => {
    // 現在のページからCSSを取得
    const styles = Array.from(document.styleSheets)
      .map((styleSheet) => {
        try {
          return Array.from(styleSheet.cssRules)
            .map((rule) => rule.cssText)
            .join("\n")
        } catch (e) {
          // CORSの制限でアクセスできないスタイルシートは無視
          return ""
        }
      })
      .filter(Boolean)
      .join("\n")

    // 印刷用のHTMLを生成
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${title} - 印刷</title>
          <style>
            ${styles}
            /* 印刷用の追加スタイル */
            body {
              margin: 0;
              padding: 20px;
              background: white;
            }
            .print-layout {
              max-width: 100%;
              margin: 0 auto;
            }
            @media print {
              @page {
                size: auto;
                margin: 10mm;
              }
              body {
                padding: 0;
              }
            }
          </style>
        </head>
        <body>
          <div id="print-container">
            <div class="print-layout">
              <div class="print-header">
                <h1 class="print-title">${title}</h1>
                <div class="print-date">作成日: ${new Date().toLocaleDateString("ja-JP")}</div>
              </div>
              
              <div class="print-box-container">
                <canvas id="print-canvas" width="${Number.parseInt(boxSize) * 40}" height="${Number.parseInt(boxSize) * 40}" class="print-canvas"></canvas>
              </div>
              
              ${
                includePrice
                  ? `
                <div class="print-total-price">
                  <span>合計金額: </span>
                  <span class="price">${placedItems
                    .filter((item) => item.type === "sweet" && item.price)
                    .reduce((total, item) => total + (item.price || 0), 0)
                    .toLocaleString()}円</span>
                </div>
              `
                  : ""
              }
              
              ${generateAllergiesHTML()}
              
              ${generateItemListHTML()}
              
              <div class="print-footer">
                <p>和菓子詰め合わせシミュレーター</p>
              </div>
            </div>
          </div>
          
          <script>
            // キャンバスに詰め合わせを描画するスクリプト
            (function() {
              const canvas = document.getElementById('print-canvas');
              if (!canvas) return;
              
              const ctx = canvas.getContext('2d');
              if (!ctx) return;
              
              const cellSize = 40;
              const width = ${Number.parseInt(boxSize)};
              const height = ${Number.parseInt(boxSize)};
              
              // 背景を描画
              ctx.fillStyle = "#FFF7E6";
              ctx.fillRect(0, 0, canvas.width, canvas.height);
              
              // グリッド線を描画
              ctx.strokeStyle = "#E9D8BE";
              ctx.lineWidth = 1;
              
              // 縦線
              for (let i = 0; i <= width; i++) {
                ctx.beginPath();
                ctx.moveTo(i * cellSize, 0);
                ctx.lineTo(i * cellSize, canvas.height);
                ctx.stroke();
              }
              
              // 横線
              for (let i = 0; i <= height; i++) {
                ctx.beginPath();
                ctx.moveTo(0, i * cellSize);
                ctx.lineTo(canvas.width, i * cellSize);
                ctx.stroke();
              }
              
              // 仕切りを描画
              ${generateDividersJS()}
              
              // 和菓子を描画
              ${generateSweetsJS()}
              
              // 枠線を描画
              ctx.strokeStyle = "#92400E";
              ctx.lineWidth = 3;
              ctx.strokeRect(0, 0, canvas.width, canvas.height);
            })();
          </script>
        </body>
      </html>
    `
  }

  // アレルギー情報のHTMLを生成
  const generateAllergiesHTML = () => {
    if (!includeAllergies) return ""

    // 配置されたアイテムからアレルギー情報を取得
    // 注意: 印刷時は配置されたアイテムに含まれるアレルギー情報を使用
    const allAllergies = new Set<string>()
    placedItems
      .filter((item) => item.type === "sweet")
      .forEach((item) => {
        // PlacedItemに含まれるアレルギー情報があれば使用
        // 実際の実装では、PlacedItemにアレルギー情報を含める必要があります
      })

    if (allAllergies.size === 0) return ""

    return `
      <div class="print-allergies">
        <h3>アレルギー情報</h3>
        <div class="allergy-tags">
          ${Array.from(allAllergies)
            .map((allergy) => `<span class="allergy-tag">${allergy}</span>`)
            .join("")}
        </div>
      </div>
    `
  }

  // 商品リストのHTMLを生成
  const generateItemListHTML = () => {
    if (!includeItemList) return ""

    const sweetItems = placedItems.filter((item) => item.type === "sweet")
    if (sweetItems.length === 0) return ""

    return `
      <div class="print-item-list">
        <h3>商品リスト</h3>
        <table>
          <thead>
            <tr>
              <th>商品名</th>
              ${includePrice ? "<th>価格</th>" : ""}
            </tr>
          </thead>
          <tbody>
            ${sweetItems
              .map((item) => {
                return `
                <tr>
                  <td>${item.name}</td>
                  ${includePrice ? `<td>${(item.price || 0).toLocaleString()}円</td>` : ""}
                </tr>
              `
              })
              .join("")}
          </tbody>
        </table>
      </div>
    `
  }

  // 仕切りを描画するJavaScriptを生成
  const generateDividersJS = () => {
    const dividers = placedItems.filter((item) => item.type === "divider")
    if (dividers.length === 0) return ""

    // 注意: 仕切りの描画は和菓子の描画後に行うようにする
    return `
    // 和菓子の描画後に仕切りを描画
    setTimeout(() => {
      ${dividers
        .map(
          (divider) => `
        ctx.fillStyle = "#92400E";
        ${
          divider.orientation === "horizontal"
            ? `ctx.fillRect(${divider.x} * cellSize, ${divider.y} * cellSize - 1, ${divider.width} * cellSize, 2);`
            : `ctx.fillRect(${divider.x} * cellSize - 1, ${divider.y} * cellSize, 2, ${divider.height} * cellSize);`
        }
      `,
        )
        .join("\n")}
    }, 100); // 少し遅延させて和菓子の描画後に実行
  `
  }

  // 和菓子を描画するJavaScriptを生成
  const generateSweetsJS = () => {
    const sweets = placedItems.filter((item) => item.type === "sweet")
    if (sweets.length === 0) return ""

    return sweets
      .map(
        (sweet) => `
      // 和菓子の背景
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(${sweet.x} * cellSize, ${sweet.y} * cellSize, ${sweet.width} * cellSize, ${sweet.height} * cellSize);
      
      // 和菓子の枠線
      ctx.strokeStyle = "#D4A76A";
      ctx.lineWidth = 1;
      ctx.strokeRect(${sweet.x} * cellSize, ${sweet.y} * cellSize, ${sweet.width} * cellSize, ${sweet.height} * cellSize);
      
      // 和菓子の名前を表示
      ctx.fillStyle = "#92400E";
      ctx.font = \`\${cellSize / 3}px sans-serif\`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("${sweet.name}", (${sweet.x} + ${sweet.width} / 2) * cellSize, (${sweet.y} + ${sweet.height} / 2) * cellSize);
      
      // 和菓子の画像を読み込み
      ${
        sweet.imageUrl
          ? `
        (function() {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.src = "${sweet.imageUrl}";
          
          img.onload = function() {
            // アスペクト比を計算
            const aspectRatio = img.width / img.height;
            let drawWidth = ${sweet.width} * cellSize;
            let drawHeight = ${sweet.height} * cellSize;
            
            // アスペクト比を維持
            if (aspectRatio > 1) {
              drawHeight = drawWidth / aspectRatio;
            } else {
              drawWidth = drawHeight * aspectRatio;
            }
            
            // 中央に配置
            const offsetX = (${sweet.width} * cellSize - drawWidth) / 2;
            const offsetY = (${sweet.height} * cellSize - drawHeight) / 2;
            
            ctx.save();
            
            // 回転がある場合は適用
            ${
              sweet.rotation
                ? `
              const centerX = (${sweet.x} + ${sweet.width} / 2) * cellSize;
              const centerY = (${sweet.y} + ${sweet.height} / 2) * cellSize;
              
              ctx.translate(centerX, centerY);
              ctx.rotate((${sweet.rotation} * Math.PI) / 180);
              ctx.translate(-centerX, -centerY);
            `
                : ""
            }
            
            ctx.drawImage(img, ${sweet.x} * cellSize + offsetX, ${sweet.y} * cellSize + offsetY, drawWidth, drawHeight);
            
            ctx.restore();
          };
        })();
      `
          : ""
      }
    `,
      )
      .join("\n")
  }

  // sweets配列を取得（実際のコードでは適切なインポートが必要）

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto bg-white !bg-opacity-100">
        <DialogHeader>
          <DialogTitle>詰め合わせの印刷</DialogTitle>
        </DialogHeader>

        {!isPrinting && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="print-title" className="block text-sm font-medium mb-1">
                    タイトル
                  </label>
                  <input
                    id="print-title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-medium">印刷オプション</label>
                  <div className="flex items-center">
                    <input
                      id="include-item-list"
                      type="checkbox"
                      checked={includeItemList}
                      onChange={(e) => setIncludeItemList(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="include-item-list">商品リストを含める</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="include-price"
                      type="checkbox"
                      checked={includePrice}
                      onChange={(e) => setIncludePrice(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="include-price">価格情報を含める</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="include-allergies"
                      type="checkbox"
                      checked={includeAllergies}
                      onChange={(e) => setIncludeAllergies(e.target.checked)}
                      className="mr-2"
                    />
                    <label htmlFor="include-allergies">アレルギー情報を含める</label>
                  </div>
                </div>
              </div>

              <div className="border rounded-md p-4 bg-gray-50">
                <h3 className="text-sm font-medium mb-2">印刷プレビュー</h3>
                <div className="text-xs text-gray-500 mb-2">
                  以下のプレビューは縮小表示です。実際の印刷では適切なサイズで出力されます。
                </div>
                <div
                  className="border rounded overflow-hidden bg-white flex items-start justify-center"
                  style={{ height: "300px", overflow: "auto" }}
                >
                  {isPreviewReady ? (
                    <div className="p-2 max-w-full max-h-full flex items-start justify-center">
                      <div style={{ transform: "scale(0.85)", transformOrigin: "center" }}>
                        <PrintLayout
                          placedItems={placedItems}
                          boxSize={boxSize}
                          title={title}
                          includeItemList={includeItemList}
                          includePrice={includePrice}
                          includeAllergies={includeAllergies}
                          infoSettings={infoSettings}
                          isPrintPreview={true}
                          selectedStoreId={selectedStoreId}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-amber-800">プレビューを準備中...</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 非表示のiframe */}
        <iframe ref={printFrameRef} style={{ display: "none" }} title="印刷フレーム" />

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPrinting}>
            キャンセル
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting}>
            {isPrinting ? "印刷中..." : "印刷"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
