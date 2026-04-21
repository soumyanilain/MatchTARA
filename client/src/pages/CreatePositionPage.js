import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { createPosition } from '../services/api';
import { validatePositionForm } from '../utils/validatePosition';

const CreatePositionPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', type: 'TA', courseNumber: '', researchArea: '',
    description: '', requirements: '', hoursPerWeek: '', compensation: '', deadline: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    // Clear error for this field as user types
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    // Validate before submitting
    const validationErrors = validatePositionForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await createPosition({
        ...form,
        hoursPerWeek: parseInt(form.hoursPerWeek, 10),
        deadline: new Date(form.deadline).toISOString(),
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to create position.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) => errors[field] && (
    <div className="form-error">{errors[field]}</div>
  );

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '12px' }}>Create New Position</h1>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <div className="card" style={{ marginTop: '16px', padding: '28px' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Position Title *</label>
            <input type="text" className="form-input" placeholder="e.g., TA for ITCS 6160"
              value={form.title} onChange={set('title')} />
            {fieldError('title')}
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
            {fieldError('type')}
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Course Number {form.type === 'TA' && '*'}</label>
              <input type="text" className="form-input" placeholder="e.g., ITCS 6160"
                value={form.courseNumber} onChange={set('courseNumber')} />
              {fieldError('courseNumber')}
            </div>
            <div className="form-group">
              <label className="form-label">Research Area {form.type === 'RA' && '*'}</label>
              <input type="text" className="form-input" placeholder="e.g., NLP"
                value={form.researchArea} onChange={set('researchArea')} />
              {fieldError('researchArea')}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description * (minimum 20 characters)</label>
            <textarea className="form-textarea" rows={4} placeholder="Describe responsibilities and expectations..."
              value={form.description} onChange={set('description')} />
            {fieldError('description')}
          </div>

          <div className="form-group">
            <label className="form-label">Requirements * (minimum 10 characters)</label>
            <textarea className="form-textarea" rows={3} placeholder="Required skills, GPA, prerequisites..."
              value={form.requirements} onChange={set('requirements')} />
            {fieldError('requirements')}
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Hours/Week * (1-40)</label>
              <input type="number" className="form-input" placeholder="10" min="1" max="40"
                value={form.hoursPerWeek} onChange={set('hoursPerWeek')} />
              {fieldError('hoursPerWeek')}
            </div>
            <div className="form-group">
              <label className="form-label">Compensation *</label>
              <input type="text" className="form-input" placeholder="$15/hr"
                value={form.compensation} onChange={set('compensation')} />
              {fieldError('compensation')}
            </div>
            <div className="form-group">
              <label className="form-label">Deadline * (future date)</label>
              <input type="date" className="form-input"
                value={form.deadline} onChange={set('deadline')} />
              {fieldError('deadline')}
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
