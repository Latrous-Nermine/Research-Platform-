import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/common/PrivateRoute';
import Login from './pages/Login';
import UsersDetails from './pages/UserDetails';
import Dashboard from './pages/Dashboard';
import PublicationPage from './pages/PublicationPage';
import PublicationDetails from './pages/PublicationDetails';
import DomainPage from './pages/DomainPage';
import UsersPage from './pages/UsersPage';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Navbar from './components/common/Navbar';
import PublicationFeed from './pages/PublicationFeed';
import './styles/App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={
              // <Home />
                <PublicationFeed />
              } />
            <Route path="/login" element={<Login />} />
            {/* <Route path="/register" element={<Register />} /> */}
            
            <Route path="/dashboard" element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            } />
            
            <Route path="/publications" element={
                <PublicationPage />
            } />
            
            <Route path="/publications/:id" element={
                <PublicationDetails />
            } />
            
            <Route path="/domains" element={
              <PrivateRoute roles={['ADMIN', 'MODERATEUR']}>
                <DomainPage />
              </PrivateRoute>
            } />
            
            <Route path="/domains/:id" element={
              <PrivateRoute roles={['ADMIN', 'MODERATEUR']}>
                <DomainPage />
              </PrivateRoute>
            } />
            
            <Route path="/users" element={
              <PrivateRoute roles={['ADMIN']}>
                <UsersPage />
              </PrivateRoute>
            } />

            <Route path="/users/:id" element={
              <PrivateRoute roles={['ADMIN']}>
                <UsersDetails />
              </PrivateRoute>

            } />
            
            <Route path="/profile" element={
              <PrivateRoute>
                <Profile />
              </PrivateRoute>
            } />
            
            <Route path="/404" element={<NotFound />} />
            <Route path="*" element={<Navigate to="/404" />} />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;