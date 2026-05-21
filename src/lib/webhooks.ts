import { prisma } from "./db";

/**
 * Triggers configured webhooks for specific events.
 * Fetches active webhooks that are subscribed to the triggered event.
 */
export async function triggerWebhook(event: string, payload: unknown) {
  try {
    const webhooks = await prisma.webhookConfig.findMany({
      where: { isActive: true },
    });

    for (const webhook of webhooks) {
      const subscribedEvents = webhook.events as string[];
      if (subscribedEvents.includes(event)) {
        // Fire and forget, but log failures
        fetch(webhook.url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Webhook-Event": event,
            "X-Webhook-Secret": webhook.secret || "",
          },
          body: JSON.stringify({
            event,
            timestamp: new Date().toISOString(),
            data: payload,
          }),
        })
        .then(async (res) => {
          await prisma.webhookConfig.update({
            where: { id: webhook.id },
            data: { lastTriggered: new Date() },
          });
          if (!res.ok) {
            console.error(`[Webhook] ${webhook.name} failed with status ${res.status}`);
          }
        })
        .catch((err) => {
          console.error(`[Webhook] ${webhook.name} error:`, err);
        });
      }
    }
  } catch (error) {
    console.error("[Webhook Lib] Error triggering webhooks:", error);
  }
}
