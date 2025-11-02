import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 シードデータの投入を開始します...')

  // 箱タイプの作成
  const boxTypes = []
  const boxTypeData = [
    {
      size: '10x10',
      name: '小箱',
      price: 300,
      description: '少量の和菓子に最適な小さな箱です'
    },
    {
      size: '15x15',
      name: '中箱',
      price: 500,
      description: '中程度の量の和菓子に適した箱です'
    },
    {
      size: '20x20',
      name: '大箱',
      price: 800,
      description: 'たくさんの和菓子を詰め合わせできる大きな箱です'
    }
  ]

  for (const boxType of boxTypeData) {
    try {
      const createdBoxType = await prisma.boxType.upsert({
        where: { size: boxType.size },
        update: {},
        create: {
          size: boxType.size,
          name: boxType.name,
          price: boxType.price,
          description: boxType.description,
          isActive: true
        }
      })
      boxTypes.push(createdBoxType)
      console.log(`✅ 箱タイプを作成しました: ${boxType.name} (${boxType.size})`)
    } catch (error) {
      console.log(`ℹ️ 箱タイプ「${boxType.name}」は既に存在します`)
      const existingBoxType = await prisma.boxType.findUnique({
        where: { size: boxType.size }
      })
      if (existingBoxType) boxTypes.push(existingBoxType)
    }
  }

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

  // 商品データの定義（テスト用の固定IDを使用）
  const productData = [
    // 餅菓子
    {
      id: 'test-product-001',
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
      id: 'test-product-002',
      name: '柏餅',
      category: '餅菓子',
      price: 220,
      size: '2x1',
      description: '柏の葉で包んだ端午の節句の定番和菓子。こしあんと味噌あんの2種類をご用意しています。',
      allergyInfo: '大豆',
      calories: 190,
      beforeImagePath: '/images/wagashi/kashiwamochi_1.png',
      afterImagePath: '/images/wagashi/kashiwamochi_2.png',
      ingredients: '上新粉、砂糖、小豆餡、柏の葉',
      nutritionInfo: 'エネルギー: 190kcal、たんぱく質: 4g、脂質: 1g、炭水化物: 42g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    },
    {
      id: 'test-product-003',
      name: '草餅',
      category: '餅菓子',
      price: 180,
      size: '2x1',
      description: 'よもぎの香りが豊かな緑色の餅に粒あんを包んだ春の和菓子です。',
      allergyInfo: '大豆',
      calories: 170,
      beforeImagePath: '/images/wagashi/kusamochi_1.png',
      afterImagePath: '/images/wagashi/kusamochi_2.png',
      ingredients: '白玉粉、よもぎ、砂糖、小豆餡',
      nutritionInfo: 'エネルギー: 170kcal、たんぱく質: 3g、脂質: 1g、炭水化物: 38g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    },
    // 焼き菓子
    {
      id: 'test-product-004',
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
      id: 'test-product-005',
      name: '今川焼き',
      category: '焼き菓子',
      price: 150,
      size: '2x2',
      description: '外はカリッと中はふんわりの生地に甘い小豆餡がたっぷり入った庶民的な和菓子です。',
      allergyInfo: '小麦,卵',
      calories: 180,
      beforeImagePath: '/images/wagashi/imagawayaki_1.png',
      afterImagePath: '/images/wagashi/imagawayaki_2.png',
      ingredients: '小麦粉、砂糖、卵、小豆餡、ベーキングパウダー',
      nutritionInfo: 'エネルギー: 180kcal、たんぱく質: 5g、脂質: 3g、炭水化物: 36g',
      shelfLife: '製造日から2日間',
      storageMethod: '常温保存'
    },
    {
      id: 'test-product-006',
      name: 'カステラ',
      category: '焼き菓子',
      price: 300,
      size: '3x1',
      description: 'しっとりとした食感と上品な甘さが特徴の長崎名物カステラです。',
      allergyInfo: '小麦,卵',
      calories: 250,
      beforeImagePath: '/images/wagashi/castella_1.png',
      afterImagePath: '/images/wagashi/castella_2.png',
      ingredients: '小麦粉、砂糖、卵、水飴、蜂蜜',
      nutritionInfo: 'エネルギー: 250kcal、たんぱく質: 7g、脂質: 4g、炭水化物: 50g',
      shelfLife: '製造日から7日間',
      storageMethod: '常温保存'
    },
    // 水菓子
    {
      id: 'test-product-007',
      name: '水羊羹',
      category: '水菓子',
      price: 250,
      size: '2x1',
      description: '夏の定番、涼やかな口当たりの水羊羹です。上品な甘さで暑い日にぴったりです。',
      allergyInfo: '大豆',
      calories: 120,
      beforeImagePath: '/images/wagashi/mizuyoukan_1.png',
      afterImagePath: '/images/wagashi/mizuyoukan_2.png',
      ingredients: '小豆餡、寒天、砂糖',
      nutritionInfo: 'エネルギー: 120kcal、たんぱく質: 2g、脂質: 0g、炭水化物: 30g',
      shelfLife: '製造日から5日間',
      storageMethod: '冷蔵保存'
    },
    {
      id: 'test-product-008',
      name: 'くず餅',
      category: '水菓子',
      price: 200,
      size: '2x1',
      description: 'つるんとした食感が楽しいくず餅。黒蜜ときな粉でお召し上がりください。',
      allergyInfo: '大豆',
      calories: 140,
      beforeImagePath: '/images/wagashi/kuzumochi_1.png',
      afterImagePath: '/images/wagashi/kuzumochi_2.png',
      ingredients: 'くず粉、砂糖、黒蜜、きな粉',
      nutritionInfo: 'エネルギー: 140kcal、たんぱく質: 3g、脂質: 2g、炭水化物: 30g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    },
    {
      id: 'test-product-009',
      name: 'わらび餅',
      category: '水菓子',
      price: 180,
      size: '1x1',
      description: 'ぷるぷるの食感が特徴のわらび餅。きな粉と黒蜜の組み合わせが絶品です。',
      allergyInfo: '大豆',
      calories: 110,
      beforeImagePath: '/images/wagashi/warabimochi_1.png',
      afterImagePath: '/images/wagashi/warabimochi_2.png',
      ingredients: 'わらび粉、砂糖、きな粉、黒蜜',
      nutritionInfo: 'エネルギー: 110kcal、たんぱく質: 2g、脂質: 1g、炭水化物: 26g',
      shelfLife: '製造日から1日間',
      storageMethod: '冷蔵保存'
    },
    // 干菓子
    {
      id: 'test-product-010',
      name: '落雁',
      category: '干菓子',
      price: 120,
      size: '1x1',
      description: '上品な甘さの伝統的な干菓子。お茶請けに最適です。',
      allergyInfo: 'なし',
      calories: 80,
      beforeImagePath: '/images/wagashi/rakugan_1.png',
      afterImagePath: '/images/wagashi/rakugan_2.png',
      ingredients: '和三盆糖、寒梅粉、食紅',
      nutritionInfo: 'エネルギー: 80kcal、たんぱく質: 1g、脂質: 0g、炭水化物: 20g',
      shelfLife: '製造日から30日間',
      storageMethod: '常温保存'
    },
    {
      id: 'test-product-011',
      name: '金平糖',
      category: '干菓子',
      price: 100,
      size: '1x1',
      description: '小さな星型が可愛い伝統的な砂糖菓子。様々な色と味をお楽しみください。',
      allergyInfo: 'なし',
      calories: 60,
      beforeImagePath: '/images/wagashi/konpeitou_1.png',
      afterImagePath: '/images/wagashi/konpeitou_2.png',
      ingredients: '砂糖、食紅、香料',
      nutritionInfo: 'エネルギー: 60kcal、たんぱく質: 0g、脂質: 0g、炭水化物: 15g',
      shelfLife: '製造日から60日間',
      storageMethod: '常温保存'
    },
    // 蒸し菓子
    {
      id: 'test-product-012',
      name: '蒸しまんじゅう',
      category: '蒸し菓子',
      price: 160,
      size: '2x2',
      description: 'ふんわりとした蒸し生地に甘い餡が入った定番の蒸し菓子です。',
      allergyInfo: '小麦',
      calories: 160,
      beforeImagePath: '/images/wagashi/mushimanjuu_1.png',
      afterImagePath: '/images/wagashi/mushimanjuu_2.png',
      ingredients: '小麦粉、砂糖、小豆餡、ベーキングパウダー',
      nutritionInfo: 'エネルギー: 160kcal、たんぱく質: 4g、脂質: 2g、炭水化物: 34g',
      shelfLife: '製造日から3日間',
      storageMethod: '常温保存'
    },
    {
      id: 'test-product-013',
      name: '栗蒸し羊羹',
      category: '蒸し菓子',
      price: 280,
      size: '2x1',
      description: '栗がごろごろ入った贅沢な蒸し羊羹。秋の味覚をお楽しみください。',
      allergyInfo: '大豆',
      calories: 200,
      beforeImagePath: '/images/wagashi/kurimushiyoukan_1.png',
      afterImagePath: '/images/wagashi/kurimushiyoukan_2.png',
      ingredients: '小豆餡、栗、砂糖、小麦粉',
      nutritionInfo: 'エネルギー: 200kcal、たんぱく質: 4g、脂質: 3g、炭水化物: 42g',
      shelfLife: '製造日から5日間',
      storageMethod: '冷蔵保存'
    },
    // 季節限定
    {
      id: 'test-product-014',
      name: '桜大福',
      category: '季節限定',
      price: 240,
      size: '2x2',
      description: '春限定の桜風味の大福。桜餡と桜の花びらが春の訪れを告げます。',
      allergyInfo: '大豆',
      calories: 190,
      beforeImagePath: '/images/wagashi/sakuradaifuku_1.png',
      afterImagePath: '/images/wagashi/sakuradaifuku_2.png',
      ingredients: '白玉粉、砂糖、桜餡、桜の花びら',
      nutritionInfo: 'エネルギー: 190kcal、たんぱく質: 3g、脂質: 1g、炭水化物: 42g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    },
    {
      id: 'test-product-015',
      name: '栗きんとん',
      category: '季節限定',
      price: 320,
      size: '1x1',
      description: '秋の味覚、栗を使った上品な和菓子。栗本来の甘さを活かした逸品です。',
      allergyInfo: 'なし',
      calories: 150,
      beforeImagePath: '/images/wagashi/kurikinton_1.png',
      afterImagePath: '/images/wagashi/kurikinton_2.png',
      ingredients: '栗、砂糖',
      nutritionInfo: 'エネルギー: 150kcal、たんぱく質: 2g、脂質: 1g、炭水化物: 36g',
      shelfLife: '製造日から3日間',
      storageMethod: '冷蔵保存'
    },
    // 伝統菓子
    {
      id: 'test-product-016',
      name: '最中',
      category: '伝統菓子',
      price: 180,
      size: '2x1',
      description: 'パリッとした皮に餡がたっぷり入った伝統的な和菓子。食べる直前に餡を詰めて新鮮さを保ちます。',
      allergyInfo: '大豆',
      calories: 170,
      beforeImagePath: '/images/wagashi/monaka_1.png',
      afterImagePath: '/images/wagashi/monaka_2.png',
      ingredients: 'もち米、小豆餡、砂糖',
      nutritionInfo: 'エネルギー: 170kcal、たんぱく質: 4g、脂質: 1g、炭水化物: 38g',
      shelfLife: '製造日から7日間',
      storageMethod: '常温保存'
    },
    {
      id: 'test-product-017',
      name: '羊羹',
      category: '伝統菓子',
      price: 250,
      size: '3x1',
      description: '小豆の風味が濃厚な伝統的な羊羹。お茶との相性が抜群です。',
      allergyInfo: '大豆',
      calories: 180,
      beforeImagePath: '/images/wagashi/youkan_1.png',
      afterImagePath: '/images/wagashi/youkan_2.png',
      ingredients: '小豆餡、砂糖、寒天',
      nutritionInfo: 'エネルギー: 180kcal、たんぱく質: 3g、脂質: 1g、炭水化物: 42g',
      shelfLife: '製造日から14日間',
      storageMethod: '常温保存'
    },
    {
      id: 'test-product-018',
      name: '大福',
      category: '伝統菓子',
      price: 200,
      size: '2x2',
      description: 'やわらかい餅に甘い餡が包まれた定番の和菓子。老若男女に愛される味です。',
      allergyInfo: '大豆',
      calories: 180,
      beforeImagePath: '/images/wagashi/daifuku_1.png',
      afterImagePath: '/images/wagashi/daifuku_2.png',
      ingredients: '白玉粉、砂糖、小豆餡',
      nutritionInfo: 'エネルギー: 180kcal、たんぱく質: 4g、脂質: 1g、炭水化物: 40g',
      shelfLife: '製造日から2日間',
      storageMethod: '冷蔵保存'
    }
  ]

  // 商品を作成（固定IDを使用）
  for (const product of productData) {
    try {
      const createdProduct = await prisma.product.upsert({
        where: { id: product.id },
        update: {
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
        },
        create: {
          id: product.id,
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
      console.log(`✅ 商品を作成/更新しました: ${product.name} (ID: ${product.id})`)
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
      id: 'test-store-001',
      name: '新宿店',
      description: '新宿駅近くの便利な立地',
      address: '東京都新宿区新宿3-1-1',
      phone: '03-2345-6789'
    },
    {
      id: 'test-store-002',
      name: '銀座店',
      description: '高級感あふれる銀座の店舗',
      address: '東京都中央区銀座4-1-1',
      phone: '03-3456-7890'
    }
  ]

  for (const store of storeData) {
    try {
      const createdStore = await prisma.store.upsert({
        where: { id: store.id },
        update: {
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          isActive: true
        },
        create: {
          id: store.id,
          name: store.name,
          description: store.description,
          address: store.address,
          phone: store.phone,
          isActive: true
        }
      })
      stores.push(createdStore)
      console.log(`✅ 店舗を作成/更新しました: ${store.name} (ID: ${store.id})`)
    } catch (error) {
      console.log(`❌ 店舗「${store.name}」の作成に失敗しました:`, error)
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