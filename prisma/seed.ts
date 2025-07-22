import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 シードデータの投入を開始します...')

  // 管理者ユーザーの作成
  const hashedPassword = await bcrypt.hash('I9mJCaDrscR06kV', 12)
  
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
  const categories: any[] = []
  
  // 和菓子のカテゴリーを追加
  const categoryNames = [
    '焼き菓子',
    '餅菓子', 
    '水菓子',
    '干菓子',
    '蒸し菓子',
    '季節限定',
    '伝統菓子'
  ]

  for (const categoryName of categoryNames) {
    try {
      const category = await prisma.category.upsert({
        where: { name: categoryName },
        update: {},
        create: {
          name: categoryName,
          description: `${categoryName}の和菓子`
        }
      })
      categories.push(category)
      console.log(`✅ カテゴリーを作成しました: ${categoryName}`)
    } catch (error) {
      console.log(`ℹ️ カテゴリー「${categoryName}」は既に存在します`)
      const existingCategory = await prisma.category.findUnique({
        where: { name: categoryName }
      })
      if (existingCategory) categories.push(existingCategory)
    }
  }

  if (categories.length === 0) {
    console.log('❌ カテゴリーが作成されませんでした')
    return
  }

  // 商品の作成
  const products = []
  
  // カテゴリーIDを取得する関数
  const getCategoryId = (categoryName: string) => {
    const category = categories.find(c => c.name === categoryName)
    return category?.id || categories[0]?.id
  }

  // 商品データの定義
  const productData = [
    {
      name: '栗饅頭',
      category: '焼き菓子',
      price: 250,
      size: '2x2',
      description: '栗の風味豊かな饅頭です。厳選された栗を使用し、上品な甘さに仕上げました。お茶と一緒にお楽しみください。',
      allergyInfo: '小麦,卵',
      calories: 220,
      beforeImagePath: '/images/wagashi/kurimannjuu_1.png',
      afterImagePath: '/images/wagashi/kurimannjuu_2.png',
      ingredients: '小麦粉、砂糖、栗餡、卵、ベーキングパウダー',
      nutritionInfo: 'エネルギー: 220kcal、たんぱく質: 4g、脂質: 6g、炭水化物: 42g',
      shelfLife: '製造日から5日間',
      storageMethod: '常温保存'
    },
    {
      name: '最中',
      category: '焼き菓子',
      price: 180,
      size: '2x1',
      description: 'サクサクとした最中皮の中に、なめらかな餡がたっぷり入っています。伝統的な製法で作られた逸品です。',
      allergyInfo: '小麦',
      calories: 180,
      beforeImagePath: '/images/wagashi/monaka_1.png',
      afterImagePath: '/images/wagashi/monaka_2.png',
      ingredients: '小麦粉、砂糖、小豆餡、食塩',
      nutritionInfo: 'エネルギー: 180kcal、たんぱく質: 3g、脂質: 2g、炭水化物: 38g',
      shelfLife: '製造日から30日間',
      storageMethod: '常温保存'
    },
    {
      name: 'どら焼き',
      category: '焼き菓子',
      price: 200,
      size: '2x2',
      description: 'ふんわりとした生地で包まれた粒あんが絶妙な味わいのどら焼きです。朝夕のおやつにぴったりです。',
      allergyInfo: '小麦,卵',
      calories: 210,
      beforeImagePath: '/images/wagashi/dorayaki_1.png',
      afterImagePath: '/images/wagashi/dorayaki_2.png',
      ingredients: '小麦粉、砂糖、卵、牛乳、小豆餡、ベーキングパウダー',
      nutritionInfo: 'エネルギー: 210kcal、たんぱく質: 6g、脂質: 5g、炭水化物: 40g',
      shelfLife: '製造日から3日間',
      storageMethod: '常温保存'
    },
    {
      name: '大福',
      category: '餅菓子',
      price: 220,
      size: '2x2',
      description: 'もちもちとした食感の大福です。上質な餡を使用し、職人が一つ一つ丁寧に仕上げています。',
      allergyInfo: '大豆',
      calories: 230,
      beforeImagePath: '/images/wagashi/daifuku_1.png',
      afterImagePath: '/images/wagashi/daifuku_2.png',
      ingredients: '白玉粉、砂糖、小豆餡、食紅',
      nutritionInfo: 'エネルギー: 230kcal、たんぱく質: 4g、脂質: 2g、炭水化物: 48g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    },
    {
      name: '桜餅',
      category: '餅菓子',
      price: 200,
      size: '2x1',
      description: '桜の葉の塩漬けで包んだ風味豊かな桜餅です。春の訪れを感じる季節限定の和菓子です。',
      allergyInfo: '小麦,大豆',
      calories: 180,
      beforeImagePath: '/images/wagashi/sakuramochi_1.png',
      afterImagePath: '/images/wagashi/sakuramochi_2.png',
      ingredients: '白玉粉、砂糖、小豆餡、桜の葉、食紅',
      nutritionInfo: 'エネルギー: 180kcal、たんぱく質: 3g、脂質: 2g、炭水化物: 38g',
      shelfLife: '製造日から3日間',
      storageMethod: '冷蔵保存'
    },
    {
      name: '羊羹',
      category: '水菓子',
      price: 300,
      size: '4x1',
      description: 'なめらかな舌触りの羊羹です。厳選された小豆を使用し、上品な甘さに仕上げました。薄く切ってお茶と一緒にどうぞ。',
      allergyInfo: '大豆',
      calories: 260,
      beforeImagePath: '/images/wagashi/youkan_1.png',
      afterImagePath: '/images/wagashi/youkan_2.png',
      ingredients: '小豆、砂糖、寒天、食塩',
      nutritionInfo: 'エネルギー: 260kcal、たんぱく質: 5g、脂質: 1g、炭水化物: 58g',
      shelfLife: '製造日から7日間',
      storageMethod: '常温保存'
    },
    {
      name: 'カステラ',
      category: '焼き菓子',
      price: 450,
      size: '5x2',
      description: 'ふわふわとした食感のカステラです。卵の風味が豊かで、上品な甘さに仕上げました。',
      allergyInfo: '小麦,卵',
      calories: 280,
      beforeImagePath: '/images/wagashi/kasutera_1.png',
      afterImagePath: '/images/wagashi/kasutera_2.png',
      ingredients: '小麦粉、砂糖、卵、蜂蜜、バニラエッセンス',
      nutritionInfo: 'エネルギー: 280kcal、たんぱく質: 8g、脂質: 12g、炭水化物: 45g',
      shelfLife: '製造日から7日間',
      storageMethod: '常温保存'
    },
    {
      name: 'いちご大福',
      category: '餅菓子',
      price: 250,
      size: '2x2',
      description: 'いちごと白餡を包んだ春の大福です。いちごの酸味と餡の甘さが絶妙なバランスです。',
      allergyInfo: '大豆',
      calories: 240,
      beforeImagePath: '/ichigo-daifuku.png',
      afterImagePath: '/ichigo-daifuku.png',
      ingredients: '白玉粉、砂糖、白餡、いちご、食紅',
      nutritionInfo: 'エネルギー: 240kcal、たんぱく質: 4g、脂質: 2g、炭水化物: 50g',
      shelfLife: '製造日から1日間',
      storageMethod: '冷蔵保存'
    },
    {
      name: 'みたらし団子',
      category: '餅菓子',
      price: 220,
      size: '1x3',
      description: '醤油ベースの甘辛いタレをかけた団子です。香ばしい香りと絶妙な味わいが特徴です。',
      allergyInfo: '小麦,大豆',
      calories: 200,
      beforeImagePath: '/images/wagashi/mitarashi-dango_1.png',
      afterImagePath: '/images/wagashi/mitarashi-dango_2.png',
      ingredients: '白玉粉、砂糖、醤油、みりん、片栗粉',
      nutritionInfo: 'エネルギー: 200kcal、たんぱく質: 4g、脂質: 1g、炭水化物: 44g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    },
    {
      name: 'あんみつ',
      category: '水菓子',
      price: 380,
      size: '3x3',
      description: '寒天、小豆餡、フルーツを盛り合わせた涼やかな和菓子です。夏にぴったりの一品です。',
      allergyInfo: '大豆',
      calories: 320,
      beforeImagePath: '/anmitsu.png',
      afterImagePath: '/anmitsu.png',
      ingredients: '寒天、小豆餡、フルーツ、黒蜜、白玉',
      nutritionInfo: 'エネルギー: 320kcal、たんぱく質: 6g、脂質: 2g、炭水化物: 68g',
      shelfLife: '製造日から1日間',
      storageMethod: '冷蔵保存'
    }
  ]

  // 商品を作成
  for (const product of productData) {
    try {
      // 既存の商品をチェック
      const existingProduct = await prisma.product.findFirst({
        where: { name: product.name }
      })
      
      if (existingProduct) {
        console.log(`ℹ️ 商品「${product.name}」は既に存在します`)
        products.push(existingProduct)
        continue
      }

      const createdProduct = await prisma.product.create({
        data: {
          name: product.name,
          price: product.price,
          categoryId: getCategoryId(product.category),
          description: product.description,
          allergyInfo: product.allergyInfo,
          calories: product.calories,
          size: product.size,
          beforeImagePath: product.beforeImagePath,
          afterImagePath: product.afterImagePath,
          ingredients: product.ingredients,
          nutritionInfo: product.nutritionInfo,
          shelfLife: product.shelfLife,
          storageMethod: product.storageMethod
        }
      })
      products.push(createdProduct)
      console.log(`✅ 商品を作成しました: ${product.name}`)
    } catch (error) {
      console.log(`❌ 商品「${product.name}」の作成に失敗しました:`, error)
    }
  }

  // 既存の商品を取得
  const existingProducts = await prisma.product.findMany()
  const allProducts = products.length > 0 ? products : existingProducts

  // 店舗の作成
  const stores = []
  const storeData = [
    {
      name: '本店',
      description: 'メインの店舗です',
      address: '東京都渋谷区神宮前1-1-1',
      phone: '03-1234-5678'
    },
    {
      name: '新宿店',
      description: '新宿駅近くの便利な立地',
      address: '東京都新宿区新宿3-1-1',
      phone: '03-2345-6789'
    },
    {
      name: '銀座店',
      description: '高級感あふれる銀座の店舗',
      address: '東京都中央区銀座4-1-1',
      phone: '03-3456-7890'
    }
  ]

  for (const store of storeData) {
    try {
      const createdStore = await prisma.store.upsert({
        where: { name: store.name },
        update: {},
        create: {
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          isActive: true
        }
      })
      stores.push(createdStore)
      console.log(`✅ 店舗を作成しました: ${store.name}`)
    } catch (error) {
      console.log(`ℹ️ 店舗「${store.name}」は既に存在します`)
      const existingStore = await prisma.store.findUnique({
        where: { name: store.name }
      })
      if (existingStore) stores.push(existingStore)
    }
  }

  // 既存の店舗を取得
  const existingStores = await prisma.store.findMany()
  const allStores = stores.length > 0 ? stores : existingStores

  // 店舗別在庫の作成
  for (const store of allStores) {
    for (const product of allProducts) {
      try {
        await prisma.stock.upsert({
          where: { 
            productId_storeId: {
              productId: product.id,
              storeId: store.id
            }
          },
          update: {},
          create: {
            productId: product.id,
            storeId: store.id,
            quantity: Math.floor(Math.random() * 50) + 10 // 10-60個のランダム在庫
          }
        })
      } catch (error) {
        console.log(`ℹ️ 店舗「${store.name}」の商品「${product.name}」の在庫は既に存在します`)
      }
    }
    console.log(`✅ 店舗「${store.name}」の在庫を作成しました`)
  }

  console.log('🎉 シードデータの投入が完了しました！')
  console.log('📧 管理者ログイン情報:')
  console.log('   メール: admin@example.com')
  console.log('   パスワード: I9mJCaDrscR06kV')
}

main()
  .catch((e) => {
    console.error('❌ シードデータの投入に失敗しました:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 