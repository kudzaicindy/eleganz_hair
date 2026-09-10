/** Site media — hero stays original; courses/gallery/videos use /public uploads */
export const videos = {
  revamp: '/revamp%20video.mp4',
} as const

export const images = {
  hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1920&q=85',
  courses: {
    revamp: '/wig2.jpg',
    frontal: '/wig3.jpg',
    colour: '/wig4.jpg',
    consultation: '/hair.jpg',
  },
  gallery: {
    silkPress: '/wig2.jpg',
    laceFront: '/wig3.jpg',
    colourTransform: '/wig4.jpg',
    fullRevamp: '/wig4.jpg',
  },
  instructor: '/hair.jpg',
} as const
