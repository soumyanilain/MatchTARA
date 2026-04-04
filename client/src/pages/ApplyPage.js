import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPositionById, submitApplication } from '../services/api';

const ApplyPage = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({ studentName: '', studentEmail: '', statement: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPositionById(id).then((res) => setPosition(res.data)).catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!file) { setError('Please upload your resume (PDF).'); return; }

    setLoading(true);
    const formData = new FormData();
    formData.append('positionId', id);
    formData.append('studentName', form.studentName);
    formData.append('studentEmail', form.studentEmail);
    formData.append('statement', form.statement);
    formData.append('resume', file);

    try {
      const res = await submitApplication(formData);
      setSuccess(res.data.message);
      setForm({ studentName: '', studentEmail: '', statement: '' });
      setFile(null);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (!position) return <div className="loading">Loading...</div>;

  return (
    <div style={{ maxWidth: '700px', margin: '0 auto' }}>
      <Link to={`/positions/${id}`} style={{ fontSize: '0.9rem' }}>← Back to Position Details</Link>

      <div className="card" style={{ marginTop: '12px', padding: '16px', background: 'var(--bg)' }}>
        <h3>{position.title}</h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-light)' }}>
          Prof. {position.professor?.name} | {position.hoursPerWeek} hrs/week | {position.compensation}
        </p>
      </div>

      <div className="card" style={{ marginTop: '16px', padding: '32px' }}>
        <h2 style={{ marginBottom: '4px' }}>Submit Your Application</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.9rem' }}>
          No account required — just fill out the form below.
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        {!success && (
          <form onSubmit={handleSubmit}>
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-input" placeholder="John Doe"
                  value={form.studentName} onChange={set('studentName')} required />
              </div>
              <div className="form-group">
                <label className="form-label">University Email *</label>
                <input type="email" className="form-input" placeholder="jdoe@university.edu"
                  value={form.studentEmail} onChange={set('studentEmail')} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Statement of Interest *</label>
              <textarea className="form-textarea" placeholder="Tell the professor why you are interested..."
                value={form.statement} onChange={set('statement')} required rows={5} />
            </div>

            <div className="form-group">
              <label className="form-label">Resume (PDF) *</label>
              <div className="upload-zone" onClick={() => document.getElementById('resume-input').click()}>
                <p>{file ? `Selected: ${file.name}` : 'Click to upload or drag & drop'}</p>
                <p className="hint">PDF only, max 5 MB</p>
              </div>
              <input type="file" id="resume-input" accept=".pdf" style={{ display: 'none' }}
                onChange={(e) => setFile(e.target.files[0])} />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>

            <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
              Your email is stored only for this application — no account will be created.
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default ApplyPage;
