import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { fetchDashboard, markLessonComplete } from '../api/dashboard'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../context/AuthContext'
import { videos } from '../data/images'
import type { Course, DashboardData, Lesson } from '../types'
import { subscriptionIsActive } from '../utils/subscription'
import './Dashboard.css'

function findContinueLesson(courses: Course[], completed: string[]) {
  for (const course of courses) {
    const next = course.lessons?.find((lesson) => !completed.includes(lesson.id))
    if (next) return { course, lesson: next }
  }
  const firstCourse = courses[0]
  const firstLesson = firstCourse?.lessons?.[0]
  if (firstCourse && firstLesson) return { course: firstCourse, lesson: firstLesson }
  return null
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, token, updateUser, signOut } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeLesson, setActiveLesson] = useState<{ course: Course; lesson: Lesson } | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [expandedCourses, setExpandedCourses] = useState<string[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const playerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!token) return

    let cancelled = false
    setLoading(true)
    setError('')

    fetchDashboard(token)
      .then((dashboard) => {
        if (cancelled) return
        setData(dashboard)
        const done = dashboard.completedLessons ?? []
        setCompleted(done)
        updateUser(dashboard.user)

        const courseList = dashboard.courses ?? []
        const continueLesson = findContinueLesson(courseList, done)
        if (continueLesson) {
          setActiveLesson(continueLesson)
          setExpandedCourses([continueLesson.course.id])
        } else if (courseList[0]) {
          setExpandedCourses([courseList[0].id])
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

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [sidebarOpen])

  const courses = data?.courses ?? []
  const subscription = data?.subscription ?? user?.subscription ?? null
  const isActive = subscriptionIsActive(subscription)

  const totalLessons = courses.reduce((n, c) => n + (c.lessons?.length ?? 0), 0)
  const completedCount = completed.filter((id) =>
    courses.some((c) => c.lessons?.some((l) => l.id === id)),
  ).length
  const progressPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    )
  }

  const selectLesson = (course: Course, lesson: Lesson) => {
    setActiveLesson({ course, lesson })
    setExpandedCourses((prev) => (prev.includes(course.id) ? prev : [...prev, course.id]))
    setSidebarOpen(false)
    requestAnimationFrame(() => {
      playerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const markComplete = async (lessonId: string) => {
    if (!token || completed.includes(lessonId)) return
    setCompleted((prev) => [...prev, lessonId])
    try {
      await markLessonComplete(token, lessonId)
    } catch {
      setCompleted((prev) => prev.filter((id) => id !== lessonId))
    }
  }

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const continueLesson = findContinueLesson(courses, completed)
  const firstName = user?.name?.split(' ')[0] ?? 'Stylist'

  if (loading) {
    return (
      <div className="dashboard-page dashboard-loading">
        <div className="dashboard-spinner" aria-hidden="true" />
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
      {sidebarOpen && (
        <button
          type="button"
          className="dashboard-sidebar-backdrop"
          aria-label="Close menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
        <div className="dashboard-sidebar-top">
          <Link to="/" className="dashboard-sidebar-logo">
            <span className="dashboard-sidebar-logo-mark">E</span>
            <span>Eleganz</span>
          </Link>
          <button
            type="button"
            className="dashboard-sidebar-close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <nav className="dashboard-sidebar-nav" aria-label="Training navigation">
          <NavLink to="/dashboard" end className="dashboard-sidebar-link">
            My Training
          </NavLink>
          <NavLink to="/account" className="dashboard-sidebar-link">
            Account
          </NavLink>
          <Link to="/packages" className="dashboard-sidebar-link">
            Packages
          </Link>
          <Link to="/" className="dashboard-sidebar-link">
            Home
          </Link>
          <button type="button" className="dashboard-sidebar-link dashboard-sidebar-signout" onClick={handleSignOut}>
            Sign Out
          </button>
        </nav>

        {isActive && courses.length > 0 && (
          <div className="dashboard-sidebar-courses">
            <p className="dashboard-courses-eyebrow">These are our courses</p>
            <h2 className="dashboard-courses-heading">Explore</h2>

            <div className="dashboard-course-list">
              {courses.map((course) => {
                const isExpanded = expandedCourses.includes(course.id)
                const done = course.lessons?.filter((l) => completed.includes(l.id)).length ?? 0
                const total = course.lessons?.length ?? 0

                return (
                  <div
                    key={course.id}
                    className={`dashboard-course-collapse ${isExpanded ? 'dashboard-course-collapse--open' : ''}`}
                  >
                    <button
                      type="button"
                      className="dashboard-course-collapse-trigger"
                      aria-expanded={isExpanded}
                      onClick={() => toggleCourse(course.id)}
                    >
                      {course.thumbnail && (
                        <img src={course.thumbnail} alt="" className="dashboard-course-collapse-img" />
                      )}
                      <span className="dashboard-course-collapse-copy">
                        <span className="dashboard-course-collapse-title">{course.title}</span>
                        <span className="dashboard-course-collapse-meta">
                          {done}/{total} lessons · {course.duration}
                        </span>
                      </span>
                      <span className="dashboard-course-collapse-chevron" aria-hidden="true">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </button>

                    {isExpanded && (
                      <ul className="dashboard-lesson-list">
                        {course.lessons?.map((lesson, index) => {
                          const isDone = completed.includes(lesson.id)
                          const isCurrent = activeLesson?.lesson.id === lesson.id

                          return (
                            <li key={lesson.id}>
                              <button
                                type="button"
                                className={`dashboard-lesson-btn ${isCurrent ? 'dashboard-lesson-btn--active' : ''}`}
                                onClick={() => selectLesson(course, lesson)}
                              >
                                <span className={`dashboard-lesson-num ${isDone ? 'dashboard-lesson-num--done' : ''}`}>
                                  {isDone ? '✓' : index + 1}
                                </span>
                                <span className="dashboard-lesson-copy">
                                  <span className="dashboard-lesson-title">{lesson.title}</span>
                                  <span className="dashboard-lesson-duration">{lesson.duration}</span>
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </aside>

      <div className="dashboard-main">
        <header className="dashboard-main-header">
          <button
            type="button"
            className="dashboard-menu-toggle"
            onClick={() => setSidebarOpen(true)}
            aria-expanded={sidebarOpen}
            aria-label="Open menu"
          >
            <span />
            <span />
            <span />
          </button>
          <div className="dashboard-main-header-copy">
            <span className="dashboard-main-eyebrow">My Training</span>
            <h1>Welcome back, {firstName}</h1>
          </div>
        </header>

        <div className="dashboard-main-body">
          {!isActive ? (
            <div className="dashboard-panel card dashboard-empty">
              <h3>Subscription inactive</h3>
              <p>Renew your plan to unlock your wig training videos.</p>
              <Link to="/packages" className="btn btn-primary">View Packages</Link>
            </div>
          ) : courses.length === 0 ? (
            <div className="dashboard-panel card dashboard-empty">
              <h3>No courses available</h3>
              <p>Upgrade your package to access training content.</p>
              <Link to="/packages" className="btn btn-primary">Upgrade Plan</Link>
            </div>
          ) : (
            <>
              {totalLessons > 0 && (
                <div className="dashboard-progress">
                  <div className="dashboard-progress-bar" aria-hidden="true">
                    <span style={{ width: `${progressPct}%` }} />
                  </div>
                  <p className="dashboard-progress-text">
                    {progressPct}% complete · {completedCount} of {totalLessons} lessons
                  </p>
                </div>
              )}

              {continueLesson && (
                <button
                  type="button"
                  className="dashboard-continue-btn"
                  onClick={() => selectLesson(continueLesson.course, continueLesson.lesson)}
                >
                  {continueLesson.course.thumbnail && (
                    <img
                      src={continueLesson.course.thumbnail}
                      alt=""
                      className="dashboard-continue-thumb"
                    />
                  )}
                  <span className="dashboard-continue-copy">
                    <span className="dashboard-continue-label">Continue watching</span>
                    <span className="dashboard-continue-title">{continueLesson.lesson.title}</span>
                  </span>
                </button>
              )}

              <div className="dashboard-panel card dashboard-player-wrap" ref={playerRef}>
                {activeLesson ? (
                  <>
                    <div className="dashboard-player-screen">
                      <VideoPlayer
                        key={activeLesson.lesson.id}
                        src={activeLesson.lesson.videoUrl ?? videos.revamp}
                        title={activeLesson.lesson.title}
                        className="dashboard-video"
                      />
                    </div>
                    <div className="dashboard-player-info">
                      <p className="dashboard-player-course">{activeLesson.course.title}</p>
                      <h3>{activeLesson.lesson.title}</h3>
                      <button
                        type="button"
                        className="btn btn-primary dashboard-complete-btn"
                        onClick={() => markComplete(activeLesson.lesson.id)}
                        disabled={completed.includes(activeLesson.lesson.id)}
                      >
                        {completed.includes(activeLesson.lesson.id) ? 'Lesson completed' : 'Mark as complete'}
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="dashboard-player-placeholder">
                    <p>Open the sidebar, expand a course under Explore, and pick a lesson.</p>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => setSidebarOpen(true)}
                    >
                      Browse courses
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
