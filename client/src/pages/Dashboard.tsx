import { useEffect, useMemo, useRef, useState } from 'react'
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
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null)
  const [activeLesson, setActiveLesson] = useState<{ course: Course; lesson: Lesson } | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
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
          setActiveCourseId(continueLesson.course.id)
          setActiveLesson(continueLesson)
        } else if (courseList[0]) {
          setActiveCourseId(courseList[0].id)
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

  const courses = data?.courses ?? []
  const subscription = data?.subscription ?? user?.subscription ?? null
  const isActive = subscriptionIsActive(subscription)

  const activeCourse = useMemo(
    () => courses.find((c) => c.id === activeCourseId) ?? courses[0] ?? null,
    [courses, activeCourseId],
  )

  const totalLessons = courses.reduce((n, c) => n + (c.lessons?.length ?? 0), 0)
  const completedCount = completed.filter((id) =>
    courses.some((c) => c.lessons?.some((l) => l.id === id)),
  ).length
  const progressPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0

  const selectLesson = (course: Course, lesson: Lesson) => {
    setActiveCourseId(course.id)
    setActiveLesson({ course, lesson })
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
                <span className="dashboard-continue-label">Continue watching</span>
                <span className="dashboard-continue-title">{continueLesson.lesson.title}</span>
              </button>
            )}

            <div className="dashboard-panel card">
              <div className="dashboard-panel-header">
                <h2>Your Courses</h2>
                <div className="dashboard-course-tabs" role="tablist" aria-label="Courses">
                  {courses.map((course) => {
                    const done = course.lessons?.filter((l) => completed.includes(l.id)).length ?? 0
                    const total = course.lessons?.length ?? 0
                    const isSelected = activeCourse?.id === course.id

                    return (
                      <button
                        key={course.id}
                        type="button"
                        role="tab"
                        aria-selected={isSelected}
                        className={`dashboard-course-tab ${isSelected ? 'active' : ''}`}
                        onClick={() => {
                          setActiveCourseId(course.id)
                          const first = course.lessons?.[0]
                          if (first) setActiveLesson({ course, lesson: first })
                        }}
                      >
                        {course.title}
                        <span className="dashboard-course-tab-count">{done}/{total}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="dashboard-split">
                <div className="dashboard-player-panel" ref={playerRef}>
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
                      <p>Select a lesson below to start watching</p>
                    </div>
                  )}
                </div>

                <aside className="dashboard-lessons">
                  <h3 className="dashboard-lessons-heading">Lessons</h3>
                  <ul className="dashboard-lesson-list">
                    {activeCourse?.lessons?.map((lesson, index) => {
                      const isDone = completed.includes(lesson.id)
                      const isCurrent = activeLesson?.lesson.id === lesson.id

                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            className={`dashboard-lesson-btn ${isCurrent ? 'dashboard-lesson-btn--active' : ''}`}
                            onClick={() => activeCourse && selectLesson(activeCourse, lesson)}
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
                </aside>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
