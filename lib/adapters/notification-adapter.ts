/**
 * Notification adapter interface and implementations
 *
 * Enables sending notifications about narrative arc events to external systems
 */

import { logger } from '../logger'

export interface Notification {
  recipient: string // User ID or email
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  metadata?: Record<string, unknown>
}

export interface INotificationAdapter {
  send(notification: Notification): Promise<void>
  sendBatch(notifications: Notification[]): Promise<void>
}

/**
 * Console notification adapter (default)
 * Logs notifications to console - useful for development
 */
export class ConsoleNotificationAdapter implements INotificationAdapter {
  async send(notification: Notification): Promise<void> {
    logger.info('Notification sent (console)', undefined, {
      recipient: notification.recipient,
      title: notification.title,
      type: notification.type,
    })

    console.log('📬 Notification:', {
      to: notification.recipient,
      title: notification.title,
      message: notification.message,
      type: notification.type,
    })
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    for (const notification of notifications) {
      await this.send(notification)
    }
  }
}

/**
 * Email notification adapter (stub)
 * Replace with actual email service integration (SendGrid, Postmark, etc.)
 */
export class EmailNotificationAdapter implements INotificationAdapter {
  constructor(private config?: { apiKey?: string; fromEmail?: string }) {}

  async send(notification: Notification): Promise<void> {
    logger.info('Notification sent (email)', undefined, {
      recipient: notification.recipient,
      title: notification.title,
    })

    // TODO: Implement actual email sending
    // Example with SendGrid:
    // await sendgrid.send({
    //   to: notification.recipient,
    //   from: this.config.fromEmail,
    //   subject: notification.title,
    //   html: notification.message,
    // })
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    // TODO: Implement batch email sending
    for (const notification of notifications) {
      await this.send(notification)
    }
  }
}

/**
 * Webhook notification adapter (stub)
 * Posts notifications to a webhook URL
 */
export class WebhookNotificationAdapter implements INotificationAdapter {
  constructor(private webhookUrl: string) {}

  async send(notification: Notification): Promise<void> {
    logger.info('Notification sent (webhook)', undefined, {
      recipient: notification.recipient,
      webhookUrl: this.webhookUrl,
    })

    // TODO: Implement actual webhook posting
    // await fetch(this.webhookUrl, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(notification),
    // })
  }

  async sendBatch(notifications: Notification[]): Promise<void> {
    await this.send({
      recipient: 'batch',
      title: 'Batch Notification',
      message: `${notifications.length} notifications`,
      type: 'info',
      metadata: { notifications },
    })
  }
}
