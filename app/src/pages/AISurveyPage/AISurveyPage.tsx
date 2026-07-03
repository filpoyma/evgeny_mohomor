import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { cartActions } from '../../store/reducers/cart';
import { useProductsQuery } from '../../api/products/product.queries';
import { useProfileQuery } from '../../api/users/user.queries';
import type { IProduct } from '../../types';

import './AISurveyPage.css';

interface Question {
  id: number;
  text: string;
  options: { val: string; text: string }[];
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    text: 'Какая ваша главная цель приема добавок?',
    options: [
      { val: 'sleep', text: 'Улучшить качество сна и легче засыпать' },
      { val: 'energy', text: 'Повысить уровень энергии и физическую выносливость' },
      { val: 'focus', text: 'Улучшить фокус, память и когнитивные способности' },
      { val: 'stress', text: 'Снизить уровень тревоги и обрести эмоциональный баланс' },
    ],
  },
  {
    id: 2,
    text: 'Был ли у вас ранее опыт приема микродозинга грибов?',
    options: [
      { val: 'yes_reg', text: 'Да, принимаю регулярно на постоянной основе' },
      { val: 'yes_past', text: 'Да, пробовал курсами в прошлом' },
      { val: 'no', text: 'Нет, никогда не пробовал, это первый раз' },
    ],
  },
  {
    id: 3,
    text: 'Оцените ваш средний уровень стресса за последний месяц:',
    options: [
      { val: 'high', text: 'Высокий (частые тревоги, эмоциональное выгорание)' },
      { val: 'medium', text: 'Умеренный (периодическое напряжение на работе/учебе)' },
      { val: 'low', text: 'Низкий (чувствую себя спокойно и расслабленно)' },
    ],
  },
  {
    id: 4,
    text: 'Есть ли у вас сложности с засыпанием или качеством сна?',
    options: [
      { val: 'sleep_hard', text: 'Да, тяжело засыпаю, мысли мешают спать' },
      { val: 'sleep_wake', text: 'Да, просыпаюсь среди ночи и сплю чутко' },
      { val: 'sleep_fine', text: 'Нет, сплю крепко, просыпаюсь отдохнувшим' },
    ],
  },
];

export const AISurveyPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  // Queries
  const { data: profile } = useProfileQuery();
  const { data: products = [] } = useProductsQuery();

  const handleSelect = (optionValue: string) => {
    setAnswers({ ...answers, [QUESTIONS[currentStep].id]: optionValue });

    // Auto next step with delay
    setTimeout(() => {
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        setCurrentStep(QUESTIONS.length); // Show results
      }
    }, 200);
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setAnswers({});
  };

  const getRecommendedProduct = (): IProduct | undefined => {
    if (products.length === 0) return undefined;

    const goal = answers[1]; // sleep, energy, focus, stress
    const sleepIssue = answers[4]; // sleep_hard, sleep_wake, sleep_fine

    // 1. If sleep or stress is high issues
    if (goal === 'sleep' || sleepIssue === 'sleep_hard' || sleepIssue === 'sleep_wake') {
      // Recommend Red Mushroom
      return products.find((p) => p.category === 'fly_agaric' && p.name.includes('Шляпки'));
    }

    // 2. If focus / NGF is target
    if (goal === 'focus') {
      return products.find((p) => p.category === 'regular' && p.name.includes('Ежовик'));
    }

    // 3. If energy / Cordyceps is target
    if (goal === 'energy') {
      return products.find((p) => p.category === 'regular' && p.name.includes('Кордицепс'));
    }

    // 4. Default: Recommend set
    return products.find((p) => p.category === 'set') || products[0];
  };

  const getRecommendationReason = (productName: string) => {
    if (productName.includes('Мухомор')) {
      return 'Исходя из ваших ответов, мы рекомендуем микродозинг Красного Мухомора. Он мягко успокаивает нервную систему, устраняет тревожность, помогает расслабить разум перед сном и восстановить глубокие фазы сна.';
    }
    if (productName.includes('Ежовик')) {
      return 'Для ваших когнитивных целей лучше всего подойдет Ежовик Гребенчатый. Это натуральный стимулятор роста нейронов, который улучшает нейропластичность мозга, память, креативность и концентрацию внимания.';
    }
    if (productName.includes('Кордицепс')) {
      return 'Вам рекомендован Кордицепс Военный. Этот гриб значительно повышает выработку АТФ (энергии в клетках) и улучшает насыщение крови кислородом, что даст вам огромный заряд бодрости и физического тонуса без побочных эффектов.';
    }
    return 'Мы рекомендуем готовый сбалансированный комплекс. Сочетание активных компонентов грибов поможет снять нервное перенапряжение и одновременно настроить ваш мозг на продуктивную работу в течение дня.';
  };

  const handleBuy = (product: IProduct) => {
    dispatch(cartActions.addToCart(product));
    navigate('/cart');
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

  const progressPercentage = ((currentStep) / QUESTIONS.length) * 100;
  const recommendedProduct = getRecommendedProduct();

  return (
    <div className="survey-container">
      {/* Progress Bar */}
      {currentStep < QUESTIONS.length && (
        <div className="survey-progress-bar">
          <div className="survey-progress-fill" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      )}

      {currentStep < QUESTIONS.length ? (
        /* Questions Steps */
        <div className="survey-step">
          <h2 className="survey-question">
            {QUESTIONS[currentStep].text}
          </h2>
          <div className="survey-options">
            {QUESTIONS[currentStep].options.map((opt) => (
              <button
                key={opt.val}
                className={`option-card ${answers[QUESTIONS[currentStep].id] === opt.val ? 'selected' : ''}`}
                onClick={() => handleSelect(opt.val)}
              >
                {opt.text}
              </button>
            ))}
          </div>
          <div className="survey-nav">
            {currentStep > 0 ? (
              <button className="survey-nav-btn" onClick={handlePrev}>
                ← Назад
              </button>
            ) : (
              <div />
            )}
            <span style={{ fontSize: '12px', color: 'var(--subtitle-text-color)', display: 'flex', alignItems: 'center' }}>
              Шаг {currentStep + 1} из {QUESTIONS.length}
            </span>
          </div>
        </div>
      ) : (
        /* Results Section */
        <div className="result-section">
          <div className="result-icon">💡</div>
          <div className="result-header">
            <h2 className="result-title">Рекомендация ИИ</h2>
            {recommendedProduct && (
              <p className="result-desc">{getRecommendationReason(recommendedProduct.name)}</p>
            )}
          </div>

          {recommendedProduct ? (
            <div className="recommended-product">
              <img className="rec-img" src={recommendedProduct.imageUrl} alt={recommendedProduct.name} />
              <div className="rec-info">
                <h4 className="rec-name">{recommendedProduct.name}</h4>
                <span style={{ fontSize: '11px', color: 'var(--subtitle-text-color)' }}>Фасовка: {recommendedProduct.size}</span>
                <span className="rec-price">{getPriceText(recommendedProduct)}</span>
              </div>
              <button className="rec-buy-btn" onClick={() => handleBuy(recommendedProduct)}>
                Купить комплект
              </button>
            </div>
          ) : (
            <div style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
              Не удалось подобрать продукт. Пожалуйста, попробуйте еще раз.
            </div>
          )}

          <button className="retake-btn" onClick={handleReset}>
            ⚡ Пройти опрос заново
          </button>
        </div>
      )}
    </div>
  );
};

export default AISurveyPage;
