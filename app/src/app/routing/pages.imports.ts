import React from 'react';

const NotFoundPage = React.lazy(() => import('../../pages/NotFoundPage/NotFoundPage.tsx'));
const HomePage = React.lazy(() => import('../../pages/HomePage/HomePage.tsx'));
const CatalogPage = React.lazy(() => import('../../pages/CatalogPage/CatalogPage.tsx'));
const CartPage = React.lazy(() => import('../../pages/CartPage/CartPage.tsx'));
const ProfilePage = React.lazy(() => import('../../pages/ProfilePage/ProfilePage.tsx'));
const AISurveyPage = React.lazy(() => import('../../pages/AISurveyPage/AISurveyPage.tsx'));
const AffiliatePage = React.lazy(() => import('../../pages/AffiliatePage/AffiliatePage.tsx'));
const AdminPanel = React.lazy(() => import('../../pages/AdminPanel/AdminPanel.tsx'));

export {
  NotFoundPage,
  HomePage,
  CatalogPage,
  CartPage,
  ProfilePage,
  AISurveyPage,
  AffiliatePage,
  AdminPanel
};
