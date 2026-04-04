import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyPositions, getRecentApplications, closePosition, deletePosition } from '../services/api';

const DashboardPage = () => {
  const [data, setData] = useState({ positions: [], stats: {} });
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = () => {
    setLoading(true);
    Promise.all([getMyPositions(), getRecentApplications()])
      .then(([posRes, appRes]) => {
        setData(posRes.data);
        setRecentApps(appRes.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleClose = async (id) => {
    if (!window.confirm('Close this position? It will be removed from the job board.')) return;
    try { await closePosition(id); fetchData(); } catch (err) { alert(err.response?.data?.error); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this position and all its applications? This cannot be undone.')) return;
    try { await deletePosition(id); fetchData(); } catch (err) { alert(err.response?.data?.error); }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  if (loading) return <div className="loading">Loading dashboard...</div>;

  const { stats, positions } = data;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">My Positions</h1>
        <Link to="/positions/new" className="btn btn-success">+ Create Position</Link>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: '24px' }}>
        {[
          { label: 'Total Positions', value: stats.totalPositions },
          { label: 'Open', value: stats.openPositions },
          { label: 'Closed', value: stats.closedPositions },
          { label: 'Applications', value: stats.totalApplications },
        ].map((s) => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '16px' }}>
            <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--primary-dark)' }}>{s.value}</div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Positions table */}
      {positions.length === 0 ? (
        <div className="empty-state">
          <h3>No positions yet</h3>
          <p>Click "Create Position" to post your first TA or RA opening.</p>
        </div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: 'var(--radius)', overflow: 'hidden', boxShadow: 'var(--shadow)' }}>
          <thead>
            <tr style={{ background: 'var(--primary)', color: 'white', textAlign: 'left' }}>
              <th style={{ padding: '10px 14px' }}>Title</th>
              <th style={{ padding: '10px' }}>Type</th>
              <th style={{ padding: '10px', textAlign: 'center' }}>Apps</th>
              <th style={{ padding: '10px' }}>Deadline</th>
              <th style={{ padding: '10px' }}>Status</th>
              <th style={{ padding: '10px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {positions.map((pos, i) => (
              <tr key={pos.id} style={{ borderBottom: '1px solid var(--border-light)', background: i % 2 === 0 ? 'white' : '#F8F9FA' }}>
                <td style={{ padding: '10px 14px', fontWeight: 500 }}>{pos.title}</td>
                <td style={{ padding: '10px' }}><span className={`badge badge-${pos.type.toLowerCase()}`}>{pos.type}</span></td>
                <td style={{ padding: '10px', textAlign: 'center', fontWeight: 700 }}>{pos._count?.applications || 0}</td>
                <td style={{ padding: '10px', color: 'var(--text-light)' }}>{formatDate(pos.deadline)}</td>
                <td style={{ padding: '10px' }}><span className={`badge badge-${pos.status.toLowerCase()}`}>{pos.status}</span></td>
                <td style={{ padding: '10px' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <Link to={`/positions/${pos.id}/edit`} className="btn btn-sm btn-secondary">Edit</Link>
                    <Link to={`/positions/${pos.id}/applications`} className="btn btn-sm btn-primary">View Apps</Link>
                    {pos.status === 'OPEN' && (
                      <button className="btn btn-sm btn-secondary" onClick={() => handleClose(pos.id)}>Close</button>
                    )}
                    <button className="btn btn-sm btn-danger" onClick={() => handleDelete(pos.id)}>Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Recent Applications */}
      {recentApps.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>Recent Applications</h2>
          {recentApps.map((app) => (
            <div key={app.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', marginBottom: '8px' }}>
              <div>
                <strong>{app.studentName}</strong>
                <span style={{ color: 'var(--text-light)', marginLeft: '12px', fontSize: '0.85rem' }}>{app.position?.title}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                <Link to={`/applications/${app.id}`} className="btn btn-sm btn-primary">Review →</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
