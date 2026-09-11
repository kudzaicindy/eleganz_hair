import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
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
  const { user, token, updateUser } = useAuth()
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

  const continueLesson = findContinueLesson(courses, completed)

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

  const sidebar = (
    <aside className={`dashboard-sidebar ${sidebarOpen ? 'dashboard-sidebar--open' : ''}`}>
      <div className="dashboard-sidebar-head">
        <h2>Course Library</h2>
        <button
          type="button"
          className="dashboard-sidebar-close"
          onClick={() => setSidebarOpen(false)}
          aria-label="Close course list"
        >
          ×
        </button>
      </div>

      <div className="dashboard-sidebar-courses">
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
    </aside>
  )

  return (
    <div className="dashboard-page">
      <section className="dashboard-hero">
        <div className="container dashboard-hero-inner">
          <span className="dashboard-eyebrow">My Training</span>
          <h1>Welcome back, {user?.name?.split(' ')[0] ?? 'Stylist'}</h1>
          {isActive && totalLessons > 0 && (
            <div className="dashboard-progress">
              <div className="dashboard-progress-bar" aria-hidden="true">
                <span style={{ width: `${progressPct}%` }} />
              </div>
              <p className="dashboard-progress-text">
                {progressPct}% complete · {completedCount} of {totalLessons} lessons
              </p>
            </div>
          )}
        </div>
      </section>

      <div className="container dashboard-body">
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

            <div className="dashboard-layout">
              <div className="dashboard-main">
                <div className="dashboard-main-toolbar">
                  <button
                    type="button"
                    className="dashboard-sidebar-toggle"
                    onClick={() => setSidebarOpen(true)}
                    aria-expanded={sidebarOpen}
                  >
                    Browse courses
                  </button>
                  {activeLesson && (
                    <span className="dashboard-now-playing">{activeLesson.course.title}</span>
                  )}
                </div>

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
                      <p>Open the course sidebar and pick a lesson to start watching.</p>
                      <button
                        type="button"
                        className="btn btn-secondary dashboard-sidebar-toggle-inline"
                        onClick={() => setSidebarOpen(true)}
                      >
                        Browse courses
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {sidebar}
            </div>

            {sidebarOpen && (
              <button
                type="button"
                className="dashboard-sidebar-backdrop"
                aria-label="Close course list"
                onClick={() => setSidebarOpen(false)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}
