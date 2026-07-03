import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCartCount } from '../../../store/reducers/cart';
import { useProfileQuery } from '../../../api/users';

import HomeIcon from '../../../assets/icons/home.svg';
import MushroomIcon from '../../../assets/icons/mushroom.svg';
import BasketIcon from '../../../assets/icons/basket.svg';
import ProfileIcon from '../../../assets/icons/profile.svg';
import SettingsIcon from '../../../assets/icons/settings.svg';

import './Layout.css';

export const Layout: React.FC = () => {
  const location = useLocation();
  const cartCount = useSelector(selectCartCount);
  const { data: profile } = useProfileQuery();

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/ai-survey');
    }
    return location.pathname.startsWith(path);
  };

  const showAdminTab = profile?.role === 1;
  return (
    <div className="layout-container">
      <div className="layout-content">
        <Outlet />
      </div>

      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${isActive('/') ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <HomeIcon className="nav-icon" />
          </div>
          <span>Главная</span>
        </Link>

        <Link to="/catalog" className={`nav-item ${isActive('/catalog') ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <MushroomIcon className="nav-icon" />
          </div>
          <span>Каталог</span>
        </Link>

        <Link to="/cart" className={`nav-item ${isActive('/cart') ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <BasketIcon className="nav-icon" />
            {cartCount > 0 && <div className="nav-badge">{cartCount}</div>}
          </div>
          <span>Корзина</span>
        </Link>

        <Link to="/profile" className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
          <div className="nav-icon-wrapper">
            <ProfileIcon className="nav-icon" />
          </div>
          <span>Профиль</span>
        </Link>

        {showAdminTab && (
          <Link to="/admin" className={`nav-item ${isActive('/admin') ? 'active' : ''}`}>
            <div className="nav-icon-wrapper">
              <SettingsIcon className="nav-icon" />
            </div>
            <span>Админка</span>
          </Link>
        )}
      </nav>
    </div>
  );
};

export default Layout;
