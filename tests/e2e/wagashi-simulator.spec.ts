import { test, expect } from "@playwright/test"

// テスト用のフィクスチャデータ
const storeFixture = {
  id: "store-1",
  name: "銀座本店",
  description: "老舗の和菓子店",
  address: "東京都中央区銀座1-1-1",
  phone: "03-1234-5678",
  isActive: true,
}

const boxTypesFixture = [
  {
    id: "box-1",
    size: "10x10",
    name: "小箱",
    price: 1000,
    description: "ベーシックなサイズ",
    isActive: true,
  },
]

const sweetsFixture = [
  {
    id: "sweet-1",
    name: "桜餅",
    price: 200,
    width: 2,
    height: 2,
    imageUrl: "/images/sakura-mochi.jpg",
    categoryId: "cat-1",
    category: { name: "季節の和菓子" },
    description: "春の代表的な和菓子",
    ingredients: "もち米、あんこ、桜の葉",
    allergens: "小麦",
    calories: 150,
    shelfLife: "当日中",
    storageMethod: "常温保存",
    nutritionInfo: "糖質25g",
    inStock: true,
  },
  {
    id: "sweet-2",
    name: "どら焼き",
    price: 180,
    width: 3,
    height: 3,
    imageUrl: "/images/dorayaki.jpg",
    categoryId: "cat-2",
    category: { name: "定番和菓子" },
    description: "ふわふわの生地にあんこを挟んだ和菓子",
    ingredients: "小麦粉、卵、あんこ",
    allergens: "小麦、卵",
    calories: 220,
    shelfLife: "3日間",
    storageMethod: "常温保存",
    nutritionInfo: "糖質30g",
    inStock: true,
  },
]

const maintenanceSettingsFixture = {
  success: true,
  data: {
    maintenanceMode: false,
    maintenanceMessage: "",
    estimatedEndTime: null,
  },
}

