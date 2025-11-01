import { test, expect } from "@playwright/test"

const storesFixture = [
  {
    id: "store-1",
    name: "銀座本店",
    description: "老舗の和菓子店",
    address: "東京都中央区銀座1-1-1",
    phone: "03-1234-5678",
    isActive: true,
  },
  {
    id: "store-2",
    name: "京都祇園店",
    description: "京都の趣を感じる店舗",
    address: "京都府京都市東山区祇園町",
    phone: "075-123-4567",
    isActive: true,
  },
]

const storeDetailFixture = {
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

const maintenanceSettingsFixture = {
  success: true,
  data: {
    maintenanceMode: false,
    maintenanceMessage: "",
    estimatedEndTime: null,
  },
}

test.describe("店舗選択ページ", () => {
  test("ホームから店舗選択へリダイレクトし、店舗がない場合の文言を表示する", async ({ page }) => {
    await page.route("**/api/stores", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    })

    await page.goto("/")
    await page.waitForResponse("**/api/stores")

    await expect(page).toHaveURL(/\/store-selection$/)
    await expect(page.getByText("利用可能な店舗がありません")).toBeVisible()
  })

  test("店舗一覧を表示し、選択するとシミュレーターに遷移する", async ({ page }) => {
    await page.route("**/api/stores", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(storesFixture),
      })
    })
    await page.route("**/api/stores/store-1", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(storeDetailFixture),
      })
    })
    await page.route("**/api/box-types", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(boxTypesFixture),
      })
    })
    await page.route("**/api/admin/settings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(maintenanceSettingsFixture),
      })
    })

    await page.goto("/store-selection")
    await page.waitForResponse("**/api/stores")

    await expect(page.getByRole("heading", { name: "和菓子詰め合わせシミュレーター" })).toBeVisible()
    await expect(page.getByText("銀座本店")).toBeVisible()
    await expect(page.getByText("京都祇園店")).toBeVisible()

    const selectButtons = page.getByRole("button", { name: "この店舗を選択" })
    await selectButtons.first().click()

    await expect(page).toHaveURL(/\/simulator$/)
    const selectedStoreId = await page.evaluate(() => window.localStorage.getItem("selectedStoreId"))
    expect(selectedStoreId).toBe("store-1")
  })

  test("取得エラー時にメッセージを表示する", async ({ page }) => {
    let firstAttempt = true
    await page.route("**/api/stores", async (route) => {
      if (firstAttempt) {
        firstAttempt = false
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ error: "Internal Server Error" }),
        })
      } else {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify(storesFixture),
        })
      }
    })
    await page.route("**/api/admin/settings", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(maintenanceSettingsFixture),
      })
    })

    await Promise.all([
      page.waitForResponse("**/api/stores", (response) => response.request().method() === "GET"),
      page.goto("/store-selection"),
    ])

    await expect(page.getByText("店舗データの取得に失敗しました")).toBeVisible()
  })
})
