import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { loginProfessor, resendVerification } from '../services/api';

const LoginPage = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resending, setResending] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResendMessage('');
    setNeedsVerification(false);
    setLoading(true);
    try {
      const res = await loginProfessor(form);
      login(res.data.token, res.data.professor);
      navigate('/dashboard');
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed.';
      setError(errorMsg);
      // Show resend option if the error is about verification
      if (errorMsg.toLowerCase().includes('verify')) {
        setNeedsVerification(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    try {
      const res = await resendVerification(form.email);
      setResendMessage(res.data.message);
    } catch (err) {
      setResendMessage(err.response?.data?.error || 'Failed to resend email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ maxWidth: '420px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '4px' }}>MatchTARA</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '24px' }}>Faculty Login</p>

        {error && <div className="alert alert-error">{error}</div>}
        {resendMessage && <div className="alert alert-success">{resendMessage}</div>}

        {needsVerification && !resendMessage && (
          <div style={{
            padding: '12px', background: '#FFF3CD', border: '1px solid #FFEAA7',
            borderRadius: 'var(--radius)', marginBottom: '16px', fontSize: '0.9rem',
          }}>
            <p style={{ marginBottom: '8px' }}>Didn't receive the verification email or link expired?</p>
            <button type="button" onClick={handleResend} disabled={resending}
              className="btn btn-sm btn-primary">
              {resending ? 'Sending...' : 'Resend Verification Email'}
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input type="email" className="form-input" placeholder="yourname@university.edu"
              value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="••••••••"
              value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
        <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '8px' }}>
          Only verified university faculty can create accounts.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;