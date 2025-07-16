import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 シードデータの投入を開始します...')

  // 管理者ユーザーの作成
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  try {
    const adminUser = await prisma.adminUser.upsert({
      where: { email: 'admin@example.com' },
      update: {},
      create: {
        email: 'admin@example.com',
        password: hashedPassword,
        name: '管理者',
        role: 'super_admin'
      }
    })
    console.log('✅ 管理者ユーザーを作成しました:', adminUser.email)
  } catch (error) {
    console.log('ℹ️ 管理者ユーザーは既に存在します')
  }

  // カテゴリーの作成
  const categories = []
  try {
    const wagashiCategory = await prisma.category.upsert({
      where: { name: '和菓子' },
      update: {},
      create: {
        name: '和菓子',
        description: '伝統的な日本の和菓子'
      }
    })
    categories.push(wagashiCategory)
    console.log('✅ カテゴリーを作成しました: 和菓子')
  } catch (error) {
    console.log('ℹ️ カテゴリー「和菓子」は既に存在します')
    const existingCategory = await prisma.category.findUnique({
      where: { name: '和菓子' }
    })
    if (existingCategory) categories.push(existingCategory)
  }

  try {
    const yougashiCategory = await prisma.category.upsert({
      where: { name: '洋菓子' },
      update: {},
      create: {
        name: '洋菓子',
        description: '西洋風のケーキやクッキー'
      }
    })
    categories.push(yougashiCategory)
    console.log('✅ カテゴリーを作成しました: 洋菓子')
  } catch (error) {
    console.log('ℹ️ カテゴリー「洋菓子」は既に存在します')
    const existingCategory = await prisma.category.findUnique({
      where: { name: '洋菓子' }
    })
    if (existingCategory) categories.push(existingCategory)
  }

  try {
    const seasonalCategory = await prisma.category.upsert({
      where: { name: '季節限定' },
      update: {},
      create: {
        name: '季節限定',
        description: '季節に応じた特別な商品'
      }
    })
    categories.push(seasonalCategory)
    console.log('✅ カテゴリーを作成しました: 季節限定')
  } catch (error) {
    console.log('ℹ️ カテゴリー「季節限定」は既に存在します')
    const existingCategory = await prisma.category.findUnique({
      where: { name: '季節限定' }
    })
    if (existingCategory) categories.push(existingCategory)
  }

  if (categories.length === 0) {
    console.log('❌ カテゴリーが作成されませんでした')
    return
  }

  // 商品の作成
  const products = []
  
  try {
    const matchaDaifuku = await prisma.product.create({
      data: {
        name: '抹茶大福',
        price: 280,
        categoryId: categories[0].id,
        description: '抹茶餡と白餡の二層構造の大福',
        allergyInfo: '小麦、卵',
        calories: 180,
        size: '2x2',
        beforeImagePath: '/images/wagashi/daifuku_1.png',
        afterImagePath: '/images/wagashi/daifuku_2.png'
      }
    })
    products.push(matchaDaifuku)
    console.log('✅ 商品を作成しました: 抹茶大福')
  } catch (error) {
    console.log('ℹ️ 商品「抹茶大福」は既に存在します')
  }

  try {
    const sakuraMochi = await prisma.product.create({
      data: {
        name: '桜もち',
        price: 320,
        categoryId: categories[0].id,
        description: '桜の葉で包まれた春の和菓子',
        allergyInfo: '小麦',
        calories: 220,
        size: '2x3',
        beforeImagePath: '/images/wagashi/sakuramochi_1.png',
        afterImagePath: '/images/wagashi/sakuramochi_2.png'
      }
    })
    products.push(sakuraMochi)
    console.log('✅ 商品を作成しました: 桜もち')
  } catch (error) {
    console.log('ℹ️ 商品「桜もち」は既に存在します')
  }

  try {
    const dorayaki = await prisma.product.create({
      data: {
        name: 'どら焼き',
        price: 250,
        categoryId: categories[0].id,
        description: '小豆餡を挟んだ焼き菓子',
        allergyInfo: '小麦、卵',
        calories: 200,
        size: '3x3',
        beforeImagePath: '/images/wagashi/dorayaki_1.png',
        afterImagePath: '/images/wagashi/dorayaki_2.png'
      }
    })
    products.push(dorayaki)
    console.log('✅ 商品を作成しました: どら焼き')
  } catch (error) {
    console.log('ℹ️ 商品「どら焼き」は既に存在します')
  }

  try {
    const castella = await prisma.product.create({
      data: {
        name: 'カステラ',
        price: 450,
        categoryId: categories[1].id,
        description: 'ふわふわのスポンジケーキ',
        allergyInfo: '小麦、卵、牛乳',
        calories: 280,
        size: '3x4',
        beforeImagePath: '/images/wagashi/kasutera_1.png',
        afterImagePath: '/images/wagashi/kasutera_2.png'
      }
    })
    products.push(castella)
    console.log('✅ 商品を作成しました: カステラ')
  } catch (error) {
    console.log('ℹ️ 商品「カステラ」は既に存在します')
  }

  try {
    const kurimanju = await prisma.product.create({
      data: {
        name: '栗まんじゅう',
        price: 380,
        categoryId: categories[0].id,
        description: '栗餡を包んだ蒸し菓子',
        allergyInfo: '小麦',
        calories: 240,
        size: '2x2',
        beforeImagePath: '/images/wagashi/kurimannjuu_1.png',
        afterImagePath: '/images/wagashi/kurimannjuu_2.png'
      }
    })
    products.push(kurimanju)
    console.log('✅ 商品を作成しました: 栗まんじゅう')
  } catch (error) {
    console.log('ℹ️ 商品「栗まんじゅう」は既に存在します')
  }

  // 既存の商品を取得
  const existingProducts = await prisma.product.findMany()
  const allProducts = products.length > 0 ? products : existingProducts

  // 在庫の作成
  for (const product of allProducts) {
    try {
      await prisma.stock.upsert({
        where: { productId: product.id },
        update: {},
        create: {
          productId: product.id,
          quantity: Math.floor(Math.random() * 50) + 10 // 10-60個のランダム在庫
        }
      })
    } catch (error) {
      console.log(`ℹ️ 商品「${product.name}」の在庫は既に存在します`)
    }
  }

  console.log('✅ 在庫を作成しました')

  console.log('🎉 シードデータの投入が完了しました！')
  console.log('📧 管理者ログイン情報:')
  console.log('   メール: admin@example.com')
  console.log('   パスワード: admin123')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの投入に失敗しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 