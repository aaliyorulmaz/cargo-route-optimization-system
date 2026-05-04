import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { useContext } from 'react';

import './App.css';

import KullaniciPanel from './pages/KullaniciPanel';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider, AuthContext } from './context/AuthContext';





const PrivateRoute = ({ children, role }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <div>Yükleniyor...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (role && user.role !== role) {
    
    return <Navigate to="/" replace />;
  }

  return children;
};


const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <div className="navbar">
      <h1>Kargo İşletme Sistemi</h1>
      <div className="links">
        {user ? (
          <>
            {user.role === 'admin' && <Link to="/admin">Yönetici Paneli</Link>}
            {user.role === 'user' && <Link to="/user">Kullanıcı Paneli</Link>}
            <span style={{ marginLeft: '20px', fontSize: '0.9rem', color: '#bdc3c7' }}>
              Merhaba, {user.username || user.role}
            </span>
            <a href="#" onClick={logout} style={{ background: '#c0392b' }}>Çıkış Yap</a>
          </>
        ) : (
          <>
            <Link to="/login">Giriş Yap</Link>
            <Link to="/register">Kayıt Ol</Link>
          </>
        )}
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <div className="container">
        <Navbar />
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/user" element={
              <PrivateRoute role="user">
                <KullaniciPanel />
              </PrivateRoute>
            } />

            <Route path="/admin" element={
              <PrivateRoute role="admin">
                <AdminPanel />
              </PrivateRoute>
            } />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
}

export default App;
