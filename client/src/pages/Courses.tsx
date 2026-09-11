import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { fetchDashboard } from '../api/dashboard'
import MemberLayout from '../components/MemberLayout'
import { useAuth } from '../context/AuthContext'
import type { Course, DashboardData } from '../types'
import { subscriptionIsActive } from '../utils/subscription'
import './Courses.css'

function courseProgress(course: Course, completed: string[]) {
  const total = course.lessons?.length ?? 0
  const done = course.lessons?.filter((l) => completed.includes(l.id)).length ?? 0
  const pct = total ? Math.round((done / total) * 100) : 0
  return { done, total, pct }
}

export default function Courses() {
  const navigate = useNavigate()
  const { user, token, updateUser } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
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
        if (dashboard.courses?.[0]) {
          setExpandedCourses([dashboard.courses[0].id])
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

  const toggleCourse = (courseId: string) => {
    setExpandedCourses((prev) =>
      prev.includes(courseId) ? prev.filter((id) => id !== courseId) : [...prev, courseId],
    )
  }

  const startLesson = (course: Course, lessonId: string) => {
    navigate('/dashboard', { state: { courseId: course.id, lessonId } })
  }

  if (loading) {
    return (
      <div className="courses-page courses-loading">
        <div className="courses-spinner" aria-hidden="true" />
        <p>Loading courses…</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="courses-page courses-loading">
        <p>{error}</p>
        <Link to="/login" className="btn btn-primary">Sign in again</Link>
      </div>
    )
  }

  return (
    <MemberLayout eyebrow="Course Library" title="These are our courses">
      <div className="courses-intro">
        <h2 className="courses-explore">Explore</h2>
        <p className="courses-sub">
          Browse every course in your plan. Expand a course and pick a lesson — training opens in My Training.
        </p>
      </div>

      {!isActive ? (
        <div className="courses-empty card">
          <h3>Subscription inactive</h3>
          <p>Renew your plan to browse and watch course lessons.</p>
          <Link to="/packages" className="btn btn-primary">View Packages</Link>
        </div>
      ) : courses.length === 0 ? (
        <div className="courses-empty card">
          <h3>No courses in your plan</h3>
          <p>Upgrade to unlock the full course library.</p>
          <Link to="/packages" className="btn btn-primary">Upgrade Plan</Link>
        </div>
      ) : (
        <div className="courses-list">
          {courses.map((course) => {
            const isExpanded = expandedCourses.includes(course.id)
            const { done, total, pct } = courseProgress(course, completed)

            return (
              <article
                key={course.id}
                className={`courses-card ${isExpanded ? 'courses-card--open' : ''}`}
              >
                <button
                  type="button"
                  className="courses-card-trigger"
                  aria-expanded={isExpanded}
                  onClick={() => toggleCourse(course.id)}
                >
                  {course.thumbnail && (
                    <span className="courses-card-banner">
                      <img src={course.thumbnail} alt="" />
                      <span className="courses-card-banner-overlay" aria-hidden="true" />
                    </span>
                  )}
                  <span className="courses-card-body">
                    <span className="courses-card-top">
                      <span className="courses-card-title">{course.title}</span>
                      <span className="courses-card-chevron" aria-hidden="true">
                        {isExpanded ? '−' : '+'}
                      </span>
                    </span>
                    {course.description && (
                      <span className="courses-card-desc">{course.description}</span>
                    )}
                    <span className="courses-card-meta">
                      {done}/{total} lessons · {course.duration}
                    </span>
                    <span className="courses-card-progress" aria-hidden="true">
                      <span style={{ width: `${pct}%` }} />
                    </span>
                  </span>
                </button>

                {isExpanded && (
                  <ul className="courses-lesson-list">
                    {course.lessons?.map((lesson, index) => {
                      const isDone = completed.includes(lesson.id)

                      return (
                        <li key={lesson.id}>
                          <button
                            type="button"
                            className="courses-lesson-btn"
                            onClick={() => startLesson(course, lesson.id)}
                          >
                            <span className={`courses-lesson-num ${isDone ? 'courses-lesson-num--done' : ''}`}>
                              {isDone ? '✓' : index + 1}
                            </span>
                            <span className="courses-lesson-copy">
                              <span className="courses-lesson-title">{lesson.title}</span>
                              <span className="courses-lesson-duration">{lesson.duration}</span>
                            </span>
                            <span className="courses-lesson-action">
                              {isDone ? 'Review' : 'Start training'}
                            </span>
                          </button>
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
    </MemberLayout>
  )
}
