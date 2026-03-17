/**
 * LinkSphere - Database Seed Script
 * Populates the database with initial data
 */

import { db } from '@/lib/db'
import { TOTAL_SLOTS } from '@/lib/constants'
import { calculateSlotPosition } from '@/lib/slot-utils'

async function main() {
  console.log('🌱 Seeding database...')

  // Create languages
  console.log('Creating languages...')
  const languages = await Promise.all([
    db.language.upsert({
      where: { code: 'en' },
      update: {},
      create: { code: 'en', name: 'English', nativeName: 'English', isDefault: true },
    }),
    db.language.upsert({
      where: { code: 'fr' },
      update: {},
      create: { code: 'fr', name: 'French', nativeName: 'Français' },
    }),
    db.language.upsert({
      where: { code: 'es' },
      update: {},
      create: { code: 'es', name: 'Spanish', nativeName: 'Español' },
    }),
    db.language.upsert({
      where: { code: 'de' },
      update: {},
      create: { code: 'de', name: 'German', nativeName: 'Deutsch' },
    }),
  ])
  console.log(`Created ${languages.length} languages`)

  // Create countries
  console.log('Creating countries...')
  const countries = await Promise.all([
    db.country.upsert({
      where: { code: 'US' },
      update: {},
      create: { code: 'US', name: 'United States', continent: 'North America', flagEmoji: '🇺🇸' },
    }),
    db.country.upsert({
      where: { code: 'GB' },
      update: {},
      create: { code: 'GB', name: 'United Kingdom', continent: 'Europe', flagEmoji: '🇬🇧' },
    }),
    db.country.upsert({
      where: { code: 'FR' },
      update: {},
      create: { code: 'FR', name: 'France', continent: 'Europe', flagEmoji: '🇫🇷' },
    }),
    db.country.upsert({
      where: { code: 'DE' },
      update: {},
      create: { code: 'DE', name: 'Germany', continent: 'Europe', flagEmoji: '🇩🇪' },
    }),
    db.country.upsert({
      where: { code: 'ES' },
      update: {},
      create: { code: 'ES', name: 'Spain', continent: 'Europe', flagEmoji: '🇪🇸' },
    }),
    db.country.upsert({
      where: { code: 'CA' },
      update: {},
      create: { code: 'CA', name: 'Canada', continent: 'North America', flagEmoji: '🇨🇦' },
    }),
  ])
  console.log(`Created ${countries.length} countries`)

  // Create categories
  console.log('Creating categories...')
  const categories = await Promise.all([
    db.category.upsert({
      where: { slug: 'technology' },
      update: {},
      create: { slug: 'technology', name: 'Technology', icon: 'Code', color: '#3b82f6', sortOrder: 1 },
    }),
    db.category.upsert({
      where: { slug: 'ecommerce' },
      update: {},
      create: { slug: 'ecommerce', name: 'E-Commerce', icon: 'ShoppingBag', color: '#22c55e', sortOrder: 2 },
    }),
    db.category.upsert({
      where: { slug: 'business' },
      update: {},
      create: { slug: 'business', name: 'Business', icon: 'Building2', color: '#8b5cf6', sortOrder: 3 },
    }),
    db.category.upsert({
      where: { slug: 'creative' },
      update: {},
      create: { slug: 'creative', name: 'Creative', icon: 'Palette', color: '#ec4899', sortOrder: 4 },
    }),
    db.category.upsert({
      where: { slug: 'gaming' },
      update: {},
      create: { slug: 'gaming', name: 'Gaming', icon: 'Gamepad2', color: '#ef4444', sortOrder: 5 },
    }),
    db.category.upsert({
      where: { slug: 'education' },
      update: {},
      create: { slug: 'education', name: 'Education', icon: 'GraduationCap', color: '#f59e0b', sortOrder: 6 },
    }),
    db.category.upsert({
      where: { slug: 'health' },
      update: {},
      create: { slug: 'health', name: 'Health & Wellness', icon: 'Heart', color: '#10b981', sortOrder: 7 },
    }),
    db.category.upsert({
      where: { slug: 'finance' },
      update: {},
      create: { slug: 'finance', name: 'Finance', icon: 'DollarSign', color: '#06b6d4', sortOrder: 8 },
    }),
    db.category.upsert({
      where: { slug: 'travel' },
      update: {},
      create: { slug: 'travel', name: 'Travel', icon: 'Plane', color: '#0ea5e9', sortOrder: 9 },
    }),
    db.category.upsert({
      where: { slug: 'other' },
      update: {},
      create: { slug: 'other', name: 'Other', icon: 'MoreHorizontal', color: '#6b7280', sortOrder: 99 },
    }),
  ])
  console.log(`Created ${categories.length} categories`)

  // Create global stats
  console.log('Creating global stats...')
  await db.globalStats.upsert({
    where: { id: 'global' },
    update: {},
    create: {
      id: 'global',
      totalSlots: TOTAL_SLOTS,
      availableSlots: TOTAL_SLOTS,
      soldSlots: 0,
      reservedSlots: 0,
      totalRevenue: 0,
    },
  })

  // Create sample admin user
  console.log('Creating admin user...')
  const adminUser = await db.user.upsert({
    where: { email: 'admin@linksphere.com' },
    update: {},
    create: {
      email: 'admin@linksphere.com',
      name: 'Admin',
      role: 'ADMIN',
      locale: 'en',
    },
  })
  console.log(`Created admin user: ${adminUser.email}`)

  // Create sample slots (first 1000 only for demo)
  console.log('Creating sample slots (first 1000)...')
  const batchSize = 100
  const sampleSize = 1000
  
  for (let i = 0; i < sampleSize; i += batchSize) {
    const batch = []
    for (let j = 0; j < batchSize && i + j < sampleSize; j++) {
      const slotNumber = i + j + 1
      const pos = calculateSlotPosition(slotNumber)
      
      batch.push(
        db.slot.upsert({
          where: { slotNumber },
          update: {},
          create: {
            slotNumber,
            theta: pos.theta,
            phi: pos.phi,
            status: 'AVAILABLE',
          },
        })
      )
    }
    
    await Promise.all(batch)
    console.log(`Created slots ${i + 1} to ${Math.min(i + batchSize, sampleSize)}`)
  }

  console.log('✅ Seeding complete!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
