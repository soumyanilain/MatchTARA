import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getPositions } from '../services/api';

const HomePage = () => {
  const [positions, setPositions] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();

  const type = searchParams.get('type') || '';
  const search = searchParams.get('search') || '';
  const page = searchParams.get('page') || 1;

  useEffect(() => {
    setLoading(true);
    getPositions({ type, search, page, limit: 10 })
      .then((res) => {
        setPositions(res.data.positions);
        setPagination(res.data.pagination);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [type, search, page]);

  const handleSearch = (e) => {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams);
    if (value) params.set('search', value);
    else params.delete('search');
    params.delete('page');
    setSearchParams(params);
  };

  const handleFilter = (filterType) => {
    const params = new URLSearchParams(searchParams);
    if (filterType) params.set('type', filterType);
    else params.delete('type');
    params.delete('page');
    setSearchParams(params);
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div>
      <h1 className="page-title">Open Positions</h1>
      <p className="page-subtitle">Browse available TA and RA opportunities</p>

      {/* Search */}
      <div style={{ marginBottom: '16px' }}>
        <input
          type="text"
          className="form-input"
          placeholder="Search by keyword, course, or research area..."
          defaultValue={search}
          onChange={handleSearch}
          style={{ maxWidth: '500px' }}
        />
      </div>

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
        {[
          { label: 'All', value: '' },
          { label: 'TA', value: 'TA' },
          { label: 'RA', value: 'RA' },
        ].map((f) => (
          <button
            key={f.value}
            className={`btn btn-sm ${type === f.value ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => handleFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Position cards */}
      {loading ? (
        <div className="loading">Loading positions...</div>
      ) : positions.length === 0 ? (
        <div className="empty-state">
          <h3>No positions found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="grid-2">
          {positions.map((pos) => (
            <div key={pos.id} className="card">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <span className={`badge badge-${pos.type.toLowerCase()}`}>{pos.type}</span>
                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{pos.title}</h3>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '4px' }}>
                Prof. {pos.professor?.name} &nbsp;|&nbsp; {pos.professor?.department}
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--danger)', marginBottom: '8px' }}>
                Deadline: {formatDate(pos.deadline)}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-light)', marginBottom: '12px' }}>
                {pos.description?.substring(0, 120)}...
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link to={`/positions/${pos.id}`} className="btn btn-sm btn-secondary">View Details</Link>
                <Link to={`/positions/${pos.id}/apply`} className="btn btn-sm btn-primary">Apply →</Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
          {Array.from({ length: pagination.totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`btn btn-sm ${parseInt(page) === i + 1 ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('page', i + 1);
                setSearchParams(params);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HomePage;
