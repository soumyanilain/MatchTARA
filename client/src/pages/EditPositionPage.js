import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPositionById, updatePosition } from '../services/api';
import { validatePositionForm } from '../utils/validatePosition';

const EditPositionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '', type: 'TA', courseNumber: '', researchArea: '',
    description: '', requirements: '', hoursPerWeek: '', compensation: '', deadline: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getPositionById(id)
      .then((res) => {
        if (!isMounted) return;
        const pos = res.data || {};
        setForm({
          title: pos.title || '',
          type: pos.type || 'TA',
          courseNumber: pos.courseNumber || '',
          researchArea: pos.researchArea || '',
          description: pos.description || '',
          requirements: pos.requirements || '',
          hoursPerWeek: pos.hoursPerWeek != null ? String(pos.hoursPerWeek) : '',
          compensation: pos.compensation || '',
          deadline: pos.deadline ? String(pos.deadline).split('T')[0] : '',
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setApiError(err.response?.data?.error || 'Failed to load position.');
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });
    return () => { isMounted = false; };
  }, [id]);

  const set = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
    if (errors[field]) setErrors({ ...errors, [field]: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    const validationErrors = validatePositionForm(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await updatePosition(id, {
        title: form.title,
        type: form.type,
        courseNumber: form.courseNumber || null,
        researchArea: form.researchArea || null,
        description: form.description,
        requirements: form.requirements,
        hoursPerWeek: parseInt(form.hoursPerWeek, 10),
        compensation: form.compensation,
        deadline: new Date(form.deadline).toISOString(),
      });
      navigate('/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.error || 'Failed to update position.');
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) => errors[field] && (
    <div className="form-error">{errors[field]}</div>
  );

  if (initialLoading) return <div className="loading">Loading position...</div>;

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '12px' }}>Edit Position</h1>

      {apiError && <div className="alert alert-error">{apiError}</div>}

      <div className="card" style={{ marginTop: '16px', padding: '28px' }}>
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label">Position Title *</label>
            <input type="text" className="form-input" value={form.title} onChange={set('title')} />
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
              <input type="text" className="form-input" value={form.courseNumber} onChange={set('courseNumber')} />
              {fieldError('courseNumber')}
            </div>
            <div className="form-group">
              <label className="form-label">Research Area {form.type === 'RA' && '*'}</label>
              <input type="text" className="form-input" value={form.researchArea} onChange={set('researchArea')} />
              {fieldError('researchArea')}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description * (minimum 20 characters)</label>
            <textarea className="form-textarea" rows={4} value={form.description} onChange={set('description')} />
            {fieldError('description')}
          </div>

          <div className="form-group">
            <label className="form-label">Requirements * (minimum 10 characters)</label>
            <textarea className="form-textarea" rows={3} value={form.requirements} onChange={set('requirements')} />
            {fieldError('requirements')}
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Hours/Week * (1-40)</label>
              <input type="number" className="form-input" min="1" max="40"
                value={form.hoursPerWeek} onChange={set('hoursPerWeek')} />
              {fieldError('hoursPerWeek')}
            </div>
            <div className="form-group">
              <label className="form-label">Compensation *</label>
              <input type="text" className="form-input" value={form.compensation} onChange={set('compensation')} />
              {fieldError('compensation')}
            </div>
            <div className="form-group">
              <label className="form-label">Deadline * (future date)</label>
              <input type="date" className="form-input" value={form.deadline} onChange={set('deadline')} />
              {fieldError('deadline')}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '8px' }}>
            <Link to="/dashboard" className="btn btn-secondary">Cancel</Link>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPositionPage;
