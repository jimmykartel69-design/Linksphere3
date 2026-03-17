/**
 * LinkSphere - Categories Section
 * Category showcase for homepage
 */

'use client'

import Link from 'next/link'
import { 
  Code, 
  ShoppingBag, 
  Building2, 
  Palette, 
  Gamepad2, 
  GraduationCap,
  Heart,
  Plane,
  MoreHorizontal
} from 'lucide-react'

// Format number with consistent locale (en-US) to avoid hydration mismatch
function formatNumber(num: number): string {
  return num.toLocaleString('en-US')
}

const categories = [
  { name: 'Technology', icon: Code, slug: 'technology', color: 'from-blue-500 to-cyan-500', count: 1250 },
  { name: 'E-Commerce', icon: ShoppingBag, slug: 'ecommerce', color: 'from-green-500 to-emerald-500', count: 890 },
  { name: 'Business', icon: Building2, slug: 'business', color: 'from-purple-500 to-violet-500', count: 720 },
  { name: 'Creative', icon: Palette, slug: 'creative', color: 'from-pink-500 to-rose-500', count: 650 },
  { name: 'Gaming', icon: Gamepad2, slug: 'gaming', color: 'from-red-500 to-orange-500', count: 540 },
  { name: 'Education', icon: GraduationCap, slug: 'education', color: 'from-yellow-500 to-amber-500', count: 430 },
  { name: 'Health', icon: Heart, slug: 'health', color: 'from-emerald-500 to-teal-500', count: 380 },
  { name: 'Travel', icon: Plane, slug: 'travel', color: 'from-sky-500 to-blue-500', count: 290 },
]

export function CategoriesSection() {
  return (
    <section id="categories" className="py-24 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Explore by Category
          </h2>
          <p className="text-white/60 max-w-2xl mx-auto">
            Discover slots across various industries and interests
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((category) => (
            <Link
              key={category.slug}
              href={`/category/${category.slug}`}
              className="group relative p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <category.icon className="w-5 h-5 text-white" />
              </div>
              
              {/* Content */}
              <h3 className="text-white font-medium mb-1">{category.name}</h3>
              <p className="text-white/40 text-sm">{formatNumber(category.count)} slots</p>
            </Link>
          ))}
          
          {/* More categories */}
          <Link
            href="/categories"
            className="group relative p-6 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300 hover:-translate-y-1 flex items-center justify-center"
          >
            <div className="text-center">
              <MoreHorizontal className="w-8 h-8 text-white/50 mx-auto mb-2 group-hover:text-white/70 transition-colors" />
              <span className="text-white/50 text-sm group-hover:text-white/70 transition-colors">
                View All
              </span>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}

export default CategoriesSection
