import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard, markLessonComplete } from '../api/dashboard'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../context/AuthContext'
import { videos } from '../data/images'
import type { Course, DashboardData, Lesson, Subscription } from '../types'
import './Dashboard.css'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function subscriptionIsActive(sub: Subscription | null) {
  if (!sub || sub.status !== 'active') return false
  return new Date(sub.expiresAt) >= new Date()
}

export default function Dashboard() {
  const { user, token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeLesson, setActiveLesson] = useState<{ course: Course; lesson: Lesson } | null>(null)
  const [completed, setCompleted] = useState<string[]>([])

  useEffect(() => {
    if (!token) return

    let cancelled = false
    setLoading(true)
    setError('')

    fetchDashboard(token)
      .then((dashboard) => {
        if (cancelled) return
        setData(dashboard)
        setCompleted(dashboard.completedLessons ?? [])
        updateUser(dashboard.user)
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [token, updateUser])

  const markComplete = async (lessonId: string) => {
    if (!token || completed.includes(lessonId)) return
    setCompleted((prev) => [...prev, lessonId])
    try {
      await markLessonComplete(token, lessonId)
    } catch {
      setCompleted((prev) => prev.filter((id) => id !== lessonId))
    }
  }

  const subscription = data?.subscription ?? user?.subscription ?? null
  const courses = data?.courses ?? []
  const isActive = subscriptionIsActive(subscription)
  const totalLessons = courses.reduce((n, c) => n + (c.lessons?.length ?? 0), 0)
  const completedCount = completed.filter((id) =>
    courses.some((c) => c.lessons?.some((l) => l.id === id)),
  ).length
  const progressPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0

  if (loading) {
    return (
      <div className="dashboard-loading">
        <p>Loading your dashboard…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-loading">
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary">Sign in again</Link>
      </div>
    )
  }

  return (
    <>
      <div className="dashboard-hero">
        <div className="container dashboard-hero-inner">
          <div>
            <span className="dashboard-eyebrow">My Dashboard</span>
            <h1>Welcome back, {user?.name ?? 'Stylist'}</h1>
            <p>Your subscription, progress, and training library in one place.</p>
          </div>
          {isActive && totalLessons > 0 && (
            <div className="dashboard-progress-ring">
              <strong>{progressPct}%</strong>
              <span>{completedCount} of {totalLessons} lessons</span>
            </div>
          )}
        </div>
      </div>

      <section className="section dashboard-section">
        <div className="container dashboard-layout">
          <aside className="dashboard-sidebar">
            <div className="dashboard-card card subscription-card">
              <h2>Your Subscription</h2>
              {subscription ? (
                <>
                  <div className={`subscription-status subscription-status--${subscription.status}`}>
                    <span className="subscription-plan">{subscription.packageName}</span>
                    <span className={`badge badge-${isActive ? 'active' : 'expired'}`}>
                      {isActive ? 'Active' : 'Expired'}
                    </span>
                  </div>
                  <dl className="subscription-details">
                    <div>
                      <dt>Monthly price</dt>
                      <dd>${subscription.price}/month</dd>
                    </div>
                    <div>
                      <dt>{isActive ? 'Renews on' : 'Expired on'}</dt>
                      <dd>{formatDate(subscription.expiresAt)}</dd>
                    </div>
                    <div>
                      <dt>Courses unlocked</dt>
                      <dd>{courses.length} course{courses.length !== 1 ? 's' : ''}</dd>
                    </div>
                  </dl>
                  <Link to="/packages" className="btn btn-secondary subscription-action">
                    {isActive ? 'Manage Plan' : 'Renew Subscription'}
                  </Link>
                </>
              ) : (
                <>
                  <p className="subscription-empty">You don&apos;t have an active subscription yet.</p>
                  <Link to="/packages" className="btn btn-primary subscription-action">Choose a Plan</Link>
                </>
              )}
            </div>

            <div className="dashboard-card card dashboard-help">
              <h3>Need help?</h3>
              <p>Contact us on WhatsApp or email for billing and access support.</p>
            </div>
          </aside>

          <div className="dashboard-main">
            <div className="dashboard-main-header">
              <h2>Your Training Library</h2>
              {!isActive && (
                <p className="dashboard-lock-notice">
                  Renew your subscription to unlock video lessons.
                </p>
              )}
            </div>

            {!isActive ? (
              <div className="dashboard-empty card">
                <h3>Subscription inactive</h3>
                <p>Pick a package to access your wig revamp and customization videos.</p>
                <Link to="/packages" className="btn btn-primary">View Packages</Link>
              </div>
            ) : courses.length === 0 ? (
              <div className="dashboard-empty card">
                <h3>No courses available</h3>
                <p>Your plan may not include any courses yet. Try upgrading your package.</p>
                <Link to="/packages" className="btn btn-primary">Upgrade Plan</Link>
              </div>
            ) : (
              <div className="dashboard-courses">
                {courses.map((course) => (
                  <article key={course.id} className="dashboard-course card">
                    <div className="dashboard-course-head">
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt="" className="dashboard-course-thumb" />
                      )}
                      <div>
                        <h3>{course.title}</h3>
                        <p>{course.description}</p>
                        <div className="dashboard-course-meta">
                          <span>{course.lessonCount} lessons</span>
                          <span>{course.duration}</span>
                        </div>
                      </div>
                    </div>

                    <ul className="lesson-list">
                      {course.lessons?.map((lesson) => {
                        const isDone = completed.includes(lesson.id)
                        const isPlaying = activeLesson?.lesson.id === lesson.id

                        return (
                          <li key={lesson.id} className={`lesson-item ${isPlaying ? 'lesson-item--active' : ''}`}>
                            <button
                              type="button"
                              className="lesson-row"
                              onClick={() => setActiveLesson({ course, lesson })}
                            >
                              <span className={`lesson-play ${isDone ? 'lesson-play--done' : ''}`}>
                                {isDone ? '✓' : '▶'}
                              </span>
                              <span className="lesson-info">
                                <span className="lesson-title">{lesson.title}</span>
                                <span className="lesson-duration">{lesson.duration}</span>
                              </span>
                            </button>

                            {isPlaying && (
                              <div className="lesson-player">
                                <div className="lesson-player-screen">
                                  <VideoPlayer
                                    src={lesson.videoUrl ?? videos.revamp}
                                    title={lesson.title}
                                    className="lesson-video"
                                  />
                                </div>
                                <div className="lesson-player-actions">
                                  <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => markComplete(lesson.id)}
                                  >
                                    Mark as Complete
                                  </button>
                                </div>
                              </div>
                            )}
                          </li>
                        )
                      })}
                    </ul>
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  )
}
