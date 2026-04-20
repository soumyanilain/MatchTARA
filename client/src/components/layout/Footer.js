import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-brand">MatchTARA</h3>
          <p className="footer-tagline">
            TA &amp; RA Position Portal for University Departments
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">Quick Links</h4>
          <ul className="footer-links">
            <li><Link to="/">Browse Positions</Link></li>
            <li><Link to="/login">Faculty Login</Link></li>
            <li><Link to="/register">Register</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-heading">About</h4>
          <ul className="footer-links">
            <li>Built by Team CodeHustlers</li>
            <li>University of North Carolina at Charlotte</li>
            <li>College of Computing and Informatics</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; {year} MatchTARA &middot; Team CodeHustlers. All rights reserved.</p>
        <p className="footer-disclaimer">
          Built for educational purposes as part of Software System Design and Implementation coursework.
        </p>
      </div>
    </footer>
  );
};

export default Footer;