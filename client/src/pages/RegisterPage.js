import { useState } from 'react';
import { Link } from 'react-router-dom';
import { registerProfessor } from '../services/api';

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', department: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await registerProfessor(form);
      setSuccess(res.data.message);
      setForm({ name: '', email: '', password: '', department: '' });
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  return (
    <div style={{ maxWidth: '480px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '32px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '4px' }}>Create Account</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-light)', marginBottom: '24px' }}>
          Register with your university email
        </p>

        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input type="text" className="form-input" placeholder="Dr. Jane Smith"
              value={form.name} onChange={set('name')} required />
          </div>
          <div className="form-group">
            <label className="form-label">University Email</label>
            <input type="email" className="form-input" placeholder="jsmith@university.edu"
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input type="text" className="form-input" placeholder="Computer Science"
              value={form.department} onChange={set('department')} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input type="password" className="form-input" placeholder="Min 8 characters"
              value={form.password} onChange={set('password')} required minLength={8} />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
