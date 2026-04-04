import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPositionById } from '../services/api';

const PositionDetailPage = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getPositionById(id)
      .then((res) => setPosition(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="loading">Loading position...</div>;
  if (!position) return <div className="empty-state"><h3>Position not found</h3></div>;

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const isPastDeadline = new Date(position.deadline) < new Date();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Link to="/" style={{ fontSize: '0.9rem' }}>← Back to Positions</Link>
      <div className="card" style={{ marginTop: '16px', padding: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span className={`badge badge-${position.type.toLowerCase()}`}>{position.type}</span>
          <h1 style={{ fontSize: '1.5rem' }}>{position.title}</h1>
        </div>
        <p style={{ color: 'var(--text-light)', marginBottom: '20px' }}>
          Prof. {position.professor?.name} &nbsp;|&nbsp; {position.professor?.department}
          &nbsp;|&nbsp; {position.hoursPerWeek} hrs/week &nbsp;|&nbsp; {position.compensation}
        </p>
        <p style={{ color: isPastDeadline ? 'var(--danger)' : 'var(--text)', marginBottom: '20px', fontWeight: 600 }}>
          Deadline: {formatDate(position.deadline)} {isPastDeadline && '(Expired)'}
        </p>

        {position.courseNumber && <p><strong>Course:</strong> {position.courseNumber}</p>}
        {position.researchArea && <p><strong>Research Area:</strong> {position.researchArea}</p>}

        <h3 style={{ marginTop: '20px', marginBottom: '8px' }}>Description</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-light)' }}>{position.description}</p>

        <h3 style={{ marginTop: '20px', marginBottom: '8px' }}>Requirements</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: 'var(--text-light)' }}>{position.requirements}</p>

        <div style={{ marginTop: '24px' }}>
          {position.status === 'OPEN' && !isPastDeadline ? (
            <Link to={`/positions/${position.id}/apply`} className="btn btn-primary" style={{ fontSize: '1rem', padding: '12px 32px' }}>
              Apply for this Position
            </Link>
          ) : (
            <button className="btn btn-secondary" disabled>Applications Closed</button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PositionDetailPage;
