import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '../src/generated/prisma/index.js'

const databaseUrl = process.env.DATABASE_URL ?? 'postgresql://goldzen_user:hLsMUqw54iB3QprpaJNoVmI6P4LquZsy@localhost:5432/goldzen_db?schema=public'

const pool = new pg.Pool({ connectionString: databaseUrl })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Seeding database...')
  console.log('PRISMA KEYS:', Object.keys(prisma).filter(k => !k.startsWith('_')))

  // Clear existing data
  await prisma.referral.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.article.deleteMany()
  await prisma.user.deleteMany()

  // 1. Seed Products
  const products = [
    {
      name: 'Красный Мухомор (Шляпки)',
      description: 'Отборные сушеные шляпки Amanita Muscaria. Собран в экологически чистых лесах Алтая. Идеально для вечернего расслабления, улучшения сна и снижения тревожности.',
      category: 'fly_agaric',
      priceIdr: 250000, // Rp 250,000
      priceVnd: 400000, // 400,000 ₫
      priceUsdt: 17,
      priceRub: 1500,
      imageUrl: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?q=80&w=300&auto=format&fit=crop',
      size: '50г',
      stock: 100
    },
    {
      name: 'Красный Мухомор (Порошок)',
      description: 'Молотые в пудру шляпки Amanita Muscaria. Удобная форма для заваривания чая или микродозинга. Нормализует сон, снижает тягу к сладкому и алкоголю.',
      category: 'fly_agaric',
      priceIdr: 270000,
      priceVnd: 430000,
      priceUsdt: 18,
      priceRub: 1600,
      imageUrl: 'https://images.unsplash.com/photo-1618160702438-9b02ab6515c9?q=80&w=300&auto=format&fit=crop',
      size: '50г',
      stock: 85
    },
    {
      name: 'Пантерный Гриб (Шляпки)',
      description: 'Сушеные шляпки Amanita Pantherina. В 4-5 раз мощнее красного мухомора. Требует строгого соблюдения дозировки. Для опытных практиков: глубокая концентрация, ясность ума и энергия.',
      category: 'panther',
      priceIdr: 600000,
      priceVnd: 950000,
      priceUsdt: 40,
      priceRub: 3500,
      imageUrl: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=300&auto=format&fit=crop',
      size: '25г',
      stock: 50
    },
    {
      name: 'Ежовик Гребенчатый (Lion\'s Mane)',
      description: 'Уникальный ноотропный гриб. Стимулирует рост клеток мозга (NGF), улучшает память, фокус, внимание и творческие способности. Абсолютно легален и не токсичен.',
      category: 'regular',
      priceIdr: 300000,
      priceVnd: 470000,
      priceUsdt: 20,
      priceRub: 1800,
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=300&auto=format&fit=crop',
      size: '100г',
      stock: 120
    },
    {
      name: 'Кордицепс Военный (Cordyceps)',
      description: 'Натуральный энергетик и биостимулятор. Повышает уровень кислорода в крови, выносливость, укрепляет иммунитет и дает мощный заряд бодрости на весь день.',
      category: 'regular',
      priceIdr: 320000,
      priceVnd: 500000,
      priceUsdt: 22,
      priceRub: 1900,
      imageUrl: 'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?q=80&w=300&auto=format&fit=crop',
      size: '50г',
      stock: 90
    },
    {
      name: 'Настойка Мухомора Концентрированная',
      description: 'Спиртовая вытяжка Amanita Muscaria для наружного применения. Снимает боли в суставах, мышцах, помогает при дерматитах, радикулите и ушибах.',
      category: 'tincture',
      priceIdr: 200000,
      priceVnd: 310000,
      priceUsdt: 14,
      priceRub: 1200,
      imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?q=80&w=300&auto=format&fit=crop',
      size: '50 мл',
      stock: 60
    },
    {
      name: 'Набор «Сила Разума + Спокойствие»',
      description: 'Комплект из Красного Мухомора (50г) и Ежовика Гребенчатого (100г). Идеальный баланс для снятия стресса и одновременного повышения умственной продуктивности.',
      category: 'set',
      priceIdr: 500000,
      priceVnd: 780000,
      priceUsdt: 33,
      priceRub: 2900,
      imageUrl: 'https://images.unsplash.com/photo-1550572017-edd951b55104?q=80&w=300&auto=format&fit=crop',
      size: '1 компл',
      stock: 40
    }
  ]

  for (const product of products) {
    await prisma.product.create({ data: product })
  }

  // 2. Seed Articles (Полезные материалы)
  const articles = [
    {
      title: 'Что такое Мухоморный Микродозинг?',
      content: 'Микродозинг — это употребление сверхмалых доз сушеного гриба (обычно от 0.3 до 1 грамма в сутки), которые не вызывают измененного состояния сознания, но оказывают терапевтический эффект. Люди используют красный мухомор для борьбы со стрессом, нормализации сна, повышения работоспособности и избавления от вредных привычек.',
      imageUrl: 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?q=80&w=500&auto=format&fit=crop',
      readTime: '4 мин'
    },
    {
      title: 'Ежовик Гребенчатый: Естественный ноотроп',
      content: 'Ежовик гребенчатый (Hericium erinaceus) содержит вещества гериценоны и эринацины, которые легко преодолевают гематоэнцефалический барьер и стимулируют выработку фактора роста нервов (NGF). Это способствует регенерации нейронов, улучшает синаптическую пластичность, память и защищает мозг от когнитивных возрастных изменений.',
      imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=500&auto=format&fit=crop',
      readTime: '6 мин'
    },
    {
      title: 'Правила безопасности при приеме Пантерного гриба',
      content: 'Пантерный мухомор (Amanita Pantherina) содержит не только мусцимол, но и повышенную концентрацию гиосциамина и скополамина. Этот гриб значительно активнее красного. Начинать практику рекомендуется строго после консультации, в дозировках не превышающих 0.1-0.2г, чтобы избежать сильного седативного или психоактивного эффекта.',
      imageUrl: 'https://images.unsplash.com/photo-1534126511673-b6899657816a?q=80&w=500&auto=format&fit=crop',
      readTime: '5 мин'
    }
  ]

  for (const article of articles) {
    await prisma.article.create({ data: article })
  }

  // 3. Seed an Admin User for testing
  await prisma.user.create({
    data: {
      id: '123456789', // Matches our mock admin tg ID / testing ID
      username: 'Romantra',
      firstName: 'Roman',
      lastName: 'Parmen',
      role: 1, // ADMIN
      region: 'Bali',
      currency: 'IDR',
      address: 'Bali, Ubud, Monkey Forest Str, 45',
      bonusBalance: 150000
    }
  })

  console.log('Database successfully seeded!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
