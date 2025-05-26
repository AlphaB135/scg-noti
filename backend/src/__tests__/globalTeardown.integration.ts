import { prisma } from '../prisma'

// Global teardown after all integration tests complete
export default async function globalTeardown() {
  // Disconnect Prisma client
  await prisma.$disconnect()
}
