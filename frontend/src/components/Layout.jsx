import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Layout.module.css';

export function Layout({ children }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <Link to="/" className={styles.logo}>Vtube</Link>
        <nav className={styles.nav}>
          <Link to="/">Home</Link>
          <Link to="/tweets">Tweets</Link>
          {isAuthenticated ? (
            <>
              <Link to="/upload">Upload</Link>
              <Link to="/dashboard">Dashboard</Link>
              <Link to={`/profile/${user?.username}`}>Profile</Link>
              <button onClick={handleLogout} className={styles.btnLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register" className={styles.btnRegister}>Register</Link>
            </>
          )}
        </nav>
      </header>
      <main className={styles.main}>{children}</main>
    </div>
  );
}
