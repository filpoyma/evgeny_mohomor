import type { FastifyInstance } from 'fastify'

export interface ICreateOrderInput {
  items: Array<{
    productId: string
    name: string
    size: string
    quantity: number
    price: number
    currency: string
  }>
  totalAmount: number
  currency: string
  paymentMethod: string
  address: string
  phone: string
  useReferralBonus: boolean
}

export function createOrdersService(fastify: FastifyInstance) {
  const prisma = fastify.prisma

  return {
    async create(userId: string, input: ICreateOrderInput) {
      return prisma.$transaction(async (tx) => {
        // 1. Fetch User details
        const user = await tx.user.findUniqueOrThrow({
          where: { id: userId }
        })

        let finalAmount = input.totalAmount
        let discountApplied = 0

        // 2. Apply referral bonuses if requested
        if (input.useReferralBonus && user.bonusBalance > 0) {
          const discount = Math.min(finalAmount, user.bonusBalance)
          discountApplied = discount
          finalAmount -= discount

          // Deduct from user balance
          await tx.user.update({
            where: { id: userId },
            data: {
              bonusBalance: {
                decrement: discount
              }
            }
          })
        }

        // 3. Create the order
        const order = await tx.order.create({
          data: {
            userId,
            items: input.items,
            totalAmount: finalAmount,
            currency: input.currency,
            paymentMethod: input.paymentMethod,
            address: input.address,
            phone: input.phone,
            status: 'Pending'
          }
        })

        // 4. Update product stocks
        for (const item of input.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: {
                decrement: item.quantity
              }
            }
          })
        }

        // 5. Award 10% referral bonus to referrer (if any)
        if (user.referredById && finalAmount > 0) {
          const bonusReward = finalAmount * 0.10 // 10% reward

          // Add to referrer balance
          await tx.user.update({
            where: { id: user.referredById },
            data: {
              bonusBalance: {
                increment: bonusReward
              }
            }
          })

          // Log Referral payout
          await tx.referral.create({
            data: {
              referrerId: user.referredById,
              refereeId: userId,
              bonusEarned: bonusReward
            }
          })

          // Try to notify referrer via Telegram bot
          try {
            const referrer = await tx.user.findUnique({ where: { id: user.referredById } })
            if (referrer) {
              const formattedBonus = bonusReward.toLocaleString()
              const currencySymbol = input.currency === 'IDR' ? 'Rp' : input.currency === 'VND' ? '₫' : input.currency
              await fastify.bot.api.sendMessage(
                referrer.id,
                `🎉 Твой друг совершил заказ! На твой бонусный баланс начислено *${formattedBonus} ${currencySymbol}* (10% от суммы заказа).`,
                { parse_mode: 'Markdown' }
              )
            }
          } catch (botErr) {
            fastify.log.warn(botErr, 'Failed to send referral bot notification')
          }
        }

        // 6. Notify Customer & Shop Admin
        try {
          const currencySymbol = input.currency === 'IDR' ? 'Rp' : input.currency === 'VND' ? '₫' : input.currency
          const formattedTotal = finalAmount.toLocaleString()
          
          // Notify User
          await fastify.bot.api.sendMessage(
            userId,
            `📦 *Заказ оформлен!*\n\nНомер заказа: \`${order.id.slice(0, 8)}\`\nСумма к оплате: *${formattedTotal} ${currencySymbol}*\nСпособ оплаты: *${input.paymentMethod}*\nАдрес доставки: ${input.address}\n\nСпасибо за заказ! Администратор свяжется с вами в ближайшее время.`,
            { parse_mode: 'Markdown' }
          )

          // Notify Admin (if ADMIN_CHAT_ID is set)
          const adminChatId = fastify.config.ADMIN_CHAT_ID || '123456789'
          if (adminChatId) {
            const itemsList = input.items.map(item => `- ${item.name} (${item.size}) x${item.quantity}`).join('\n')
            await fastify.bot.api.sendMessage(
              adminChatId,
              `🚨 *Новый заказ в магазине!*\n\n` +
              `Покупатель: ${user.firstName} ${user.lastName} (@${user.username || 'нет_username'})\n` +
              `ID пользователя: \`${user.id}\`\n` +
              `Номер заказа: \`${order.id.slice(0, 8)}\`\n` +
              `Товары:\n${itemsList}\n\n` +
              `Итого к оплате: *${formattedTotal} ${currencySymbol}* (${input.paymentMethod})\n` +
              `Телефон: ${input.phone}\n` +
              `Адрес: ${input.address}\n` +
              `Использована скидка: ${discountApplied.toLocaleString()} ${currencySymbol}`,
              { parse_mode: 'Markdown' }
            )
          }
        } catch (botErr) {
          fastify.log.warn(botErr, 'Failed to send bot notification')
        }

        return order
      })
    },

    async getByUserId(userId: string) {
      return prisma.order.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      })
    },

    async getAll() {
      return prisma.order.findMany({
        orderBy: { createdAt: 'desc' }
      })
    },

    async updateStatus(id: string, status: string) {
      const order = await prisma.order.update({
        where: { id },
        data: { status }
      })

      // Notify customer of status change
      try {
        const statusMap: Record<string, string> = {
          Pending: 'В обработке ⏳',
          Paid: 'Оплачен ✅',
          Shipped: 'Доставляется 🚚',
          Cancelled: 'Отменен ❌'
        }
        const readableStatus = statusMap[status] ?? status

        await fastify.bot.api.sendMessage(
          order.userId,
          `🔔 *Обновление статуса заказа!*\n\n` +
          `Статус твоего заказа \`${order.id.slice(0, 8)}\` изменен на: *${readableStatus}*.`,
          { parse_mode: 'Markdown' }
        )
      } catch (botErr) {
        fastify.log.warn(botErr, 'Failed to notify order status change')
      }

      return order
    }
  }
}
