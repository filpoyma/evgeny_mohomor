import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { cartActions } from '../../store/reducers/cart';
import { useProductsQuery } from '../../api/products';
import { useArticlesQuery } from '../../api/chat';
import { useProfileQuery } from '../../api/users';
//import { useUpdateProfileMutation } from '../../api/users';
import type { IProduct, IArticle } from '../../types';

import LightbulbIcon from '../../assets/icons/lightbulb.svg';
import GiftIcon from '../../assets/icons/gift.svg';
import BookIcon from '../../assets/icons/book.svg';

import './HomePage.css';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [lang, setLang] = useState<'RU' | 'EN'>('RU');
  const [activeArticle, setActiveArticle] = useState<IArticle | null>(null);

  // Queries
  const { data: profile } = useProfileQuery();
  const { data: products = [], isLoading: productsLoading } = useProductsQuery();
  const { data: articles = [], isLoading: articlesLoading } = useArticlesQuery();

  // Mutations
  // const updateProfileMutation = useUpdateProfileMutation();

  // const handleRegionChange = (newRegion: 'Bali' | 'Vietnam') => {
  //   const currency = newRegion === 'Bali' ? 'IDR' : 'VND';
  //   updateProfileMutation.mutate({ region: newRegion, currency });
  // };

  const addToCart = (product: IProduct) => {
    dispatch(cartActions.addToCart(product));
    // Trigger vibration if inside Telegram
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.HapticFeedback) {
      tg.HapticFeedback.notificationOccurred('success');
    }
  };

  const getPriceText = (product: IProduct) => {
    const currency = profile?.currency ?? 'IDR';
    if (currency === 'IDR') {
      return `Rp ${product.priceIdr.toLocaleString()}`;
    } else if (currency === 'VND') {
      return `${product.priceVnd.toLocaleString()} ₫`;
    } else if (currency === 'RUB') {
      return `${product.priceRub.toLocaleString()} ₽`;
    } else {
      return `${product.priceUsdt} USDT`;
    }
  };

  // Translations
  const t = {
    RU: {
      aiSelector: 'AI Подбор Продуктов',
      aiSelectorDesc:
        'Пройдите интеллектуальный опрос и получите персональные рекомендации по микродозингу и схемам приема.',
      aiSelectorBtn: 'Пройти опрос',
      locationTitle: 'Выберите локацию',
      novelties: 'Новинки',
      seeAll: 'Все товары →',
      materials: 'Полезные материалы',
      refTitle: 'Партнерская программа',
      refDesc: 'Приглашай друзей — получай 10% от их заказов на бонусный баланс!',
      refBtn: 'Получить ссылку',
      readTime: 'читать',
      loading: 'Загрузка...',
    },
    EN: {
      aiSelector: 'AI Product Finder',
      aiSelectorDesc:
        'Take our smart quiz to get personalized recommendations for microdosing and regimens.',
      aiSelectorBtn: 'Take Quiz',
      locationTitle: 'Select Location',
      novelties: 'New Products',
      seeAll: 'All products →',
      materials: 'Useful Materials',
      refTitle: 'Affiliate Program',
      refDesc: 'Invite friends — earn 10% from their orders to your bonus balance!',
      refBtn: 'Get Link',
      readTime: 'read',
      loading: 'Loading...',
    },
  }[lang];

  return (
    <div className="home-container">
      {/* Header */}
      <div className="home-header">
        <h1 className="brand-title">
          <span>Mushrooms World</span>🍄
        </h1>
        <div className="lang-selector">
          <button
            className={`lang-btn ${lang === 'RU' ? 'active' : ''}`}
            onClick={() => setLang('RU')}>
            RU
          </button>
          <button
            className={`lang-btn ${lang === 'EN' ? 'active' : ''}`}
            onClick={() => setLang('EN')}>
            EN
          </button>
        </div>
      </div>

      {/* Location selector */}
      {/*<div className="location-box">*/}
      {/*  <div className="location-title">*/}
      {/*    <span>📍</span>*/}
      {/*    <span>{t.locationTitle}</span>*/}
      {/*  </div>*/}
      {/*  <div className="location-buttons">*/}
      {/*    <button*/}
      {/*      className={`location-btn ${profile?.region === 'Bali' ? 'active' : ''}`}*/}
      {/*      onClick={() => handleRegionChange('Bali')}>*/}
      {/*      Бали 🌴*/}
      {/*    </button>*/}
      {/*    <button*/}
      {/*      className={`location-btn ${profile?.region === 'Vietnam' ? 'active' : ''}`}*/}
      {/*      onClick={() => handleRegionChange('Vietnam')}>*/}
      {/*      Вьетнам 🇻🇳*/}
      {/*    </button>*/}
      {/*  </div>*/}
      {/*</div>*/}



      {/* Novelties section */}
      <div>
        <div className="section-header">
          <div className="section-title">
            <span>✨</span>
            <span>{t.novelties}</span>
          </div>
          <span className="see-all" onClick={() => navigate('/catalog')}>
            {t.seeAll}
          </span>
        </div>
        {productsLoading ? (
          <div style={{ color: 'var(--color-text-muted)' }}>{t.loading}</div>
        ) : (
          <div className="novelty-scroll">
            {products.slice(0, 4).map((product) => (
              <div className="novelty-card" key={product.id}>
                <img className="novelty-img" src={product.imageUrl} alt={product.name} />
                <h3 className="novelty-name">{product.name}</h3>
                <div className="novelty-footer">
                  <span className="novelty-price">{getPriceText(product)}</span>
                  <button className="novelty-add-btn" onClick={() => addToCart(product)}>
                    +
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* AI Selector block */}
      <div className="ai-selection-box">
        <div className="ai-icon-pulse">
          <LightbulbIcon className="ai-icon" />
        </div>
        <h2 className="ai-title">{t.aiSelector}</h2>
        <p className="ai-desc">{t.aiSelectorDesc}</p>
        <button className="ai-btn" onClick={() => navigate('/ai-survey')}>
          ⚡ {t.aiSelectorBtn}
        </button>
      </div>

      {/* Referral Program */}
      <div className="referral-banner" onClick={() => navigate('/affiliate')}>
        <div className="ref-icon-wrapper">
          <GiftIcon className="ref-icon" />
        </div>
        <div className="ref-content">
          <h3 className="ref-title">{t.refTitle}</h3>
          <p className="ref-desc">{t.refDesc}</p>
        </div>
      </div>

      {/* Useful materials (blog) */}
      <div>
        <div className="section-header">
          <div className="section-title">
            <span>📚</span>
            <span>{t.materials}</span>
          </div>
        </div>
        {articlesLoading ? (
          <div style={{ color: 'var(--color-text-muted)' }}>{t.loading}</div>
        ) : (
          <div className="articles-list">
            {articles.map((article) => (
              <div
                className="article-card"
                key={article.id}
                onClick={() => setActiveArticle(article)}>
                <img className="article-img" src={article.imageUrl} alt={article.title} />
                <div className="article-info">
                  <h3 className="article-title">{article.title}</h3>
                  <div className="article-meta">
                    <BookIcon style={{ width: 12, height: 12 }} />
                    <span>{article.readTime}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="modal-overlay" onClick={() => setActiveArticle(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setActiveArticle(null)}>
              ×
            </button>
            <img
              className="modal-header-img"
              src={activeArticle.imageUrl}
              alt={activeArticle.title}
            />
            <div className="modal-body">
              <h2 className="modal-title">{activeArticle.title}</h2>
              <div className="article-meta" style={{ marginBottom: 12 }}>
                <BookIcon style={{ width: 12, height: 12 }} />
                <span>
                  {activeArticle.readTime} {t.readTime}
                </span>
              </div>
              <p className="modal-text">{activeArticle.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;
