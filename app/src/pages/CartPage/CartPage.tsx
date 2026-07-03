import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cartActions, selectCartItems, selectCartTotal } from '../../store/reducers/cart';
import { useProfileQuery } from '../../api/users/user.queries';
import { useCreateOrderMutation } from '../../api/orders/order.mutations';

import './CartPage.css';

export const CartPage: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector(selectCartItems);

  // Queries
  const { data: profile } = useProfileQuery();
  const userRegion = profile?.region ?? 'Bali';
  const userCurrency = profile?.currency ?? 'IDR';

  const cartTotal = useSelector((state) => selectCartTotal(state as any, userRegion, userCurrency));

  // Mutations
  const createOrderMutation = useCreateOrderMutation();

  // Form states
  const [address, setAddress] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('Cash');
  const [useReferralBonus, setUseReferralBonus] = useState<boolean>(false);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);

  // Prepopulate address from profile
  useEffect(() => {
    if (profile?.address) {
      setAddress(profile.address);
    }
  }, []);

  const handleDelete = (productId: string) => {
    dispatch(cartActions.removeFromCart(productId));
  };

  const handleQtyChange = (productId: string, quantity: number) => {
    dispatch(cartActions.updateQuantity({ productId, quantity }));
  };

  const getPriceText = (price: number) => {
    if (userCurrency === 'IDR') {
      return `Rp ${price.toLocaleString()}`;
    } else if (userCurrency === 'VND') {
      return `${price.toLocaleString()} ₫`;
    } else if (userCurrency === 'RUB') {
      return `${price.toLocaleString()} ₽`;
    } else {
      return `${price} USDT`;
    }
  };

  const getItemPrice = (product: any) => {
    if (userCurrency === 'IDR') return product.priceIdr;
    if (userCurrency === 'VND') return product.priceVnd;
    if (userCurrency === 'RUB') return product.priceRub;
    return product.priceUsdt;
  };

  const getBonusAmountText = () => {
    const balance = profile?.bonusBalance ?? 0;
    return getPriceText(balance);
  };

  const calculateFinalTotal = () => {
    let total = cartTotal;
    if (useReferralBonus && profile?.bonusBalance) {
      total = Math.max(0, total - profile.bonusBalance);
    }
    return total;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) {
      alert('Укажите адрес доставки');
      return;
    }
    if (!phone.trim()) {
      alert('Укажите контактный телефон');
      return;
    }

    const orderItems = cartItems.map((item) => ({
      productId: item.product.id,
      name: item.product.name,
      size: item.product.size,
      quantity: item.quantity,
      price: getItemPrice(item.product),
      currency: userCurrency,
    }));

    createOrderMutation.mutate(
      {
        items: orderItems,
        totalAmount: cartTotal,
        currency: userCurrency,
        paymentMethod,
        address,
        phone,
        useReferralBonus,
      },
      {
        onSuccess: () => {
          dispatch(cartActions.clearCart());
          setOrderCompleted(true);
          // Haptic Feedback
          const tg = (window as any).Telegram?.WebApp;
          if (tg?.HapticFeedback) {
            tg.HapticFeedback.notificationOccurred('success');
          }
        },
        onError: (err: any) => {
          alert(`Ошибка при оформлении заказа: ${err.message}`);
        },
      }
    );
  };

  if (orderCompleted) {
    return (
      <div className="order-success-screen">
        <div className="success-icon">🍄🎉</div>
        <h2 className="success-title">Заказ принят!</h2>
        <p className="success-desc">
          Мы отправили вам детальное сообщение с подтверждением в чат-бот Telegram. Администратор
          лавки свяжется с вами для согласования деталей доставки.
        </p>
        <button className="success-btn" onClick={() => navigate('/')}>
          На главную
        </button>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="empty-cart">
        <div className="empty-cart-icon">🛒</div>
        <h3>Ваша корзина пуста</h3>
        <p style={{ color: 'var(--subtitle-text-color)', fontSize: '13px' }}>
          Перейдите в каталог, чтобы добавить товары.
        </p>
        <button className="shop-now-btn" onClick={() => navigate('/catalog')}>
          В каталог
        </button>
      </div>
    );
  }

  return (
    <div className="cart-container">
      <h1 className="cart-header">🛒 Корзина</h1>

      {/* Cart Items List */}
      <div className="cart-list">
        {cartItems.map((item) => (
          <div className="cart-card" key={item.product.id}>
            <div className="cart-item-details">
              <h3 className="cart-item-name">{item.product.name}</h3>
              <span className="cart-item-size">Фасовка: {item.product.size}</span>
              <span className="cart-item-price">
                {getPriceText(getItemPrice(item.product) * item.quantity)}
              </span>
            </div>
            <div className="cart-item-actions">
              <div className="quantity-controls">
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(item.product.id, item.quantity - 1)}>
                  -
                </button>
                <span className="qty-num">{item.quantity}</span>
                <button
                  className="qty-btn"
                  onClick={() => handleQtyChange(item.product.id, item.quantity + 1)}>
                  +
                </button>
              </div>
              <button className="delete-btn" onClick={() => handleDelete(item.product.id)}>
                <span style={{ fontSize: '18px' }}>🗑️</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Total Amount Card */}
      <div className="total-box">
        <span>Итого:</span>
        <span className="total-price">{getPriceText(cartTotal)}</span>
      </div>

      {/* Checkout Form */}
      <form className="checkout-form" onSubmit={handleCheckout}>
        <h3 className="form-title">Детали заказа</h3>

        <div className="form-group">
          <label className="form-label">Телефон для связи</label>
          <input
            type="text"
            className="form-input"
            placeholder="+7 (999) 123-45-67"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Адрес доставки</label>
          <textarea
            className="form-input"
            style={{ minHeight: '80px', resize: 'none' }}
            placeholder="Укажите название отеля, виллы или полный адрес с номером комнаты"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Способ оплаты</label>
          <select
            className="form-select"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}>
            <option value="Cash">Наличными курьеру</option>
            <option value="Crypto">Криптовалюта (USDT)</option>
            <option value="Bank">Банковский перевод</option>
          </select>
        </div>

        {profile && profile.bonusBalance > 0 && (
          <div
            className="bonus-checkbox-wrapper"
            onClick={() => setUseReferralBonus(!useReferralBonus)}>
            <input
              type="checkbox"
              checked={useReferralBonus}
              onChange={() => {}} // Controlled by wrapper click
            />
            <label className="bonus-label">
              Списать бонусный баланс (<span className="bonus-amount">{getBonusAmountText()}</span>)
            </label>
          </div>
        )}

        {useReferralBonus && profile && profile.bonusBalance > 0 && (
          <div
            className="total-box"
            style={{ backgroundColor: 'rgba(212, 163, 115, 0.05)', fontSize: '14px' }}>
            <span>К оплате с учетом бонусов:</span>
            <span className="total-price" style={{ color: 'var(--primary-color)' }}>
              {getPriceText(calculateFinalTotal())}
            </span>
          </div>
        )}

        <button type="submit" className="checkout-btn" disabled={createOrderMutation.isPending}>
          {createOrderMutation.isPending ? 'Оформление...' : 'Оформить заказ'}
        </button>
      </form>
    </div>
  );
};

export default CartPage;
