import React, { useState, useEffect } from 'react';
import { useProfileQuery } from '../../api/users/user.queries';
import { useUpdateProfileMutation } from '../../api/users/user.mutations';
import { useMyOrdersQuery } from '../../api/orders/order.queries';

import './ProfilePage.css';

export const ProfilePage: React.FC = () => {
  const { data: profile } = useProfileQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const { data: orders = [], isLoading: ordersLoading } = useMyOrdersQuery();

  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (profile?.address) {
      setAddress(profile.address);
    }
  }, []);

  const handleRegionChange = (region: string) => {
    const currency = region === 'Bali' ? 'IDR' : 'VND';
    updateProfileMutation.mutate({ region, currency });
  };

  const handleCurrencyChange = (currency: string) => {
    updateProfileMutation.mutate({ currency });
  };

  const handleSaveAddress = () => {
    updateProfileMutation.mutate(
      { address },
      {
        onSuccess: () => {
          alert('Адрес успешно сохранен!');
        },
      }
    );
  };

  const getInitials = () => {
    const name = profile?.firstName || profile?.username || 'U';
    return name.slice(0, 1).toUpperCase();
  };

  const getPriceText = (price: number, currency: string) => {
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

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      Pending: 'В обработке ⏳',
      Paid: 'Оплачен ✅',
      Shipped: 'Доставляется 🚚',
      Cancelled: 'Отменен ❌',
    };
    return statusMap[status] ?? status;
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="avatar-fallback">{getInitials()}</div>
        <div className="profile-info">
          <h2 className="profile-name">
            {profile?.firstName} {profile?.lastName}
          </h2>
          <span className="profile-tag">@{profile?.username || 'нет_username'}</span>
        </div>
      </div>

      {/* Settings Block */}
      <div className="settings-block">
        <div className="settings-group">
          <label className="settings-label">Регион</label>
          <div className="settings-choices">
            <button
              className={`choice-btn ${profile?.region === 'Bali' ? 'active' : ''}`}
              onClick={() => handleRegionChange('Bali')}>
              Бали 🌴
            </button>
            <button
              className={`choice-btn ${profile?.region === 'Vietnam' ? 'active' : ''}`}
              onClick={() => handleRegionChange('Vietnam')}>
              Вьетнам 🇻🇳
            </button>
          </div>
        </div>

        <div className="settings-group">
          <label className="settings-label">Валюта каталога</label>
          <div className="settings-choices">
            {['IDR', 'VND', 'USDT', 'RUB'].map((curr) => (
              <button
                key={curr}
                className={`choice-btn ${profile?.currency === curr ? 'active' : ''}`}
                onClick={() => handleCurrencyChange(curr)}>
                {curr}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Address Form */}
      <div className="address-form">
        <div className="address-title-row">
          <span>📍</span>
          <span>Адрес доставки</span>
        </div>
        <p className="address-desc">
          Укажите адрес доставки. Он будет автоматически подставляться при оформлении заказа.
        </p>
        <textarea
          className="address-textarea"
          placeholder="Например: 666136 Иркутская область, Мыс Рытый, д.1"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <button
          className="save-btn"
          onClick={handleSaveAddress}
          disabled={updateProfileMutation.isPending || address === profile?.address}>
          {updateProfileMutation.isPending ? 'Сохранение...' : 'Сохранить адрес'}
        </button>
      </div>

      {/* Order History */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '12px' }}>
          📦 История заказов
        </h3>
        {ordersLoading ? (
          <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
            Загрузка истории...
          </div>
        ) : orders.length === 0 ? (
          <div
            style={{
              color: 'var(--color-text-muted)',
              fontSize: '13px',
              textAlign: 'center',
              padding: '20px',
            }}>
            У вас пока нет заказов.
          </div>
        ) : (
          <div className="orders-history">
            {orders.map((order) => (
              <div className="order-history-card" key={order.id}>
                <div className="order-history-header">
                  <span className="order-number">Заказ #{order.id.slice(0, 8)}</span>
                  <span className={`order-status ${order.status}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <div className="order-history-items">
                  {order.items.map((item: any, idx: number) => (
                    <div key={idx}>
                      • {item.name} ({item.size}) x{item.quantity}
                    </div>
                  ))}
                </div>
                <div className="order-history-footer">
                  <span style={{ color: 'var(--subtitle-text-color)', fontWeight: 'normal' }}>
                    Сумма:
                  </span>
                  <span>{getPriceText(order.totalAmount, order.currency)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
