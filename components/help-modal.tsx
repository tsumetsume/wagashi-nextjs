import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface HelpModalProps {
  onClose: () => void
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>使い方ガイド</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-amber-800">基本操作</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>右側のタブから和菓子や仕切りを選択</li>
              <li>ドラッグ＆ドロップで箱に配置</li>
              <li>配置済みアイテムは矢印キーでも移動可能</li>
              <li>
                <span className="font-semibold">ダブルクリック</span>で和菓子の詳細情報を表示
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">コンテキストメニュー</h3>
            <p className="text-sm">配置済みアイテムを右クリックして以下の操作が可能：</p>
            <ul className="list-disc pl-5 text-sm">
              <li>削除 - アイテムを削除</li>
              <li>ロック/アンロック - 位置を固定/解除</li>
              <li>回転 - 和菓子を90度回転（和菓子のみ）</li>
              <li>商品情報 - 詳細情報を表示（和菓子のみ）</li>
              <li>長さ調整 - 仕切りの長さを変更（仕切りのみ）</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">商品情報と画像表示</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>商品情報モーダル内の画像をクリックすると拡大表示</li>
              <li>拡大表示では、ズームイン/アウトが可能</li>
              <li>ヘッダーの設定ボタンから表示項目をカスタマイズ可能</li>
              <li>表示項目：商品名、価格、サイズ、画像、カテゴリ</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">価格計算</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>箱エリアの下部に詰め合わせの合計金額が表示されます</li>
              <li>和菓子を追加/削除すると自動的に金額が更新されます</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">仕切りの配置</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>仕切りは和菓子と交差しないように配置されます</li>
              <li>右クリックメニューから長さを調整可能</li>
              <li>
                <span className="font-semibold">仕切り自動配置</span>ボタンで和菓子の間に最適な仕切りを自動配置できます
              </li>
              <li>自動配置では、和菓子の間や箱の端に適切な仕切りが配置されます</li>
              <li>和菓子に接触する位置にも仕切りを配置できます</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">保存と読み込み</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>「保存」ボタン - 現在の詰め合わせをJSONファイルで保存</li>
              <li>「読込」ボタン - 保存したJSONファイルから詰め合わせを復元</li>
              <li>「新規」ボタン - 詰め合わせをクリア</li>
              <li>保存時には表示設定も一緒に保存されます</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">印刷機能</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>「印刷」ボタン - 詰め合わせを印刷用フォーマットで表示</li>
              <li>タイトルのカスタマイズが可能</li>
              <li>商品リスト、価格情報、アレルギー情報の表示/非表示を選択可能</li>
              <li>プレビュー画面で確認してから印刷できます</li>
              <li>印刷物は和風デザインで、美しく仕上がります</li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-amber-800">ショートカット</h3>
            <ul className="list-disc pl-5 text-sm">
              <li>ダブルクリック - 和菓子の詳細情報を表示</li>
              <li>右クリック - コンテキストメニューを表示</li>
              <li>矢印キー - 選択したアイテムを移動（ロックされていない場合）</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
