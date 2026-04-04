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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">MatchTARA</Link>
        <div className="navbar-links">
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="nav-link">Dashboard</Link>
              <span className="nav-professor">{professor?.name}</span>
              <button onClick={handleLogout} className="nav-logout">Logout</button>
            </>
          ) : (
            <Link to="/login" className="nav-link">Faculty Login</Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
