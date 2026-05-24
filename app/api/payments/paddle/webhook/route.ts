import { NextRequest, NextResponse } from "next/server";
import { updateOrderPaymentStatus, getOrderById } from "@/lib/database";
import { paddle } from "@/lib/paddleClient";

// Paddle v2 webhook handler - verify signature and update order
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("paddle-signature") || "";
    const webhookSecret =
      process.env.NEXT_PUBLIC_PADDLE_ENV === "production"
        ? process.env.LIVE_WEBHOOK_SECRET
        : process.env.PADDLE_WEBHOOK_SECRET;

    if (!signature || !webhookSecret) {
      console.error("[Paddle Webhook] Missing signature or webhook secret");
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    // Verify signature manually (100% stable, no SDK required)
    try {
      const crypto = require('crypto');
      const [tsPart, h1Part] = signature.split(';');
      const timestamp = tsPart.split('=')[1];
      const h1Value = h1Part.split('=')[1];
      
      const payload = `${timestamp}:${body}`;
      const expectedHmac = crypto
        .createHmac('sha256', webhookSecret)
        .update(payload)
        .digest('hex');

      if (h1Value !== expectedHmac) {
        console.error('[Paddle Webhook] Invalid signature (Manual Check)');
        return NextResponse.json({ success: false, error: 'Invalid signature' }, { status: 401 });
      }
      console.log('[Paddle Webhook] ✅ Signature verified manually');
    } catch (err) {
      console.error('[Paddle Webhook] Manual signature verification failed:', err);
      return NextResponse.json({ success: false, error: 'Verification failed' }, { status: 401 });
    }

    // Parse data
    const data = JSON.parse(body);
    console.log("[Paddle Webhook] Received validated event:", {
      eventType: data.event_type || data.eventType,
      transactionId: data.data?.id,
    });

    const eventType = data.event_type || data.eventType;
    const transactionData = data.data;

    // Handle transaction.completed event (payment successful)
    if (
      (eventType === "transaction.completed" ||
        data.event_type === "transaction.completed" ||
        data.eventType === "transaction.completed") &&
      transactionData
    ) {
      const transactionId = transactionData.id;
      const checkoutId = transactionData.checkout?.id;

      // Try to extract orderId from custom data
      let orderId: number | undefined;

      // Check if custom data contains orderId
      if (transactionData.custom_data) {
        try {
          const customData =
            typeof transactionData.custom_data === "string"
              ? JSON.parse(transactionData.custom_data)
              : transactionData.custom_data;
          orderId = Number(customData?.orderId);
        } catch (e) {
          console.warn(
            "[Paddle Webhook] Failed to parse custom_data:",
            transactionData.custom_data,
          );
        }
      }

      if (!orderId) {
        console.warn(
          "[Paddle Webhook] No orderId found in custom_data, event cannot be processed",
        );
        return NextResponse.json(
          { success: false, error: "No orderId in custom_data" },
          { status: 400 },
        );
      }

      console.log("[Paddle Webhook] Processing transaction.completed:", {
        transactionId,
        orderId,
      });

      // Fetch current order status to prevent double-processing
      const currentOrder = await getOrderById(orderId);
      if (!currentOrder) {
        console.error(
          "[Paddle Webhook] Order not found for processing:",
          orderId,
        );
        return NextResponse.json(
          { success: false, error: "Order not found" },
          { status: 404 },
        );
      }

      if (currentOrder.payment_status === "completed") {
        console.log(
          "[Paddle Webhook] Order already marked as completed. Skipping email trigger to prevent duplicates.",
        );
        return NextResponse.json({
          success: true,
          message: "Already processed",
        });
      }

      // Mark order as completed in DB
      await updateOrderPaymentStatus(orderId, "completed", transactionId);

      console.log(
        "[Paddle Webhook] Order status updated in DB, now sending emails...",
      );

      // Fetch order details again (or use fresh data) for email
      try {
        const order = await getOrderById(orderId);
        if (order) {
          // Send payment success emails
          const baseUrl =
            process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
          const emailResponse = await fetch(`${baseUrl}/api/send-email`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "payment_success",
              orderId: order.id,
              orderNumber: order.order_number,
              customerEmail: order.customer_email,
              packageType: order.package_type,
              amount: order.amount,
              currency: order.currency,
              vinNumber:
                order.vin_number || order.identification_value || "N/A",
              transactionId: transactionId,
              customerName: transactionData.customer?.name || "Valued Customer",
            }),
          });

          if (!emailResponse.ok) {
            console.error(
              "[Paddle Webhook] Email API responded with error status:",
              emailResponse.status,
            );
          } else {
            console.log("[Paddle Webhook] ✅ All success emails triggered");
          }
        }
      } catch (emailErr) {
        console.error(
          "[Paddle Webhook] ❌ Error triggering payment success emails:",
          emailErr,
        );
      }

      console.log("[Paddle Webhook] Order updated successfully:", orderId);
      return NextResponse.json({ success: true });
    }

    // Handle legacy webhook format for backward compatibility
    if (
      data.alert_name === "payment_succeeded" ||
      data.alert_name === "checkout_complete"
    ) {
      const passthrough = data.custom_message || data.passthrough || "";
      const match = (passthrough as string).match(/order:(\d+)/);
      const orderId = match ? Number(match[1]) : undefined;

      if (!orderId) {
        console.warn(
          "[Paddle Webhook] Legacy format: no order reference found",
        );
        return NextResponse.json({ success: false }, { status: 400 });
      }

      const paymentId = data.checkout_id || data.payment_id || undefined;
      await updateOrderPaymentStatus(orderId, "completed", paymentId as any);

      return NextResponse.json({ success: true });
    }

    // Silently acknowledge other webhook events
    console.log(
      "[Paddle Webhook] Acknowledged event type:",
      eventType || data.alert_name,
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[Paddle Webhook] Error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
