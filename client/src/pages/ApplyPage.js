import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPositionById, submitApplication } from '../services/api';

const ApplyPage = () => {
  const { id } = useParams();
  const [position, setPosition] = useState(null);
  const [form, setForm] = useState({ studentName: '', studentEmail: '', statement: '' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getPositionById(id).then((res) => setPosition(res.data)).catch(console.error);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate .edu email
    if (!form.studentEmail.toLowerCase().trim().endsWith('.edu')) {
      setError('Please use your university (.edu) email address to apply.');
      return;
    }

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
      setSubmittedData({
        ...form,
        resumeFileName: file.name,
        positionTitle: position.title,
        submittedAt: new Date(),
        applicationId: res.data.application.id,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  if (!position) return <div className="loading">Loading...</div>;

  // ── Confirmation Page (after successful submit) ──
  if (submitted && submittedData) {
    return (
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>✅</div>
          <h1 style={{ fontSize: '1.8rem', color: 'var(--success)', marginBottom: '8px' }}>
            Application Submitted!
          </h1>
          <p style={{ color: 'var(--text-light)', marginBottom: '32px' }}>
            Thank you for applying. Your application has been received and the professor has been notified.
          </p>

          <div style={{
            background: 'var(--bg)', padding: '24px', borderRadius: 'var(--radius)',
            textAlign: 'left', marginBottom: '24px',
          }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '16px', color: 'var(--text)' }}>
              Submission Summary
            </h3>
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Position</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{submittedData.positionTitle}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Name</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{submittedData.studentName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Email</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{submittedData.studentEmail}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Resume</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>{submittedData.resumeFileName}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Submitted</span>
                <span style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                  {submittedData.submittedAt.toLocaleString()}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-light)', fontSize: '0.9rem' }}>Reference ID</span>
                <span style={{ fontWeight: 500, fontSize: '0.85rem', fontFamily: 'monospace' }}>
                  {submittedData.applicationId.substring(0, 8)}
                </span>
              </div>
            </div>
          </div>

          <div style={{
            padding: '16px', background: '#EBF5FB', borderRadius: 'var(--radius)',
            marginBottom: '24px', textAlign: 'left',
          }}>
            <p style={{ fontSize: '0.9rem', color: 'var(--text)', margin: 0 }}>
              <strong>What's next?</strong> A confirmation email has been sent to your inbox. The professor will review your application and contact you via email if they'd like to move forward. You'll also receive email updates when your application status changes.
            </p>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <Link to="/" className="btn btn-primary">Browse More Positions</Link>
            <Link to={`/positions/${id}`} className="btn btn-secondary">Back to Position</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Application Form (default) ──
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
              <small style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                Must be a valid .edu email address
              </small>
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
      </div>
    </div>
  );
};

export default ApplyPage;