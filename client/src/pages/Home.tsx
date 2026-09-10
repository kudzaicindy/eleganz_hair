import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import VideoPlayer from '../components/VideoPlayer'
import { images, videos } from '../data/images'
import './Home.css'

const stats = [
  { value: '+380', label: 'Happy Students' },
  { value: '+50', label: 'Video Lessons' },
  { value: '99%', label: 'Satisfaction Rate' },
]

const whyChoose = [
  {
    num: '01',
    title: 'Proven Expertise',
    stat: '10+ years',
    description:
      'Lessons built from real salon work — not generic tutorials. Learn methods tested on hundreds of wigs and clients.',
  },
  {
    num: '02',
    title: 'Salon-Ready Techniques',
    stat: '50+ lessons',
    description:
      'Revamp, lace work, colouring and finishing — each skill taught clearly so you can repeat results on your next client.',
  },
  {
    num: '03',
    title: 'Earn More From Your Craft',
    stat: 'Premium pricing',
    description:
      'Add high-value revamp services to your menu, package them confidently, and grow income without leaving your salon.',
  },
]

const whyPerks = [
  'EcoCash, bank & card accepted',
  'Learn on phone, tablet or laptop',
  'Fresh content added monthly',
]

const courses = [
  {
    title: 'Wig Revamp Basics',
    tag: 'Beginner',
    rating: '4.9',
    price: '$25/mo',
    image: images.courses.revamp,
  },
  {
    title: 'Frontal Customization',
    tag: 'Intermediate',
    rating: '4.8',
    price: '$45/mo',
    image: images.courses.frontal,
  },
  {
    title: 'Advanced Colouring',
    tag: 'Advanced',
    rating: '5.0',
    price: '$45/mo',
    image: images.courses.colour,
  },
  {
    title: 'Client Consultation',
    tag: 'Business',
    rating: '4.7',
    price: '$45/mo',
    image: images.courses.consultation,
  },
]

const gallery = [
  { title: 'Silk Press Revamp', image: images.gallery.silkPress },
  { title: 'Custom Lace Front', image: images.gallery.laceFront },
  { title: 'Colour Transformation', image: images.gallery.colourTransform },
  { title: 'Full Wig Revamp', image: images.gallery.fullRevamp },
]

const testimonials = [
  {
    text: 'The wig revamp course changed my business completely. I went from struggling to fully booked in two months.',
    name: 'Tendai M.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&q=80',
  },
  {
    text: 'Clear, step-by-step videos that I could watch on my phone between clients. Worth every dollar.',
    name: 'Rudo K.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80',
  },
  {
    text: 'Finally a platform that understands African hair and wig customization. Highly recommend Premium.',
    name: 'Chipo N.',
    rating: 5,
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&q=80',
  },
]

type PlanOption = { value: string; label: string }
type CourseOption = { value: string; label: string }

type TrainingPlan = {
  id: string
  label: string
  blurb: string
  priceHint: string
  packages: PlanOption[]
  courses: CourseOption[]
  levels: PlanOption[]
  defaultPackage: string
  defaultCourse: string
  defaultLevel: string
  cta: string
}

