import { Link, NavLink, useNavigate } from 'react-router-dom';
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
      <nav className={styles.nav}>
        <Link to="/" className={styles.navLogo}>
          TweetXTube
        </Link>

        <div className={styles.navSearch}>
          <input
            type="text"
            className={styles.navSearchInput}
            placeholder="Search videos…"
            aria-label="Search"
          />
          <button type="button" className={styles.navSearchBtn} aria-label="Search">
            🔍
          </button>
        </div>

        <div className={styles.navLinks}>
          <NavLink to="/" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`} end>
            Home
          </NavLink>
          <NavLink to="/tweets" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
            Tweets
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to="/upload" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                Upload
              </NavLink>
              <NavLink to="/dashboard" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                Dashboard
              </NavLink>
              <NavLink
                to={`/profile/${user?.username ?? ''}`}
                className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              >
                Profile
              </NavLink>
              <button type="button" onClick={handleLogout} className={`${styles.navLink} ${styles.logout}`}>
                Logout
              </button>
              <Link
                to={`/profile/${user?.username ?? ''}`}
                className={styles.navAvatar}
                title={user?.username}
              >
                {user?.avatar ? (
                  <img src={user.avatar} alt="" />
                ) : (
                  (user?.username?.[0] ?? user?.fullName?.[0] ?? '?').toUpperCase()
                )}
              </Link>
            </>
          ) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                Login
              </NavLink>
              <NavLink to="/register" className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </nav>

      <main className={styles.main}>
        {/* Ambient layer */}
        <div className="app-ambient" aria-hidden="true">
          <div className="app-blob app-blob-1" />
          <div className="app-blob app-blob-2" />
          <div className="app-blob app-blob-3" />
        </div>
        <div className="app-grid-bg" aria-hidden="true" />
        {children}
      </main>
    </div>
  );
}
