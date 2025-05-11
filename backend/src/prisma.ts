// 📁 backend/src/prisma.ts
import { PrismaClient } from '@prisma/client'

export const prisma = new PrismaClient()
export const connect = async () => {
  try {
    await prisma.$connect()
    console.log('Connected to the database')
  } catch (error) {
    console.error('Error connecting to the database:', error)
  }
}