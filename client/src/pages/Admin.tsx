import './Admin.css'

const stats = [
  { label: 'Active Subscribers', value: '—' },
  { label: 'Total Courses', value: '—' },
  { label: 'Revenue (Month)', value: '—' },
]

export default function Admin() {
  return (
    <>
      <div className="page-header">
        <div className="container">
          <h1>Admin Dashboard</h1>
          <p>Upload videos, manage packages, and track subscribers.</p>
        </div>
      </div>

      <section className="section admin-section">
        <div className="container">
          <div className="admin-stats">
            {stats.map((stat) => (
              <div key={stat.label} className="stat-card card">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="admin-panels">
            <div className="admin-panel card">
              <h2>Video Management</h2>
              <p>Upload new training videos and organise them into courses.</p>
              <button type="button" className="btn btn-secondary">Upload Video</button>
            </div>
            <div className="admin-panel card">
              <h2>Package Settings</h2>
              <p>Create and edit subscription packages and pricing.</p>
              <button type="button" className="btn btn-secondary">Manage Packages</button>
            </div>
            <div className="admin-panel card">
              <h2>Subscribers</h2>
              <p>View active, renewed, and lapsed subscriptions.</p>
              <button type="button" className="btn btn-secondary">View Subscribers</button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
