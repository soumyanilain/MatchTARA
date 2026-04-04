// TODO: Sprint 2 — US-5 (Edit Position)
// This page will load position data into the same form as CreatePositionPage
// and call updatePosition(id, data) on submit.
import { Link } from 'react-router-dom';

const EditPositionPage = () => (
  <div>
    <Link to="/dashboard">← Back to Dashboard</Link>
    <h1 className="page-title" style={{ marginTop: '12px' }}>Edit Position</h1>
    <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
      <p style={{ color: 'var(--text-light)' }}>This feature will be implemented in Sprint 2 (US-5).</p>
    </div>
  </div>
);

export default EditPositionPage;
