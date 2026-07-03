import fp from 'fastify-plugin';
import { Bot, InlineKeyboard, webhookCallback } from 'grammy';
import type { FastifyInstance } from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    bot: any;
  }
}

/**
 * Grammy Bot Fastify plugin.
 * Handles Telegram Bot updates and registers command actions.
 */
export default fp(
  async (fastify: FastifyInstance) => {
    console.log('🤖 [Telegram Bot] Initializing Grammy Bot plugin...');
    const token = fastify.config.TELEGRAM_BOT_TOKEN;

    // Check for dummy token or lack of token (for local developer testing or offline mode)
    if (!token || token.startsWith('123456789:')) {
      console.warn('🤖 [Telegram Bot] Using dummy/invalid Telegram Bot Token. Grammy Bot will not be started.');
      fastify.log.warn('Using dummy/invalid Telegram Bot Token. Grammy Bot will not be started.');

      // Decorate with a mock bot to avoid server crashes when calling notifications
      fastify.decorate('bot', {
        api: {
          sendMessage: async (chatId: string | number, text: string) => {
            fastify.log.info({ chatId, text }, '[Mock Bot API] Sent message');
            return { message_id: 1 };
          },
        },
      });
      return;
    }

    console.log(`🤖 [Telegram Bot] Creating bot instance with token: ${token.substring(0, 10)}...`);
    const bot = new Bot(token);

    // Logging middleware to track every update in the console
    bot.use(async (ctx, next) => {
      console.log(`🤖 [Telegram Bot] Update received! ID: ${ctx.update.update_id}, Type: ${Object.keys(ctx.update).filter(k => k !== 'update_id')[0]}`);
      await next();
    });

    // Global error handler to prevent crashing the server on Telegram API errors
    bot.catch((err) => {
      console.error(`🤖 [Telegram Bot Error] Error during update ${err.ctx.update.update_id}:`, err.error);
      fastify.log.error(err.error, `Grammy error during update ${err.ctx.update.update_id}`);
    });

    // Command "/start" with optional referral parameter
    bot.command('start', async (ctx) => {
      console.log(`🤖 [Telegram Bot] Handling /start command from user: ${ctx.from?.id} (${ctx.from?.username})`);
      const match = ctx.match; // holds referral parameter if opened via link like t.me/Bot?start=ref_123456
      const userId = ctx.from?.id.toString();
      const username = ctx.from?.username ?? '';
      const firstName = ctx.from?.first_name ?? '';
      const lastName = ctx.from?.last_name ?? '';
      console.log('file-index.ts userId:', userId);
      if (userId) {
        // Find if user already exists
        const existingUser = await fastify.prisma.user.findUnique({
          where: { id: userId },
        });

        if (!existingUser) {
          let referredById: string | null = null;

          // Handle referral start link
          if (match && match.startsWith('ref_')) {
            const potentialReferrerId = match.substring(4);
            if (potentialReferrerId !== userId) {
              const referrer = await fastify.prisma.user.findUnique({
                where: { id: potentialReferrerId },
              });
              if (referrer) {
                referredById = potentialReferrerId;
              }
            }
          }

          const isAdmin = userId === fastify.config.ADMIN_CHAT_ID;
          console.log('file-index.ts userId:1', userId);
          console.log('file-index.ts fastify.config.ADMIN_CHAT_ID:', fastify.config.ADMIN_CHAT_ID);
          // Register user
          await fastify.prisma.user.create({
            data: {
              id: userId,
              username,
              firstName,
              lastName,
              role: isAdmin ? 1 : 0,
              region: 'Bali',
              currency: 'IDR',
              referredById,
            },
          });
        } else {
          const isAdmin = userId === fastify.config.ADMIN_CHAT_ID;
          console.log('file-index.ts userId:2', userId);
          console.log('file-index.ts fastify.config.ADMIN_CHAT_ID:', fastify.config.ADMIN_CHAT_ID);
          // Update credentials if changed
          await fastify.prisma.user.update({
            where: { id: userId },
            data: {
              username,
              firstName,
              lastName,
              role: isAdmin ? 1 : existingUser.role,
            },
          });
        }
      }

      // Web App Launch URL
      const webAppUrl = fastify.config.TELEGRAM_MINI_APP_URL;
      const keyboard = new InlineKeyboard().webApp('Открыть лавку 🍄', webAppUrl);

      await ctx.reply(
        `Привет, ${firstName}! Добро пожаловать в лавку *Евгения Мухомора* 🍄\n\n` +
          `Здесь ты найдешь качественные шляпки красного и пантерного мухоморов, ноотропный Ежовик Гребенчатый, Кордицепс и настойки.\n\n` +
          `У нас действует реферальная программа: приглашай друзей и получай *10%* от их заказов на свой баланс в приложении!`,
        {
          reply_markup: keyboard,
          parse_mode: 'Markdown',
        }
      );
    });

    bot.command('help', async (ctx) => {
      console.log(`🤖 [Telegram Bot] Handling /help command from user: ${ctx.from?.id}`);
      await ctx.reply(
        `Как работает лавка?\n\n` +
          `1. Нажмите кнопку "Открыть лавку" под сообщением.\n` +
          `2. Выберите регион доставки (Бали 🌴 или Вьетнам 🇻🇳).\n` +
          `3. Сделайте заказ. Оплата возможна наличными при получении или криптовалютой.\n` +
          `4. Поделитесь реферальной ссылкой из вкладки "Профиль", чтобы получать бонусы от друзей.`
      );
    });

    const mode = fastify.config.TELEGRAM_BOT_MODE;
    const webhookUrl = fastify.config.TELEGRAM_WEBHOOK_URL;
    console.log(`🤖 [Telegram Bot] Bot Mode configured as: ${mode}`);

    if (mode === 'webhook') {
      if (!webhookUrl) {
        console.error('🤖 [Telegram Bot Error] TELEGRAM_WEBHOOK_URL is not set but BOT_MODE is set to webhook');
        fastify.log.error('TELEGRAM_WEBHOOK_URL is not set but BOT_MODE is set to webhook');
      } else {
        const urlObj = new URL(webhookUrl);
        const urlPath = urlObj.pathname === '/' ? '' : urlObj.pathname.replace(/\/$/, '');
        const path = `${urlPath}/bot${token}`;
        const fullUrl = `${urlObj.origin}${path}`;

        console.log(`🤖 [Telegram Bot] Setting up Webhook route at Fastify path: ${path}`);
        fastify.post(path, webhookCallback(bot, 'fastify'));

        console.log(`🤖 [Telegram Bot] Registering webhook url on Telegram servers: ${fullUrl}`);
        bot.api
          .setWebhook(fullUrl)
          .then(() => {
            console.log(`🤖 [Telegram Bot] Webhook successfully set to: ${fullUrl}`);
            fastify.log.info(`Telegram Webhook set to: ${fullUrl}`);
          })
          .catch((err) => {
            console.error('🤖 [Telegram Bot Error] Failed to set Telegram webhook:', err);
            fastify.log.error(err, 'Failed to set Telegram webhook');
          });
      }
    } else {
      // Clear webhook first to allow polling
      console.log('🤖 [Telegram Bot] Deleting webhook and starting polling mode...');
      bot.api
        .deleteWebhook()
        .then(() => {
          console.log('🤖 [Telegram Bot] Webhook cleared. Starting long polling updates...');
          bot.start().catch((err) => {
            console.error('🤖 [Telegram Bot Error] Failed to start Grammy bot polling:', err);
            fastify.log.error(err, 'Failed to start Grammy bot polling');
          });
        })
        .catch((err) => {
          console.error('🤖 [Telegram Bot Error] Failed to delete webhook for polling:', err);
          fastify.log.error(err, 'Failed to delete webhook for polling');
        });
    }

    fastify.decorate('bot', bot);

    fastify.addHook('onClose', async (_instance) => {
      console.log('🤖 [Telegram Bot] Stopping Telegram bot...');
      fastify.log.info('Stopping Telegram bot...');
      await bot.stop();
    });
  },
  {
    name: 'bot',
    dependencies: ['prisma', '@fastify/env'],
  }
);
