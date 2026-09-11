import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchDashboard, markLessonComplete } from '../api/dashboard'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../context/AuthContext'
import { videos } from '../data/images'
import type { Course, DashboardData, Lesson } from '../types'
import { subscriptionIsActive } from '../utils/subscription'
import './Dashboard.css'

export default function Dashboard() {
  const { user, token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeLesson, setActiveLesson] = useState<{ course: Course; lesson: Lesson } | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [expandedCourses, setExpandedCourses] = useState<string[]>([])

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
        const firstCourseId = dashboard.courses?.[0]?.id
        if (firstCourseId) {
          setExpandedCourses([firstCourseId])
        }
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

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    )
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
      <div className="dashboard-page dashboard-loading">
        <p>Loading your training…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-page dashboard-loading">
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary">Sign in again</Link>
      </div>
    )
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-hero">
        <div className="container dashboard-hero-inner">
          <div className="dashboard-hero-copy">
            <span className="dashboard-eyebrow">My Training</span>
            <h1>Welcome back, {user?.name?.split(' ')[0] ?? 'Stylist'}</h1>
            {isActive && totalLessons > 0 ? (
              <div className="dashboard-progress">
                <div className="dashboard-progress-bar" aria-hidden="true">
                  <span style={{ width: `${progressPct}%` }} />
                </div>
                <p className="dashboard-progress-text">
                  {progressPct}% complete · {completedCount} of {totalLessons} lessons
                </p>
              </div>
            ) : (
              <p className="dashboard-hero-lead">Pick up where you left off with your video lessons.</p>
            )}
          </div>
          <Link to="/account" className="dashboard-account-link">
            Account &amp; Plan
          </Link>
        </div>
      </div>

      <section className="section dashboard-section">
        <div className="container dashboard-content">
          {!isActive ? (
            <div className="dashboard-empty card">
              <h3>Subscription inactive</h3>
              <p>Renew your plan to unlock wig revamp and customization videos.</p>
              <div className="dashboard-empty-actions">
                <Link to="/packages" className="btn btn-primary">View Packages</Link>
                <Link to="/account" className="btn btn-secondary">Account &amp; Plan</Link>
              </div>
            </div>
          ) : courses.length === 0 ? (
            <div className="dashboard-empty card">
              <h3>No courses available</h3>
              <p>Your plan may not include any courses yet. Try upgrading your package.</p>
              <Link to="/packages" className="btn btn-primary">Upgrade Plan</Link>
            </div>
          ) : (
            <div className="dashboard-courses">
              {courses.map((course) => {
                const isExpanded = expandedCourses.includes(course.id)
                const courseCompleted = course.lessons?.filter((l) => completed.includes(l.id)).length ?? 0
                const courseTotal = course.lessons?.length ?? 0

                return (
                  <article key={course.id} className={`dashboard-course card ${isExpanded ? 'dashboard-course--open' : ''}`}>
                    <button
                      type="button"
                      className="dashboard-course-toggle"
                      aria-expanded={isExpanded}
                      onClick={() => toggleCourse(course.id)}
                    >
                      <div className="dashboard-course-summary">
                        {course.thumbnail && (
                          <img src={course.thumbnail} alt="" className="dashboard-course-thumb" />
                        )}
                        <div className="dashboard-course-intro">
                          <h3>{course.title}</h3>
                          <p>{course.description}</p>
                          <div className="dashboard-course-meta">
                            <span>{courseCompleted}/{courseTotal} done</span>
                            <span>{course.duration}</span>
                          </div>
                        </div>
                      </div>
                      <span className="dashboard-course-chevron" aria-hidden="true">{isExpanded ? '−' : '+'}</span>
                    </button>

                    {isExpanded && (
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
                                      disabled={isDone}
                                    >
                                      {isDone ? 'Completed' : 'Mark as Complete'}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </article>
                )
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
