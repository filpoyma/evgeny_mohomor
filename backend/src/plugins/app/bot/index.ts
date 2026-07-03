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
    const token = fastify.config.TELEGRAM_BOT_TOKEN;

    // Check for dummy token or lack of token (for local developer testing or offline mode)
    if (!token || token.startsWith('123456789:')) {
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

    const bot = new Bot(token);

    // Global error handler to prevent crashing the server on Telegram API errors
    bot.catch((err) => {
      fastify.log.error(err.error, `Grammy error during update ${err.ctx.update.update_id}`);
    });

    // Command "/start" with optional referral parameter
    bot.command('start', async (ctx) => {
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

    if (mode === 'webhook') {
      if (!webhookUrl) {
        fastify.log.error('TELEGRAM_WEBHOOK_URL is not set but BOT_MODE is set to webhook');
      } else {
        const path = `/bot${token}`;
        const fullUrl = `${webhookUrl}${path}`;

        fastify.post(path, webhookCallback(bot, 'fastify'));

        bot.api
          .setWebhook(fullUrl)
          .then(() => {
            fastify.log.info(`Telegram Webhook set to: ${fullUrl}`);
          })
          .catch((err) => {
            fastify.log.error(err, 'Failed to set Telegram webhook');
          });
      }
    } else {
      // Clear webhook first to allow polling
      bot.api
        .deleteWebhook()
        .then(() => {
          fastify.log.info('Deleted Telegram webhook, starting polling...');
          bot.start().catch((err) => {
            fastify.log.error(err, 'Failed to start Grammy bot polling');
          });
        })
        .catch((err) => {
          fastify.log.error(err, 'Failed to delete webhook for polling');
        });
    }

    fastify.decorate('bot', bot);

    fastify.addHook('onClose', async (_instance) => {
      fastify.log.info('Stopping Telegram bot...');
      await bot.stop();
    });
  },
  {
    name: 'bot',
    dependencies: ['prisma', '@fastify/env'],
  }
);
