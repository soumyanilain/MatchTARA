import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPosition } from '../services/api';

const CreatePositionPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', type: 'TA', courseNumber: '', researchArea: '',
    description: '', requirements: '', hoursPerWeek: '', compensation: '', deadline: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await createPosition(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create position.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '12px' }}>Create New Position</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginTop: '16px', padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Position Title *</label>
            <input type="text" className="form-input" placeholder="e.g., TA for ITCS 6160"
              value={form.title} onChange={set('title')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Position Type *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['TA', 'RA'].map((t) => (
                <button key={t} type="button"
                  className={`btn btn-sm ${form.type === t ? (t === 'TA' ? 'btn-success' : 'btn-primary') : 'btn-secondary'}`}
                  onClick={() => setForm({ ...form, type: t })}
                  style={{ minWidth: '60px' }}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Course Number</label>
              <input type="text" className="form-input" placeholder="e.g., ITCS 6160"
                value={form.courseNumber} onChange={set('courseNumber')} />
            </div>
            <div className="form-group">
              <label className="form-label">Research Area</label>
              <input type="text" className="form-input" placeholder="e.g., NLP"
                value={form.researchArea} onChange={set('researchArea')} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea className="form-textarea" rows={4} placeholder="Describe responsibilities and expectations..."
              value={form.description} onChange={set('description')} required />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements *</label>
            <textarea className="form-textarea" rows={3} placeholder="Required skills, GPA, prerequisites..."
              value={form.requirements} onChange={set('requirements')} required />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Hours/Week *</label>
              <input type="number" className="form-input" placeholder="10" min="1"
                value={form.hoursPerWeek} onChange={set('hoursPerWeek')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Compensation *</label>
              <input type="text" className="form-input" placeholder="$15/hr"
                value={form.compensation} onChange={set('compensation')} required />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input type="date" className="form-input"
                value={form.deadline} onChange={set('deadline')} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Link to="/dashboard" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? 'Publishing...' : 'Publish Position'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePositionPage;
