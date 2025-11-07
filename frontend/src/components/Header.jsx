import { NavLink } from 'react-router-dom';
import styles from './Header.module.css';
import { useAuth } from '../context/AuthContext';

export default function Header() {
  const { user, logout } = useAuth();
  return (
    <header className={styles.header}>
      <div className={styles.brand}>ShopEase</div>
      <nav className={styles.nav}>
        <NavLink to="/" className={({ isActive }) => isActive ? styles.active : undefined}>Home</NavLink>
        <NavLink to="/products" className={({ isActive }) => isActive ? styles.active : undefined}>Products</NavLink>
        <NavLink to="/cart" className={({ isActive }) => isActive ? styles.active : undefined}>Cart</NavLink>
        <NavLink to="/checkout" className={({ isActive }) => isActive ? styles.active : undefined}>Checkout</NavLink>
        {!user && (
          <NavLink to="/auth" className={({ isActive }) => isActive ? styles.active : undefined}>Sign In</NavLink>
        )}
        {user && (
          <>
            {user.role === 'admin' && (
              <NavLink to="/admin" className={({ isActive }) => isActive ? styles.active : undefined}>Admin</NavLink>
            )}
            <span style={{ color: '#6b7280' }}>{user.email}</span>
            <button onClick={logout} className={styles.linkButton}>Logout</button>
          </>
        )}
      </nav>
    </header>
  );
}