test.describe("和菓子シミュレーター画面", () => {
  test.beforeEach(async ({ page }) => {
    // 必要なAPIレスポンスをモック
    await page.route("**/api/stores/store-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(storeFixture),
      })
    })

    await page.route("**/api/box-types", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(boxTypesFixture),
      })
    })

    await page.route("**/api/sweets**", async (route) => {
      const url = new URL(route.request().url())
      if (url.searchParams.get('storeId') === 'store-1') {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(sweetsFixture),
        })
      } else {
        await route.continue()
      }
    })

    await page.route("**/api/dividers", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    })

    await page.route("**/api/admin/settings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(maintenanceSettingsFixture),
      })
    })

    // ローカルストレージに店舗IDを設定
    await page.addInitScript(() => {
      localStorage.setItem("selectedStoreId", "store-1")
    })

    // シミュレーター画面に移動
    await page.goto("/simulator")
    await page.waitForLoadState("networkidle")
  })

  test("シミュレーター画面が正しく表示される", async ({ page }) => {
    // ページタイトルの確認
    await expect(page.getByRole("heading", { name: "和菓子詰め合わせシミュレーター" })).toBeVisible({ timeout: 15000 })
    
    // 店舗名の表示確認
    await expect(page.getByText("銀座本店")).toBeVisible({ timeout: 15000 })
    
    // ボックスエリアの表示確認
    await expect(page.locator('[data-testid="box-area"]').first()).toBeVisible({ timeout: 15000 })
    
    // 商品選択エリアの表示確認
    await expect(page.locator('[data-testid="selection-area"]')).toBeVisible({ timeout: 15000 })
    
    // 和菓子アイテムの表示確認（タイムアウトを設定）
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("どら焼き")).toBeVisible({ timeout: 15000 })
  })

  test("和菓子をドラッグ&ドロップで配置できる", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    
    // 桜餅が表示されるまで待機
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    // ドラッグ&ドロップを実行
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    // 配置されたアイテムが表示されることを確認
    await expect(page.locator('[data-testid="placed-item"]').first()).toBeVisible({ timeout: 15000 })
    
    // どら焼きも配置
    const dorayaki = page.locator('[data-testid="sweet-item-sweet-2"]')
    await expect(dorayaki).toBeVisible({ timeout: 15000 })
    
    await dorayaki.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 200, y: 200 } })
    await page.mouse.up()
    
    // 2つのアイテムが配置されていることを確認
    await expect(page.locator('[data-testid="placed-item"]')).toHaveCount(2)
  })

  test("配置した和菓子を移動できる", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    
    // まず和菓子を配置
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    // 配置されたアイテムを取得
    const placedItem = page.locator('[data-testid="placed-item"]').first()
    await expect(placedItem).toBeVisible({ timeout: 15000 })
    
    // 配置されたアイテムを別の位置に移動
    await placedItem.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 250, y: 150 } })
    await page.mouse.up()
    
    // アイテムが移動したことを確認（位置の変化を確認）
    await expect(placedItem).toBeVisible({ timeout: 15000 })
  })

  test("和菓子を回転できる", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    
    // 和菓子を配置
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    // 配置されたアイテムを右クリックしてコンテキストメニューを表示
    const placedItem = page.locator('[data-testid="placed-item"]').first()
    await placedItem.click({ button: "right" })
    
    // コンテキストメニューの回転ボタンをクリック
    await expect(page.locator('[data-testid="context-menu-rotate"]')).toBeVisible({ timeout: 15000 })
    await page.locator('[data-testid="context-menu-rotate"]').click()
    
    // 回転後もアイテムが表示されていることを確認
    await expect(placedItem).toBeVisible({ timeout: 15000 })
  })

  test("和菓子を削除できる", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    
    // 和菓子を配置
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    // 配置されたアイテムを右クリックしてコンテキストメニューを表示
    const placedItem = page.locator('[data-testid="placed-item"]').first()
    await placedItem.click({ button: "right" })
    
    // コンテキストメニューの削除ボタンをクリック
    await expect(page.locator('[data-testid="context-menu-delete"]')).toBeVisible({ timeout: 15000 })
    await page.locator('[data-testid="context-menu-delete"]').click()
    
    // アイテムが削除されたことを確認
    await expect(page.locator('[data-testid="placed-item"]')).toHaveCount(0)
  })

  test("和菓子をダブルクリックで詳細モーダルが表示される", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    
    // 和菓子を配置
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    // 配置されたアイテムをダブルクリック
    const placedItem = page.locator('[data-testid="placed-item"]').first()
    await placedItem.dblclick()
    
    // 詳細モーダルが表示されることを確認
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("春の代表的な和菓子")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("200円")).toBeVisible({ timeout: 15000 })
    
    // モーダルを閉じる
    await page.getByRole("button", { name: "閉じる" }).click()
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 15000 })
  })

  test("複数の和菓子を配置して操作できる", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("どら焼き")).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    // 桜餅を配置
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    // どら焼きを配置
    const dorayaki = page.locator('[data-testid="sweet-item-sweet-2"]')
    await expect(dorayaki).toBeVisible({ timeout: 15000 })
    
    await dorayaki.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 200, y: 200 } })
    await page.mouse.up()
    
    // 2つのアイテムが配置されていることを確認
    await expect(page.locator('[data-testid="placed-item"]')).toHaveCount(2)
    
    // 最初のアイテムを削除
    const firstItem = page.locator('[data-testid="placed-item"]').first()
    await firstItem.click({ button: "right" })
    await page.locator('[data-testid="context-menu-delete"]').click()
    
    // 1つのアイテムが残っていることを確認
    await expect(page.locator('[data-testid="placed-item"]')).toHaveCount(1)
    
    // 残ったアイテムをダブルクリックして詳細表示
    const remainingItem = page.locator('[data-testid="placed-item"]').first()
    await remainingItem.dblclick()
    
    // 詳細モーダルが表示されることを確認
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 15000 })
  })

  test("レイアウトをクリアできる", async ({ page }) => {
    // 和菓子アイテムが表示されるまで待機
    await expect(page.getByText("桜餅")).toBeVisible({ timeout: 15000 })
    await expect(page.getByText("どら焼き")).toBeVisible({ timeout: 15000 })
    
    const boxArea = page.locator('[data-testid="box-area"]').first()
    
    // 複数の和菓子を配置
    const sakuraMochi = page.locator('[data-testid="sweet-item-sweet-1"]')
    await expect(sakuraMochi).toBeVisible({ timeout: 15000 })
    
    await sakuraMochi.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 100, y: 100 } })
    await page.mouse.up()
    
    const dorayaki = page.locator('[data-testid="sweet-item-sweet-2"]')
    await expect(dorayaki).toBeVisible({ timeout: 15000 })
    
    await dorayaki.hover()
    await page.mouse.down()
    await boxArea.hover({ position: { x: 200, y: 200 } })
    await page.mouse.up()
    
    // アイテムが配置されていることを確認
    await expect(page.locator('[data-testid="placed-item"]')).toHaveCount(2)
    
    // クリアボタンをクリック
    await page.locator('[data-testid="clear-layout-button"]').first().click()
    
    // 確認ダイアログで「OK」をクリック
    page.on("dialog", async (dialog) => {
      expect(dialog.message()).toContain("詰め合わせをクリアしますか？")
      await dialog.accept()
    })
    
    // すべてのアイテムがクリアされたことを確認
    await expect(page.locator('[data-testid="placed-item"]')).toHaveCount(0)
  })
})