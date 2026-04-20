import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { professor, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Generate initials from professor name for the avatar
  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <div className="navbar-logo">M</div>
          <span className="navbar-brand-text">MatchTARA</span>
        </Link>

        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <div className="nav-professor">
                <div className="nav-avatar">{getInitials(professor?.name)}</div>
                <span>{professor?.name}</span>
              </div>
              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </>
          ) : (
            <>
              <Link to="/" className="nav-link">Browse Positions</Link>
              <Link to="/login" className="nav-link">Faculty Login</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;