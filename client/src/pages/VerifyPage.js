import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { verifyEmail } from '../services/api';

const VerifyPage = () => {
  const { token } = useParams();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('');
  const hasVerified = useRef(false);

  useEffect(() => {
    if (hasVerified.current) return;
    hasVerified.current = true;

    verifyEmail(token)
      .then((res) => { setStatus('success'); setMessage(res.data.message); })
      .catch((err) => { setStatus('error'); setMessage(err.response?.data?.error || 'Verification failed.'); });
  }, [token]);

  return (
    <div style={{ maxWidth: '480px', margin: '60px auto', textAlign: 'center' }}>
      <div className="card" style={{ padding: '40px' }}>
        {status === 'verifying' && <div className="loading">Verifying your email...</div>}
        {status === 'success' && (
          <>
            <div className="alert alert-success">{message}</div>
            <Link to="/login" className="btn btn-primary">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="alert alert-error">{message}</div>
            <Link to="/register" className="btn btn-secondary">Back to Register</Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyPage;