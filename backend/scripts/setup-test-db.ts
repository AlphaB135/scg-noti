import { PrismaClient } from '@prisma/client'
import { execSync } from 'child_process'
import { config } from 'dotenv'
import path from 'path'

// Load test environment variables
config({
  path: path.resolve(process.cwd(), '.env.test')
})

async function setupTestDb() {
  const dbUrl = process.env.DATABASE_URL
  if (!dbUrl) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  // Extract database name from connection string
  const dbMatch = dbUrl.match(/database=([^;]+)/)
  const dbName = dbMatch ? dbMatch[1] : null
  if (!dbName) {
    throw new Error('Could not extract database name from DATABASE_URL')
  }

  // Create connection to master database
  const baseUrl = dbUrl.replace(`database=${dbName}`, 'database=master')
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: baseUrl
      }
    }
  })

  try {    // Drop test database if it exists (with safety checks)
    await prisma.$executeRawUnsafe(`
      IF EXISTS (SELECT * FROM sys.databases WHERE name = '${dbName}')
      BEGIN
        IF DB_ID('${dbName}') IS NOT NULL
        BEGIN
          ALTER DATABASE [${dbName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;
          DROP DATABASE [${dbName}];
        END
      END
    `)

    // Create test database with proper configuration
    await prisma.$executeRawUnsafe(`
      CREATE DATABASE [${dbName}]
      COLLATE SQL_Latin1_General_CP1_CI_AS;
      
      ALTER DATABASE [${dbName}] SET READ_COMMITTED_SNAPSHOT ON;
      ALTER DATABASE [${dbName}] SET ALLOW_SNAPSHOT_ISOLATION ON;
    `)

    console.log(`Created test database: ${dbName}`)

    // Disconnect from postgres database
    await prisma.$disconnect()

    // Run migrations on test database
    console.log('Running migrations...')
    execSync('npx prisma migrate deploy', {
      env: { ...process.env, DATABASE_URL: dbUrl },
      stdio: 'inherit'
    })

    console.log('Test database setup complete!')
  } catch (error) {
    console.error('Error setting up test database:', error)
    await prisma.$disconnect()
    process.exit(1)
  }
}

setupTestDb()
