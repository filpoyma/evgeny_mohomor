import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from '../../shared/components/Layout/Layout.tsx';
import {
  NotFoundPage,
  HomePage,
  CatalogPage,
  CartPage,
  ProfilePage,
  AISurveyPage,
  AffiliatePage,
  AdminPanel,
} from './pages.imports.ts';

const AppNavigation: React.FC = () => {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'flex', height: '100vh', justifyContent: 'center', alignItems: 'center', color: 'var(--primary-color)' }}>
          🍄 Загрузка...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="catalog" element={<CatalogPage />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="profile" element={<ProfilePage />} />
          <Route path="ai-survey" element={<AISurveyPage />} />
          <Route path="affiliate" element={<AffiliatePage />} />
          <Route path="admin" element={<AdminPanel />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppNavigation;
