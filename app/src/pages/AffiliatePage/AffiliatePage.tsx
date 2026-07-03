import React from 'react';
import { useProfileQuery } from '../../api/users/user.queries';

import GiftIcon from '../../assets/icons/gift.svg';

import './AffiliatePage.css';

export const AffiliatePage: React.FC = () => {
  const { data: profile } = useProfileQuery();

  const userId = profile?.id ?? '123456789';
  const botUser = 'EvgenyMuhomorBot';
  const refLink = `https://t.me/${botUser}?start=ref_${userId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(refLink).then(() => {
      const tg = (window as any).Telegram?.WebApp;
      if (tg) {
        tg.showAlert('Реферальная ссылка скопирована!');
      } else {
        alert('Реферальная ссылка скопирована!');
      }
    });
  };

  const getFormattedBalance = () => {
    const balance = profile?.bonusBalance ?? 0;
    const currency = profile?.currency ?? 'IDR';
    if (currency === 'IDR') {
      return `Rp ${balance.toLocaleString()}`;
    } else if (currency === 'VND') {
      return `${balance.toLocaleString()} ₫`;
    } else if (currency === 'RUB') {
      return `${balance.toLocaleString()} ₽`;
    } else {
      return `${balance} USDT`;
    }
  };

  return (
    <div className="affiliate-container">
      <h1 className="affiliate-header">
        <GiftIcon style={{ width: 24, height: 24, stroke: 'var(--primary-color)' }} />
        <span>Партнерская программа</span>
      </h1>

      {/* Bonus Balance Card */}
      <div className="balance-card">
        <span className="balance-title">Ваш бонусный баланс</span>
        <span className="balance-value">{getFormattedBalance()}</span>
      </div>

      {/* Instructions */}
      <div className="affiliate-info-box">
        <h3 className="info-title">Как это работает?</h3>
        <div className="ref-steps">
          <div className="step-item">
            <span className="step-num">1</span>
            <span>Скопируйте свою уникальную реферальную ссылку ниже и отправьте ее друзьям.</span>
          </div>
          <div className="step-item">
            <span className="step-num">2</span>
            <span>Когда ваши друзья перейдут по ней, они зарегистрируются в нашей лавке.</span>
          </div>
          <div className="step-item">
            <span className="step-num">3</span>
            <span>Вы получите <b>10%</b> от суммы каждого оплаченного ими заказа на свой баланс! Бонусы можно списать при заказе любых грибов.</span>
          </div>
        </div>

        {/* Ref Link copy box */}
        <div className="ref-link-section">
          <label className="settings-label" style={{ fontSize: '11px' }}>Ваша ссылка для приглашения</label>
          <div className="ref-link-input-wrapper">
            <div className="ref-link-text">{refLink}</div>
            <button className="copy-ref-btn" onClick={handleCopyLink}>
              Копировать
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-section">
        <h3 className="stats-title">Ваша статистика</h3>
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-label">Друзей приглашено</div>
            <div className="stat-num" style={{ color: 'var(--primary-color)' }}>
              {/* If we have referral relations we could count, otherwise mock/estimate or placeholder */}
              0
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-label">Всего заработано</div>
            <div className="stat-num" style={{ color: 'var(--secondary-color)' }}>
              {getFormattedBalance()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliatePage;
