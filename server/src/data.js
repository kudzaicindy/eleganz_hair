export const packages = [
  {
    id: 'basic',
    name: 'Basic',
    price: 25,
    description: 'Perfect for beginners starting their wig revamp journey.',
    features: [
      'Access to 3 foundational courses',
      'Wig revamp fundamentals',
      'Monthly subscription — renew to keep access',
      'Mobile-friendly video player',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 45,
    description: 'Full access to all training content for serious stylists.',
    featured: true,
    features: [
      'Access to all courses',
      'Advanced customization techniques',
      'New videos added regularly',
      'Priority renewal reminders',
      'Certificate of completion',
    ],
  },
]

export const courses = [
  {
    id: 'wig-revamp-fundamentals',
    title: 'Wig Revamp Fundamentals',
    description: 'Learn the core techniques for transforming and refreshing wigs from scratch.',
    lessonCount: 4,
    duration: '1h 15m',
    packageIds: ['basic', 'premium'],
    thumbnail: '/wig2.jpg',
    lessons: [
      { id: 'wr-1', title: 'Welcome & Essential Tools', duration: '12:05', order: 1, videoUrl: '/revamp%20video.mp4' },
      { id: 'wr-2', title: 'Assessing Wig Condition', duration: '18:30', order: 2, videoUrl: '/revamp%20video.mp4' },
      { id: 'wr-3', title: 'Deep Clean & Detangle', duration: '22:10', order: 3, videoUrl: '/revamp%20video.mp4' },
      { id: 'wr-4', title: 'Silk Press Finish', duration: '24:15', order: 4, videoUrl: '/revamp%20video.mp4' },
    ],
  },
  {
    id: 'customization-masterclass',
    title: 'Customization Masterclass',
    description: 'Advanced methods for cutting, colouring, and styling custom wigs.',
    lessonCount: 4,
    duration: '1h 40m',
    packageIds: ['premium'],
    thumbnail: '/wig3.jpg',
    lessons: [
      { id: 'cm-1', title: 'Lace Mapping & Plucking', duration: '28:00', order: 1 },
      { id: 'cm-2', title: 'Tinting the Lace', duration: '19:45', order: 2 },
      { id: 'cm-3', title: 'Custom Cut & Layers', duration: '26:20', order: 3 },
      { id: 'cm-4', title: 'Hairline Melting Technique', duration: '21:30', order: 4 },
    ],
  },
  {
    id: 'client-consultation',
    title: 'Client Consultation & Business',
    description: 'How to consult clients, price your services, and grow your wig business.',
    lessonCount: 3,
    duration: '58m',
    packageIds: ['premium'],
    thumbnail: '/hair.jpg',
    lessons: [
      { id: 'cc-1', title: 'Consultation That Converts', duration: '20:15', order: 1 },
      { id: 'cc-2', title: 'Pricing Your Revamp Services', duration: '18:40', order: 2 },
      { id: 'cc-3', title: 'Building Repeat Clients', duration: '19:05', order: 3 },
    ],
  },
]
