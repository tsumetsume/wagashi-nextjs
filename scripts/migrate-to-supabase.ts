#!/usr/bin/env tsx

/**
 * 既存のローカルPostgreSQLからSupabaseへのデータ移行スクリプト
 * 
 * 使用方法:
 * 1. 既存のデータベースのバックアップを取得
 * 2. Supabaseでテーブルを作成（Prisma migrateを実行）
 * 3. このスクリプトでデータを移行
 */

import { PrismaClient } from '@prisma/client'
import { supabaseAdmin } from '../lib/supabase'

// 移行元のデータベース（ローカル）
const sourceDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.SOURCE_DATABASE_URL || 'postgresql://wagashi_user:wagashi_password@localhost:5432/wagashi_simulator'
    }
  }
})

// 移行先のデータベース（Supabase）
const targetDb = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL // Supabase URL
    }
  }
})

async function migrateData() {
  try {
    console.log('🚀 データ移行を開始します...')

    // 1. AdminUsersの移行
    console.log('📝 AdminUsersを移行中...')
    const adminUsers = await sourceDb.adminUser.findMany()
    for (const user of adminUsers) {
      await targetDb.adminUser.upsert({
        where: { id: user.id },
        update: user,
        create: user
      })
    }
    console.log(`✅ AdminUsers: ${adminUsers.length}件移行完了`)

    // 2. Categoriesの移行
    console.log('📝 Categoriesを移行中...')
    const categories = await sourceDb.category.findMany()
    for (const category of categories) {
      await targetDb.category.upsert({
        where: { id: category.id },
        update: category,
        create: category
      })
    }
    console.log(`✅ Categories: ${categories.length}件移行完了`)

    // 3. Storesの移行
    console.log('📝 Storesを移行中...')
    const stores = await sourceDb.store.findMany()
    for (const store of stores) {
      await targetDb.store.upsert({
        where: { id: store.id },
        update: store,
        create: store
      })
    }
    console.log(`✅ Stores: ${stores.length}件移行完了`)

    // 4. BoxTypesの移行
    console.log('📝 BoxTypesを移行中...')
    const boxTypes = await sourceDb.boxType.findMany()
    for (const boxType of boxTypes) {
      await targetDb.boxType.upsert({
        where: { id: boxType.id },
        update: boxType,
        create: boxType
      })
    }
    console.log(`✅ BoxTypes: ${boxTypes.length}件移行完了`)

    // 5. Productsの移行
    console.log('📝 Productsを移行中...')
    const products = await sourceDb.product.findMany()
    for (const product of products) {
      await targetDb.product.upsert({
        where: { id: product.id },
        update: product,
        create: product
      })
    }
    console.log(`✅ Products: ${products.length}件移行完了`)

    // 6. Stocksの移行
    console.log('📝 Stocksを移行中...')
    const stocks = await sourceDb.stock.findMany()
    for (const stock of stocks) {
      await targetDb.stock.upsert({
        where: { 
          productId_storeId: {
            productId: stock.productId,
            storeId: stock.storeId
          }
        },
        update: stock,
        create: stock
      })
    }
    console.log(`✅ Stocks: ${stocks.length}件移行完了`)

    // 7. SavedLayoutsの移行
    console.log('📝 SavedLayoutsを移行中...')
    const savedLayouts = await sourceDb.savedLayout.findMany()
    for (const layout of savedLayouts) {
      await targetDb.savedLayout.upsert({
        where: { id: layout.id },
        update: layout,
        create: layout
      })
    }
    console.log(`✅ SavedLayouts: ${savedLayouts.length}件移行完了`)

    console.log('🎉 データ移行が完了しました！')

  } catch (error) {
    console.error('❌ データ移行中にエラーが発生しました:', error)
    process.exit(1)
  } finally {
    await sourceDb.$disconnect()
    await targetDb.$disconnect()
  }
}

// スクリプト実行
if (require.main === module) {
  migrateData()
}