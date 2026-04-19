import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationById, updateApplicationStatus, downloadResume } from '../services/api';

const ApplicationDetailPage = () => {
  const { id } = useParams();
  const [app, setApp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    getApplicationById(id)
      .then((res) => setApp(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateApplicationStatus(id, newStatus);
      setApp({ ...app, status: newStatus });
    } catch (err) { alert(err.response?.data?.error); }
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadResume(id, app.studentName);
    } catch (err) {
      alert('Failed to download resume. Please try again.');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!app) return <div className="empty-state"><h3>Application not found</h3></div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link to={`/positions/${app.positionId}/applications`} style={{ fontSize: '0.9rem' }}>← Back to Applications</Link>

      <div className="card" style={{ marginTop: '12px', padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h1 style={{ fontSize: '1.3rem' }}>{app.studentName}</h1>
          <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
        </div>

        <p style={{ marginBottom: '4px' }}><strong>Email:</strong> {app.studentEmail}</p>
        <p style={{ marginBottom: '16px', color: 'var(--text-light)', fontSize: '0.85rem' }}>
          Applied: {new Date(app.createdAt).toLocaleString()}
        </p>

        <h3 style={{ marginBottom: '8px' }}>Statement of Interest</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-light)', marginBottom: '20px', padding: '12px', background: 'var(--bg)', borderRadius: 'var(--radius)' }}>
          {app.statement}
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={handleDownload} className="btn btn-primary" disabled={downloading}>
            {downloading ? 'Downloading...' : 'Download Resume'}
          </button>
          <select value={app.status} onChange={(e) => handleStatusChange(e.target.value)}
            className="form-select" style={{ width: 'auto' }}>
            {['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetailPage;