import { Routes, Route } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import PrivateRoute from './components/auth/PrivateRoute';

// Pages
import HomePage from './pages/HomePage';
import PositionDetailPage from './pages/PositionDetailPage';
import ApplyPage from './pages/ApplyPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import VerifyPage from './pages/VerifyPage';
import DashboardPage from './pages/DashboardPage';
import CreatePositionPage from './pages/CreatePositionPage';
import EditPositionPage from './pages/EditPositionPage';
import ApplicationsPage from './pages/ApplicationsPage';
import ApplicationDetailPage from './pages/ApplicationDetailPage';

function App() {
  return (
    <div className="App">
      <Navbar />
      <main className="container page">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/positions/:id" element={<PositionDetailPage />} />
          <Route path="/positions/:id/apply" element={<ApplyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify/:token" element={<VerifyPage />} />

          {/* Protected Routes — Professor Only */}
          <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
          <Route path="/positions/new" element={<PrivateRoute><CreatePositionPage /></PrivateRoute>} />
          <Route path="/positions/:id/edit" element={<PrivateRoute><EditPositionPage /></PrivateRoute>} />
          <Route path="/positions/:id/applications" element={<PrivateRoute><ApplicationsPage /></PrivateRoute>} />
          <Route path="/applications/:id" element={<PrivateRoute><ApplicationDetailPage /></PrivateRoute>} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
