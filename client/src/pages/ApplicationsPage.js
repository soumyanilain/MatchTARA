// TODO: Sprint 2 — US-8a, US-8b (View Applications List)
import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationsByPosition, updateApplicationStatus, downloadResume } from '../services/api';

const ApplicationsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState({ applications: [], statusCounts: [], total: 0 });
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchApps = () => {
    setLoading(true);
    getApplicationsByPosition(id, { status: filter || undefined })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); }, [id, filter]);

  const handleStatusChange = async (appId, newStatus) => {
    try { await updateApplicationStatus(appId, newStatus); fetchApps(); }
    catch (err) { alert(err.response?.data?.error); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '12px' }}>Applications ({data.total})</h1>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
        {['', 'PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map((s) => (
          <button key={s} className={`btn btn-sm ${filter === s ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(s)}>
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? <div className="loading">Loading...</div> : data.applications.length === 0 ? (
        <div className="empty-state"><h3>No applications found</h3></div>
      ) : (
        data.applications.map((app) => (
          <div key={app.id} className="card" style={{ marginBottom: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{app.studentName}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{app.studentEmail}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied: {formatDate(app.createdAt)}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)}
                  className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}>
                  {['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <button onClick={() => downloadResume(app.id, app.studentName)} className="btn btn-sm btn-primary">Resume</button>
                <Link to={`/applications/${app.id}`} className="btn btn-sm btn-secondary">Details</Link>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ApplicationsPage;