const trainingPlans: TrainingPlan[] = [
  {
    id: 'revamp',
    label: 'Wig Revamp',
    blurb: 'Learn washing, detangling, reshaping and restoring tired wigs to salon-fresh condition.',
    priceHint: 'From $25/month',
    packages: [
      { value: 'basic', label: 'Basic — $25/month' },
      { value: 'premium', label: 'Premium — $45/month' },
    ],
    courses: [
      { value: 'revamp-basics', label: 'Wig Revamp Basics' },
      { value: 'deep-restore', label: 'Deep Restore Masterclass' },
      { value: 'silk-press', label: 'Silk Press on Wigs' },
    ],
    levels: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
    ],
    defaultPackage: 'basic',
    defaultCourse: 'revamp-basics',
    defaultLevel: 'beginner',
    cta: 'Start Revamp Training',
  },
  {
    id: 'custom',
    label: 'Customization',
    blurb: 'Master lace fronts, plucking, tinting and cutting for a flawless, natural hairline.',
    priceHint: 'From $45/month',
    packages: [
      { value: 'premium', label: 'Premium — $45/month' },
      { value: 'pro', label: 'Pro Stylist — $65/month' },
    ],
    courses: [
      { value: 'frontal', label: 'Frontal Customization' },
      { value: 'lace-tint', label: 'Lace Tint & Blend' },
      { value: 'custom-cut', label: 'Custom Cut & Layering' },
    ],
    levels: [
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
    defaultPackage: 'premium',
    defaultCourse: 'frontal',
    defaultLevel: 'intermediate',
    cta: 'Start Customization',
  },
  {
    id: 'full',
    label: 'Full Access',
    blurb: 'Every course, every update — revamp, customization, colouring and business skills in one plan.',
    priceHint: 'Best value — $65/month',
    packages: [
      { value: 'full', label: 'Full Access — $65/month' },
      { value: 'premium', label: 'Premium — $45/month' },
    ],
    courses: [
      { value: 'all', label: 'Complete Library' },
      { value: 'revamp-track', label: 'Revamp Track' },
      { value: 'custom-track', label: 'Customization Track' },
    ],
    levels: [
      { value: 'beginner', label: 'Beginner' },
      { value: 'intermediate', label: 'Intermediate' },
      { value: 'advanced', label: 'Advanced' },
    ],
    defaultPackage: 'full',
    defaultCourse: 'all',
    defaultLevel: 'beginner',
    cta: 'Get Full Access',
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState(0)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const [formPackage, setFormPackage] = useState(trainingPlans[0].defaultPackage)
  const [formCourse, setFormCourse] = useState(trainingPlans[0].defaultCourse)
  const [formLevel, setFormLevel] = useState(trainingPlans[0].defaultLevel)

  const plan = trainingPlans[activeTab]

  useEffect(() => {
    const current = trainingPlans[activeTab]
    setFormPackage(current.defaultPackage)
    setFormCourse(current.defaultCourse)
    setFormLevel(current.defaultLevel)
  }, [activeTab])

  const nextTestimonial = () => {
    setActiveTestimonial((i) => (i + 1) % testimonials.length)
  }

  return (
    <div className="home">
      <section className="hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url('${images.hero}')` }}
          aria-hidden="true"
        />
        <div className="hero-overlay" aria-hidden="true" />

        <div className="container hero-inner">
          <div className="hero-body">
            <div className="hero-content">
              <span className="hero-eyebrow">Zimbabwe&apos;s Premier Wig Training Platform</span>
              <h1>
                Turn Your Passion Into
                <br />
                a Profitable Craft
              </h1>
              <p className="hero-lead">
                Premium video training for stylists — subscribe, learn in minutes,
                and deliver results clients love. EcoCash, bank &amp; card accepted.
              </p>
            </div>

            <div className="hero-stats">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`hero-stat ${i > 0 ? 'hero-stat--bordered' : ''}`}
                >
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-widget">
            <div className="widget-header">
              <h3>Start Your Training Today</h3>
              <div className="widget-tabs" role="tablist" aria-label="Training type">
                {trainingPlans.map((tab, i) => (
                  <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === i}
                    className={`widget-tab ${activeTab === i ? 'active' : ''}`}
                    onClick={() => setActiveTab(i)}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div
              className="widget-plan-banner"
              role="tabpanel"
              key={plan.id}
            >
              <p className="widget-plan-blurb">{plan.blurb}</p>
              <span className="widget-plan-price">{plan.priceHint}</span>
            </div>

            <form className="widget-body" onSubmit={(e) => e.preventDefault()}>
              <div className="widget-row">
                <div className="widget-field">
                  <label htmlFor="hero-name">Full Name</label>
                  <input id="hero-name" type="text" placeholder="Your name" />
                </div>
                <div className="widget-field">
                  <label htmlFor="hero-email">Email</label>
                  <input id="hero-email" type="email" placeholder="you@example.com" />
                </div>
                <div className="widget-field">
                  <label htmlFor="hero-phone">Phone</label>
                  <input id="hero-phone" type="tel" placeholder="+263 77..." />
                </div>
              </div>
              <div className="widget-row">
                <div className="widget-field">
                  <label htmlFor="hero-plan">Package</label>
                  <select
                    id="hero-plan"
                    value={formPackage}
                    onChange={(e) => setFormPackage(e.target.value)}
                  >
                    {plan.packages.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="widget-field">
                  <label htmlFor="hero-level">Experience</label>
                  <select
                    id="hero-level"
                    value={formLevel}
                    onChange={(e) => setFormLevel(e.target.value)}
                  >
                    {plan.levels.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="widget-field">
                  <label htmlFor="hero-course">Course Interest</label>
                  <select
                    id="hero-course"
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                  >
                    {plan.courses.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="widget-actions">
                <Link to="/register" className="btn btn-primary widget-submit">
                  {plan.cta}
                </Link>
              </div>
            </form>
          </div>
        </div>
      </section>

      <section className="home-section why-section">
        <div className="container why-layout">
          <div className="why-intro">
            <span className="text-eyebrow">Why Eleganz</span>
            <h2 className="why-title">The Training Platform Stylists Trust</h2>
            <p className="why-lead">
              Master wig revamp and customization on your schedule — professional
              video training designed for working stylists in Zimbabwe and beyond.
            </p>
            <ul className="why-perks">
              {whyPerks.map((perk) => (
                <li key={perk}>
                  <span className="why-perk-check" aria-hidden="true">✓</span>
                  {perk}
                </li>
              ))}
            </ul>
            <Link to="/packages" className="btn btn-secondary why-cta">
              See Plans &amp; Pricing
            </Link>
          </div>

          <div className="why-grid">
            {whyChoose.map((item) => (
              <article key={item.num} className="why-card card">
                <span className="why-card-num" aria-hidden="true">{item.num}</span>
                <div className="why-card-top">
                  <span className="why-card-stat">{item.stat}</span>
                </div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section preview-section">
        <div className="container preview-layout">
          <div className="preview-copy">
            <span className="text-eyebrow">Free Preview</span>
            <h2 className="section-title">See the Training in Action</h2>
            <p>
              Watch a sample from our wig revamp course — the same clear,
              step-by-step style you get with every subscription lesson.
            </p>
            <Link to="/register" className="btn btn-primary">Start Learning Today</Link>
          </div>
          <VideoPlayer
            src={videos.revamp}
            poster={images.courses.revamp}
            title="Wig revamp training preview"
            className="preview-video"
          />
        </div>
      </section>

      <section className="home-section courses-section">
        <div className="container">
          <div className="section-intro section-intro--compact">
            <span className="text-eyebrow">Our Courses</span>
            <h2 className="section-title">Training That Pays for Itself</h2>
          </div>
          <div className="courses-grid">
            {courses.map((course) => (
              <article key={course.title} className="course-module card">
                <div className="course-module-img">
                  <img src={course.image} alt={course.title} loading="lazy" />
                  <span className="course-tag">{course.tag}</span>
                </div>
                <div className="course-module-body">
                  <h3>{course.title}</h3>
                  <div className="course-meta">
                    <span className="course-rating">★ {course.rating}</span>
                    <span className="course-price">{course.price}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="section-cta">
            <Link to="/packages" className="btn btn-primary">View All Packages</Link>
          </div>
        </div>
      </section>

      <section className="home-section gallery-section">
        <div className="container">
          <div className="section-intro section-intro--compact">
            <span className="text-eyebrow">Real Results</span>
            <h2 className="section-title">See What Our Students Create</h2>
          </div>
          <div className="gallery-grid">
            {gallery.map((item) => (
              <article key={item.title} className="gallery-item">
                <img src={item.image} alt={item.title} loading="lazy" />
                <div className="gallery-overlay">
                  <h3>{item.title}</h3>
                  <Link to="/courses" className="btn btn-secondary gallery-btn">
                    View Course
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section testimonials-section">
        <div className="container">
          <div className="testimonials-head">
            <div>
              <span className="text-eyebrow testimonials-eyebrow">Student Stories</span>
              <h2>Trusted by Stylists Across Zimbabwe</h2>
            </div>
            <button
              type="button"
              className="testimonial-next"
              onClick={nextTestimonial}
              aria-label="Next testimonial"
            >
              →
            </button>
          </div>
          <div className="testimonials-track">
            {testimonials.map((item, i) => (
              <article
                key={item.name}
                className={`testimonial-card ${i === activeTestimonial ? 'active' : ''}`}
              >
                <p className="testimonial-text">&ldquo;{item.text}&rdquo;</p>
                <div className="testimonial-stars">
                  {'★'.repeat(item.rating)}
                </div>
                <div className="testimonial-author">
                  <img src={item.avatar} alt={item.name} />
                  <span>{item.name}</span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="home-section specialist-section">
        <div className="container specialist-inner">
          <div className="specialist-image">
            <img src={images.instructor} alt="Eleganz instructor" loading="lazy" />
          </div>
          <div className="specialist-content">
            <span className="specialist-eyebrow">Meet Your Instructor</span>
            <h2>Learn From a Stylist Who&apos;s Been in Your Chair</h2>
            <p>
              Over 10 years of wig revamp expertise — practical lessons you can
              apply on your very next client.
            </p>
            <div className="specialist-actions">
              <Link to="/courses" className="btn btn-primary">Browse Course Library</Link>
              <Link to="/packages" className="btn btn-secondary">See Plans &amp; Pricing</Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
