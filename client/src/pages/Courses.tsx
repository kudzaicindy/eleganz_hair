import { Navigate } from 'react-router-dom'

/** Course content lives on the member dashboard */
export default function Courses() {
  return <Navigate to="/dashboard" replace />
}
