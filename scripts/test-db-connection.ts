#!/usr/bin/env tsx

/**
 * データベース接続テストスクリプト
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function testConnection() {
  try {
    console.log('🔍 データベース接続をテスト中...')
    console.log('DATABASE_URL:', process.env.DATABASE_URL?.replace(/:[^:@]*@/, ':****@'))
    console.log('DIRECT_URL:', process.env.DIRECT_URL?.replace(/:[^:@]*@/, ':****@'))
    
    // 接続テスト
    await prisma.$connect()
    console.log('✅ データベースに正常に接続できました')
    
    // 簡単なクエリテスト
    const result = await prisma.$queryRaw`SELECT version()`
    console.log('📊 PostgreSQLバージョン:', result)
    
    // テーブル存在確認
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('📋 利用可能なテーブル:', tables)
    
  } catch (error) {
    console.error('❌ データベース接続エラー:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND')) {
        console.log('💡 ホスト名が見つかりません。URLを確認してください。')
      } else if (error.message.includes('ECONNREFUSED')) {
        console.log('💡 接続が拒否されました。ポート番号とファイアウォール設定を確認してください。')
      } else if (error.message.includes('authentication failed')) {
        console.log('💡 認証に失敗しました。ユーザー名とパスワードを確認してください。')
      } else if (error.message.includes('timeout')) {
        console.log('💡 接続がタイムアウトしました。ネットワーク接続を確認してください。')
      }
    }
    
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// スクリプト実行
if (require.main === module) {
  testConnection()
}