import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { fetchDashboard, markLessonComplete } from '../api/dashboard'
import MemberLayout from '../components/MemberLayout'
import VideoPlayer from '../components/VideoPlayer'
import { useAuth } from '../context/AuthContext'
import { videos } from '../data/images'
import type { Course, DashboardData, Lesson } from '../types'
import { subscriptionIsActive } from '../utils/subscription'
import './Dashboard.css'

type TrainingNavState = {
  courseId?: string
  lessonId?: string
}

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

function findLesson(courses: Course[], courseId: string, lessonId: string) {
  const course = courses.find((c) => c.id === courseId)
  const lesson = course?.lessons?.find((l) => l.id === lessonId)
  return course && lesson ? { course, lesson } : null
}

export default function Dashboard() {
  const location = useLocation()
  const { user, token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
        const navState = location.state as TrainingNavState | null
        const fromCourses = navState?.courseId && navState?.lessonId
          ? findLesson(courseList, navState.courseId, navState.lessonId)
          : null

        if (fromCourses) {
          setActiveLesson(fromCourses)
        } else {
          const continueLesson = findContinueLesson(courseList, done)
          if (continueLesson) setActiveLesson(continueLesson)
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
  }, [token, updateUser, location.state])

  const courses = data?.courses ?? []
  const subscription = data?.subscription ?? user?.subscription ?? null
  const isActive = subscriptionIsActive(subscription)

  const totalLessons = courses.reduce((n, c) => n + (c.lessons?.length ?? 0), 0)
  const completedCount = completed.filter((id) =>
    courses.some((c) => c.lessons?.some((l) => l.id === id)),
  ).length
  const progressPct = totalLessons ? Math.round((completedCount / totalLessons) * 100) : 0

  const selectLesson = (course: Course, lesson: Lesson) => {
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
  const firstName = user?.name?.split(' ')[0] ?? 'Stylist'
  const activeCourse = activeLesson?.course

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
    <MemberLayout eyebrow="My Training" title={`Welcome back, ${firstName}`}>
      {!isActive ? (
        <div className="dashboard-panel card dashboard-empty">
          <h3>Subscription inactive</h3>
          <p>Renew your plan to unlock your wig training videos.</p>
          <Link to="/packages" className="btn btn-primary">View Packages</Link>
        </div>
      ) : courses.length === 0 ? (
        <div className="dashboard-panel card dashboard-empty">
          <h3>No training unlocked yet</h3>
          <p>Upgrade your package to start watching lessons.</p>
          <Link to="/packages" className="btn btn-primary">Upgrade Plan</Link>
        </div>
      ) : (
        <>
          <div className="dashboard-stats">
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">{totalLessons}</span>
              <span className="dashboard-stat-label">Lessons</span>
            </div>
            <div className="dashboard-stat">
              <span className="dashboard-stat-value">{completedCount}</span>
              <span className="dashboard-stat-label">Completed</span>
            </div>
            <div className="dashboard-stat dashboard-stat--highlight">
              <span className="dashboard-stat-value">{progressPct}%</span>
              <span className="dashboard-stat-label">Progress</span>
            </div>
          </div>

          {totalLessons > 0 && (
            <div className="dashboard-progress-card">
              <div className="dashboard-progress-card-top">
                <span>Your training journey</span>
                <strong>{completedCount}/{totalLessons} lessons</strong>
              </div>
              <div className="dashboard-progress-bar" aria-hidden="true">
                <span style={{ width: `${progressPct}%` }} />
              </div>
            </div>
          )}

          {continueLesson && (
            <button
              type="button"
              className="dashboard-continue-btn"
              onClick={() => selectLesson(continueLesson.course, continueLesson.lesson)}
            >
              {continueLesson.course.thumbnail && (
                <span className="dashboard-continue-media">
                  <img
                    src={continueLesson.course.thumbnail}
                    alt=""
                    className="dashboard-continue-thumb"
                  />
                  <span className="dashboard-continue-play" aria-hidden="true">▶</span>
                </span>
              )}
              <span className="dashboard-continue-copy">
                <span className="dashboard-continue-label">Continue training</span>
                <span className="dashboard-continue-title">{continueLesson.lesson.title}</span>
                <span className="dashboard-continue-course">{continueLesson.course.title}</span>
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
                <p>Choose a lesson from your courses to start training.</p>
                <Link to="/courses" className="btn btn-secondary">Browse courses</Link>
              </div>
            )}
          </div>

          {activeCourse && activeCourse.lessons && activeCourse.lessons.length > 0 && (
            <section className="dashboard-lessons-section" aria-labelledby="dashboard-lessons-heading">
              <div className="dashboard-lessons-intro">
                <h2 id="dashboard-lessons-heading">Lessons in this course</h2>
                <Link to="/courses" className="dashboard-lessons-link">All courses →</Link>
              </div>
              <ul className="dashboard-lessons-track">
                {activeCourse.lessons.map((lesson, index) => {
                  const isDone = completed.includes(lesson.id)
                  const isCurrent = activeLesson?.lesson.id === lesson.id

                  return (
                    <li key={lesson.id}>
                      <button
                        type="button"
                        className={`dashboard-lesson-btn ${isCurrent ? 'dashboard-lesson-btn--active' : ''}`}
                        onClick={() => selectLesson(activeCourse, lesson)}
                      >
                        <span className={`dashboard-lesson-num ${isDone ? 'dashboard-lesson-num--done' : ''}`}>
                          {isDone ? '✓' : index + 1}
                        </span>
                        <span className="dashboard-lesson-copy">
                          <span className="dashboard-lesson-title">{lesson.title}</span>
                          <span className="dashboard-lesson-duration">{lesson.duration}</span>
                        </span>
                        {!isDone && (
                          <span className="dashboard-lesson-play" aria-hidden="true">▶</span>
                        )}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>
          )}
        </>
      )}
    </MemberLayout>
  )
}
