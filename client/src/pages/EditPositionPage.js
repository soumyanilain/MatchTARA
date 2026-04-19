import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPositionById, updatePosition } from '../services/api';

const EditPositionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    type: 'TA',
    courseNumber: '',
    researchArea: '',
    description: '',
    requirements: '',
    hoursPerWeek: '',
    compensation: '',
    deadline: '',
  });
  const [error, setError] = useState('');
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
          deadline: pos.deadline ? String(pos.deadline).split('T')[0] : '',
          compensation: pos.compensation || '',
        });
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.response?.data?.error || 'Failed to load position.');
      })
      .finally(() => {
        if (isMounted) setInitialLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleChange = (field) => (e) => {
    setForm({ ...form, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        title: form.title,
        type: form.type,
        courseNumber: form.courseNumber || null,
        researchArea: form.researchArea || null,
        description: form.description,
        requirements: form.requirements,
        hoursPerWeek: parseInt(form.hoursPerWeek, 10),
        compensation: form.compensation,
        deadline: new Date(form.deadline).toISOString(),
      };

      await updatePosition(id, payload);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update position.');
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return <div className="loading">Loading position...</div>;
  }

  return (
    <div style={{ maxWidth: '750px', margin: '0 auto' }}>
      <Link to="/dashboard" style={{ fontSize: '0.9rem' }}>← Back to Dashboard</Link>
      <h1 className="page-title" style={{ marginTop: '12px' }}>Edit Position</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="card" style={{ marginTop: '16px', padding: '28px' }}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Position Title *</label>
            <input
              type="text"
              className="form-input"
              value={form.title}
              onChange={handleChange('title')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Position Type *</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              {['TA', 'RA'].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`btn btn-sm ${
                    form.type === t
                      ? t === 'TA'
                        ? 'btn-success'
                        : 'btn-primary'
                      : 'btn-secondary'
                  }`}
                  onClick={() => setForm({ ...form, type: t })}
                  style={{ minWidth: '60px' }}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Course Number</label>
              <input
                type="text"
                className="form-input"
                value={form.courseNumber}
                onChange={handleChange('courseNumber')}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Research Area</label>
              <input
                type="text"
                className="form-input"
                value={form.researchArea}
                onChange={handleChange('researchArea')}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              value={form.description}
              onChange={handleChange('description')}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Requirements *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={form.requirements}
              onChange={handleChange('requirements')}
              required
            />
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="form-label">Hours/Week *</label>
              <input
                type="number"
                className="form-input"
                min="1"
                value={form.hoursPerWeek}
                onChange={handleChange('hoursPerWeek')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Compensation *</label>
              <input
                type="text"
                className="form-input"
                value={form.compensation}
                onChange={handleChange('compensation')}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Deadline *</label>
              <input
                type="date"
                className="form-input"
                value={form.deadline}
                onChange={handleChange('deadline')}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '12px',
              marginTop: '8px',
            }}
          >
            <Link to="/dashboard" className="btn btn-secondary">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditPositionPage;