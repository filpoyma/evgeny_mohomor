import React, { useState } from 'react';
import { useProductsQuery } from '../../api/products/product.queries';
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} from '../../api/products/product.mutations';
import { useAdminOrdersQuery } from '../../api/orders/order.queries';
import { useUpdateOrderStatusMutation } from '../../api/orders/order.mutations';
import { useAdminUsersQuery } from '../../api/users/user.queries';
import { useAdjustBalanceMutation } from '../../api/users/user.mutations';
import type { IProduct } from '../../types';

import './AdminPanel.css';

type AdminTab = 'analytics' | 'products' | 'orders' | 'users';

export const AdminPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('analytics');

  // Queries
  const { data: products = [] } = useProductsQuery();
  const { data: allOrders = [] } = useAdminOrdersQuery(activeTab === 'analytics' || activeTab === 'orders');
  const { data: allUsers = [] } = useAdminUsersQuery(activeTab === 'analytics' || activeTab === 'users');

  // Mutations
  const createProductMutation = useCreateProductMutation();
  const updateProductMutation = useUpdateProductMutation();
  const deleteProductMutation = useDeleteProductMutation();
  const updateStatusMutation = useUpdateOrderStatusMutation();
  const adjustBalanceMutation = useAdjustBalanceMutation();

  // Product Form states
  const [formMode, setFormMode] = useState<'list' | 'add' | 'edit'>('list');
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodCat, setProdCat] = useState('fly_agaric');
  const [prodSize, setProdSize] = useState('50г');
  const [prodImg, setProdImg] = useState('');
  const [prodStock, setProdStock] = useState<number>(100);
  const [priceIdr, setPriceIdr] = useState<number>(0);
  const [priceVnd, setPriceVnd] = useState<number>(0);
  const [priceUsdt, setPriceUsdt] = useState<number>(0);
  const [priceRub, setPriceRub] = useState<number>(0);

  // User balance adjustments state
  const [balanceAdjustments, setBalanceAdjustments] = useState<Record<string, number>>({});

  const handleEditClick = (product: IProduct) => {
    setSelectedProduct(product);
    setProdName(product.name);
    setProdDesc(product.description);
    setProdCat(product.category);
    setProdSize(product.size);
    setProdImg(product.imageUrl);
    setProdStock(product.stock);
    setPriceIdr(product.priceIdr);
    setPriceVnd(product.priceVnd);
    setPriceUsdt(product.priceUsdt);
    setPriceRub(product.priceRub);
    setFormMode('edit');
  };

  const handleAddClick = () => {
    setSelectedProduct(null);
    setProdName('');
    setProdDesc('');
    setProdCat('fly_agaric');
    setProdSize('50г');
    setProdImg('');
    setProdStock(100);
    setPriceIdr(200000);
    setPriceVnd(300000);
    setPriceUsdt(15);
    setPriceRub(1200);
    setFormMode('add');
  };

  const handleFormCancel = () => {
    setFormMode('list');
    setSelectedProduct(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const productPayload = {
      name: prodName,
      description: prodDesc,
      category: prodCat,
      size: prodSize,
      imageUrl: prodImg || 'https://images.unsplash.com/photo-1590004953392-5aba2e72269a?q=80&w=300&auto=format&fit=crop',
      stock: Number(prodStock),
      priceIdr: Number(priceIdr),
      priceVnd: Number(priceVnd),
      priceUsdt: Number(priceUsdt),
      priceRub: Number(priceRub),
    };

    if (formMode === 'add') {
      createProductMutation.mutate(productPayload, {
        onSuccess: () => {
          setFormMode('list');
        },
      });
    } else if (formMode === 'edit' && selectedProduct) {
      updateProductMutation.mutate(
        { id: selectedProduct.id, data: productPayload },
        {
          onSuccess: () => {
            setFormMode('list');
            setSelectedProduct(null);
          },
        }
      );
    }
  };

  const handleDeleteProduct = (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteProductMutation.mutate(id);
    }
  };

  const handleStatusChange = (orderId: string, newStatus: string) => {
    updateStatusMutation.mutate({ id: orderId, status: newStatus });
  };

  const handleAdjustBalance = (userId: string) => {
    const amount = balanceAdjustments[userId] || 0;
    if (amount === 0) return;

    adjustBalanceMutation.mutate(
      { id: userId, amount },
      {
        onSuccess: () => {
          alert('Баланс успешно изменен!');
          setBalanceAdjustments({ ...balanceAdjustments, [userId]: 0 });
        },
      }
    );
  };

  // Analytics helper calculations
  const calculateTotalSales = () => {
    const successfulStatuses = ['Paid', 'Shipped'];
    const completedOrders = allOrders.filter((o) => successfulStatuses.includes(o.status));

    // Sum by currency
    const sums: Record<string, number> = { IDR: 0, VND: 0, USDT: 0, RUB: 0 };
    completedOrders.forEach((o) => {
      if (sums[o.currency] !== undefined) {
        sums[o.currency] += o.totalAmount;
      }
    });

    return sums;
  };

  const getPriceTextForAdmin = (price: number, currency: string) => {
    if (currency === 'IDR') {
      return `Rp ${price.toLocaleString()}`;
    } else if (currency === 'VND') {
      return `${price.toLocaleString()} ₫`;
    } else if (currency === 'RUB') {
      return `${price.toLocaleString()} ₽`;
    } else {
      return `${price} USDT`;
    }
  };

  const sales = calculateTotalSales();

  return (
    <div className="admin-container">
      <h1 className="admin-header">🛠️ Панель управления</h1>

      {/* Admin Tab buttons */}
      <div className="admin-tabs">
        <button
          className={`admin-tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Аналитика
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          Товары
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
          onClick={() => setActiveTab('orders')}
        >
          Заказы
        </button>
        <button
          className={`admin-tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          Пользователи
        </button>
      </div>

      {/* Tab Content: Analytics */}
      {activeTab === 'analytics' && (
        <div className="stats-cards">
          <div className="admin-stat-card stat-card-large">
            <span className="admin-stat-label">Продажи по валютам</span>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              <div>🇮🇩 Рупии: <b>Rp {sales.IDR.toLocaleString()}</b></div>
              <div>🇻🇳 Донги: <b>{sales.VND.toLocaleString()} ₫</b></div>
              <div>🇷🇺 Рубли: <b>{sales.RUB.toLocaleString()} ₽</b></div>
              <div>💵 Крипто: <b>{sales.USDT} USDT</b></div>
            </div>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Всего заказов</span>
            <span className="admin-stat-val" style={{ color: 'var(--primary-color)' }}>
              {allOrders.length}
            </span>
          </div>

          <div className="admin-stat-card">
            <span className="admin-stat-label">Покупателей</span>
            <span className="admin-stat-val" style={{ color: 'var(--secondary-color)' }}>
              {allUsers.length}
            </span>
          </div>
        </div>
      )}

      {/* Tab Content: Products Manager */}
      {activeTab === 'products' && (
        <>
          {formMode === 'list' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="admin-actions-bar">
                <button className="admin-add-btn" onClick={handleAddClick}>
                  + Добавить товар
                </button>
              </div>

              <div className="admin-list-wrapper">
                {products.map((p) => (
                  <div className="admin-product-card" key={p.id}>
                    <img className="admin-prod-img" src={p.imageUrl} alt={p.name} />
                    <div className="admin-prod-info">
                      <h4 className="admin-prod-name">{p.name}</h4>
                      <span className="admin-prod-meta">
                        Категория: {p.category} | Фасовка: {p.size} | В наличии: {p.stock}
                      </span>
                    </div>
                    <div className="admin-card-actions">
                      <button className="action-icon-btn" onClick={() => handleEditClick(p)}>
                        ✏️
                      </button>
                      <button
                        className="action-icon-btn"
                        style={{ borderColor: 'rgba(198, 40, 40, 0.3)', color: 'var(--color-error)' }}
                        onClick={() => handleDeleteProduct(p.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Product Add/Edit Form */
            <form className="admin-form-container" onSubmit={handleFormSubmit}>
              <h3 className="form-title">{formMode === 'add' ? 'Добавление товара' : 'Редактирование товара'}</h3>

              <div className="form-group">
                <label className="form-label">Название</label>
                <input
                  type="text"
                  className="form-input"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Описание</label>
                <textarea
                  className="form-input"
                  style={{ minHeight: '60px', resize: 'none' }}
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                  required
                />
              </div>

              <div className="price-inputs-grid">
                <div className="form-group">
                  <label className="form-label">Категория</label>
                  <select className="form-select" value={prodCat} onChange={(e) => setProdCat(e.target.value)}>
                    <option value="fly_agaric">Мухоморы (красные)</option>
                    <option value="panther">Пантерные</option>
                    <option value="regular">Обычные грибы</option>
                    <option value="tincture">Настойки</option>
                    <option value="set">Наборы</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Размер / Объем</label>
                  <input
                    type="text"
                    className="form-input"
                    value={prodSize}
                    onChange={(e) => setProdSize(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="price-inputs-grid">
                <div className="form-group">
                  <label className="form-label">Количество на складе</label>
                  <input
                    type="number"
                    className="form-input"
                    value={prodStock}
                    onChange={(e) => setProdStock(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Ссылка на изображение</label>
                  <input type="text" className="form-input" value={prodImg} onChange={(e) => setProdImg(e.target.value)} />
                </div>
              </div>

              {/* Price setup */}
              <div className="price-inputs-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                <div className="form-group">
                  <label className="form-label">Цена в рупиях (Бали) (Rp)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={priceIdr}
                    onChange={(e) => setPriceIdr(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Цена в донгах (Вьетнам) (₫)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={priceVnd}
                    onChange={(e) => setPriceVnd(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Цена в USDT</label>
                  <input
                    type="number"
                    className="form-input"
                    value={priceUsdt}
                    onChange={(e) => setPriceUsdt(Number(e.target.value))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Цена в рублях (₽)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={priceRub}
                    onChange={(e) => setPriceRub(Number(e.target.value))}
                    required
                  />
                </div>
              </div>

              <div className="admin-form-actions">
                <button type="submit" className="form-submit-btn">
                  Сохранить
                </button>
                <button type="button" className="form-cancel-btn" onClick={handleFormCancel}>
                  Отмена
                </button>
              </div>
            </form>
          )}
        </>
      )}

      {/* Tab Content: Orders Manager */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allOrders.length === 0 ? (
            <div style={{ color: 'var(--color-text-muted)', textAlign: 'center', padding: '20px' }}>
              Заказов пока нет.
            </div>
          ) : (
            allOrders.map((order) => (
              <div className="admin-order-card" key={order.id}>
                <div className="order-history-header">
                  <span className="order-number">Заказ #{order.id.slice(0, 8)}</span>
                  <span className="order-number" style={{ color: 'var(--secondary-color)' }}>
                    {getPriceTextForAdmin(order.totalAmount, order.currency)}
                  </span>
                </div>
                <div className="admin-order-meta-info">
                  <div>Покупатель ID: <code>{order.userId}</code></div>
                  <div>Адрес: {order.address}</div>
                  <div>Телефон: {order.phone}</div>
                  <div style={{ marginTop: '4px', fontWeight: '600', color: 'var(--text-color)' }}>Товары:</div>
                  {(order.items as any[]).map((item, idx) => (
                    <div key={idx} style={{ paddingLeft: '8px' }}>
                      - {item.name} ({item.size}) x{item.quantity}
                    </div>
                  ))}
                </div>

                <div className="status-change-group">
                  <span className="form-label" style={{ margin: 0 }}>Статус заказа</span>
                  <select
                    className="admin-status-select"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="Pending">В обработке</option>
                    <option value="Paid">Оплачен</option>
                    <option value="Shipped">Доставляется</option>
                    <option value="Cancelled">Отменен</option>
                  </select>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab Content: Users Manager */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {allUsers.map((user) => (
            <div className="admin-user-card" key={user.id}>
              <div className="user-main-info">
                <div className="user-name-tag">
                  <span className="user-title-text">
                    {user.firstName} {user.lastName}
                  </span>
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                    @{user.username || 'нет_username'} (ID: <code>{user.id}</code>)
                  </span>
                </div>
                <span className="user-bonus-pill">
                  Баланс: {getPriceTextForAdmin(user.bonusBalance, user.currency)}
                </span>
              </div>
              <div className="adjust-balance-row">
                <input
                  type="number"
                  className="adjust-input"
                  placeholder="Сумма изменения (+/-)"
                  value={balanceAdjustments[user.id] || ''}
                  onChange={(e) =>
                    setBalanceAdjustments({ ...balanceAdjustments, [user.id]: Number(e.target.value) })
                  }
                />
                <button className="adjust-btn" onClick={() => handleAdjustBalance(user.id)}>
                  Изменить баланс
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
