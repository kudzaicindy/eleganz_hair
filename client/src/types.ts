export interface Package {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  featured?: boolean
}

export interface Lesson {
  id: string
  title: string
  duration: string
  order: number
  videoUrl?: string
}

export interface Course {
  id: string
  title: string
  description: string
  lessonCount: number
  duration: string
  packageIds: string[]
  thumbnail?: string
  lessons?: Lesson[]
}

export interface Subscription {
  id: string
  packageId: string
  packageName: string
  status: 'active' | 'expired' | 'cancelled'
  expiresAt: string
  price: number
}

export interface User {
  id: string
  name: string
  email: string
  subscription?: Subscription
}

export interface DashboardData {
  user: User
  subscription: Subscription | null
  courses: Course[]
  completedLessons?: string[]
}
