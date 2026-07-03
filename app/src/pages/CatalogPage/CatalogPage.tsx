import React, { useState, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { cartActions } from '../../store/reducers/cart';
import { useProductsQuery } from '../../api/products/product.queries';
import { useProfileQuery } from '../../api/users/user.queries';
import type { IProduct } from '../../types';

import './CatalogPage.css';

const CATEGORY_MAP: Record<string, string> = {
  all: 'Все',
  fly_agaric: '🍄 Мухоморы',
  panther: '🐆 Пантерные',
  regular: '🌿 Обычные грибы',
  tincture: '💧 Настойки',
  set: '🎁 Наборы',
};

export const CatalogPage: React.FC = () => {
  const dispatch = useDispatch();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const { data: profile } = useProfileQuery();
  const { data: products = [], isLoading } = useProductsQuery();

  const handleAdd = (product: IProduct) => {
    dispatch(cartActions.addToCart(product));

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

  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return products;
    return products.filter((p) => p.category === selectedCategory);
  }, [products, selectedCategory]);

  return (
    <div className="catalog-container">
      <h1 className="catalog-header">📦 Каталог</h1>

      {/* Category Selection Chips */}
      <div className="category-chips">
        {Object.entries(CATEGORY_MAP).map(([key, name]) => (
          <button
            key={key}
            className={`chip ${selectedCategory === key ? 'active' : ''}`}
            onClick={() => setSelectedCategory(key)}
          >
            {name}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '40px' }}>
          Загрузка каталога...
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="empty-catalog">
          <span>🍄</span>
          <span>В данной категории пока нет товаров.</span>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div className="product-card" key={product.id}>
              <div className="product-img-wrapper">
                <img className="product-img" src={product.imageUrl} alt={product.name} />
                <span className="product-size-badge">{product.size}</span>
              </div>
              <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-desc">{product.description}</p>
              </div>
              <div className="product-footer">
                <span className="product-price">{getPriceText(product)}</span>
                <button className="product-add-btn" onClick={() => handleAdd(product)}>
                  В корзину
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;
