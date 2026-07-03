export interface IUser {
  id: string; // Telegram user ID
  username?: string;
  firstName?: string;
  lastName?: string;
  role: number; // 0 = User, 1 = Admin
  region: string; // Bali, Vietnam
  currency: string; // IDR, VND, USDT, RUB
  address: string;
  bonusBalance: number;
  referredById?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IArticle {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  readTime: string;
  createdAt?: string;
}
