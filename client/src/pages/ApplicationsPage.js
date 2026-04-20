import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getApplicationsByPosition, updateApplicationStatus, downloadResume } from '../services/api';

const ApplicationsPage = () => {
  const { id } = useParams();
  const [data, setData] = useState({ applications: [], statusCounts: [], total: 0 });
  const [filter, setFilter] = useState('');
  const [sortBy, setSortBy] = useState('date-desc');
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchApps = () => {
    setLoading(true);
    getApplicationsByPosition(id, { status: filter || undefined })
      .then((res) => setData(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchApps(); setSelectedIds([]); }, [id, filter]);

  // Sort applications based on selected sort option
  const sortedApps = [...(data.applications || [])].sort((a, b) => {
    if (sortBy === 'date-desc') return new Date(b.createdAt) - new Date(a.createdAt);
    if (sortBy === 'date-asc') return new Date(a.createdAt) - new Date(b.createdAt);
    if (sortBy === 'name-asc') return a.studentName.localeCompare(b.studentName);
    if (sortBy === 'name-desc') return b.studentName.localeCompare(a.studentName);
    return 0;
  });

  const handleStatusChange = async (appId, newStatus) => {
    try { await updateApplicationStatus(appId, newStatus); fetchApps(); }
    catch (err) { alert(err.response?.data?.error); }
  };

  const handleDownload = async (appId, studentName) => {
    try { await downloadResume(appId, studentName); }
    catch (err) { alert('Failed to download resume.'); console.error(err); }
  };

  const toggleSelect = (appId) => {
    setSelectedIds((prev) =>
      prev.includes(appId) ? prev.filter((id) => id !== appId) : [...prev, appId]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === sortedApps.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedApps.map((app) => app.id));
    }
  };

  const handleBulkApply = async () => {
    if (!bulkAction || selectedIds.length === 0) return;
    if (!window.confirm(`Change ${selectedIds.length} application(s) to ${bulkAction}?`)) return;

    setBulkLoading(true);
    try {
      await Promise.all(selectedIds.map((id) => updateApplicationStatus(id, bulkAction)));
      setSelectedIds([]);
      setBulkAction('');
      fetchApps();
    } catch (err) {
      alert('Some updates failed. Please refresh and try again.');
    } finally {
      setBulkLoading(false);
    }
  };

  // Get count per status from backend data
  const getCount = (status) => {
    if (!status) return data.total;
    const match = data.statusCounts?.find((s) => s.status === status);
    return match?._count || 0;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div>
      <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '12px' }}>Applications ({data.total})</h1>

      {/* Filter tabs with counts */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'All', value: '' },
          { label: 'Pending', value: 'PENDING' },
          { label: 'Reviewed', value: 'REVIEWED' },
          { label: 'Accepted', value: 'ACCEPTED' },
          { label: 'Rejected', value: 'REJECTED' },
        ].map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${filter === f.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.value)}
          >
            {f.label} ({getCount(f.value)})
          </button>
        ))}
      </div>

      {/* Sort dropdown */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>Sort by:</label>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}>
          <option value="date-desc">Newest First</option>
          <option value="date-asc">Oldest First</option>
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
        </select>
      </div>

      {/* Bulk actions bar */}
      {selectedIds.length > 0 && (
        <div style={{
          padding: '12px 16px', background: '#EBF5FB', borderRadius: 'var(--radius)',
          marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        }}>
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
            {selectedIds.length} selected
          </span>
          <select value={bulkAction} onChange={(e) => setBulkAction(e.target.value)}
            className="form-select" style={{ width: 'auto', padding: '6px 10px', fontSize: '0.85rem' }}>
            <option value="">Change status to...</option>
            {['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          <button onClick={handleBulkApply} disabled={!bulkAction || bulkLoading}
            className="btn btn-sm btn-primary">
            {bulkLoading ? 'Applying...' : 'Apply'}
          </button>
          <button onClick={() => setSelectedIds([])} className="btn btn-sm btn-secondary">
            Clear
          </button>
        </div>
      )}

      {loading ? <div className="loading">Loading...</div> : sortedApps.length === 0 ? (
        <div className="empty-state"><h3>No applications found</h3></div>
      ) : (
        <>
          {/* Select all checkbox */}
          <div style={{ padding: '8px 16px', marginBottom: '8px', fontSize: '0.85rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
              <input type="checkbox"
                checked={selectedIds.length === sortedApps.length && sortedApps.length > 0}
                onChange={toggleSelectAll} />
              Select all ({sortedApps.length})
            </label>
          </div>

          {sortedApps.map((app) => (
            <div key={app.id} className="card" style={{
              marginBottom: '12px', padding: '16px',
              border: selectedIds.includes(app.id) ? '2px solid var(--primary)' : '1px solid var(--border-light)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '12px', flex: 1 }}>
                  <input type="checkbox"
                    checked={selectedIds.includes(app.id)}
                    onChange={() => toggleSelect(app.id)}
                    style={{ marginTop: '4px' }} />
                  <div>
                    <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{app.studentName}</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>{app.studentEmail}</p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Applied: {formatDate(app.createdAt)}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className={`badge badge-${app.status.toLowerCase()}`}>{app.status}</span>
                  <select value={app.status} onChange={(e) => handleStatusChange(app.id, e.target.value)}
                    className="form-select" style={{ width: 'auto', padding: '4px 8px', fontSize: '0.8rem' }}>
                    {['PENDING', 'REVIEWED', 'ACCEPTED', 'REJECTED'].map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <button onClick={() => handleDownload(app.id, app.studentName)} className="btn btn-sm btn-primary">
                    Resume
                  </button>
                  <Link to={`/applications/${app.id}`} className="btn btn-sm btn-secondary">Details</Link>
                </div>
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
};

export default ApplicationsPage;