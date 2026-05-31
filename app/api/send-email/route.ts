import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/mysql";
import { getTranslationsForLang } from "@/lib/translations";
import { EmailTemplates } from "@/lib/email-templates";

const ADMIN_EMAIL =
  process.env.ADMIN_EMAIL ||
  process.env.EMAIL_FROM ||
  process.env.SMTP_USER ||
  "admin@example.com";

if (!process.env.ADMIN_EMAIL) {
  console.warn(
    "[EMAIL CONFIG WARNING] ADMIN_EMAIL is not set. Falling back to: " + ADMIN_EMAIL,
  );
}

function generateOrderNotificationEmail(data: any, lang = "en"): string {
  const t = getTranslationsForLang(lang);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000";
  const orderLink = `${baseUrl}/admin/dashboard/orders/${data.orderId}`;
  const identLabel =
    data.identification_type === "plate" ? "Plate Number" : "VIN";
  const identValue = data.identification_value || data.vin_number || "N/A";

  return `<!DOCTYPE html><html><body>
    <h1>${t["email_new_order"] || "New Order Received"}</h1>
    <p>A new report request has been submitted via the Get Report form. Details are below:</p>
    <p><strong>${t["email_order_number"] || "Order Number"}:</strong> ${data.orderNumber}</p>
    <p><strong>${t["email_customer"] || "Customer Email"}:</strong> ${data.customerEmail}</p>
    <p><strong>Vehicle Type:</strong> ${data.vehicleType || "N/A"}</p>
    <p><strong>${identLabel}:</strong> ${identValue}</p>
    <p><strong>Package:</strong> ${data.packageType}</p>
    <p><strong>Country:</strong> ${data.countryCode || "N/A"}</p>
    <p><strong>Amount:</strong> ${data.currency || "USD"} ${Number(data.amount).toFixed(2)}</p>
    <p><strong>${t["email_payment_status"] || "Payment status"}:</strong> ${data.paymentStatus || "pending"}</p>
    <p><a href="${orderLink}">View order in admin</a></p>
    <hr />
    <h2>Submitted Form Data</h2>
    <pre style="white-space: pre-wrap; word-break: break-word; background: #f7f7f7; padding: 12px; border-radius: 8px;">${JSON.stringify(data, null, 2)}</pre>
    </body></html>`;
}

function generateOrderConfirmationEmail(data: any, lang = "en"): string {
  const t = getTranslationsForLang(lang);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000";
  const checkoutLink = `${baseUrl}/checkout/${data.orderId}`;
  const identLabel =
    data.identification_type === "plate" ? "Plate Number" : "VIN";
  const identValue = data.identification_value || data.vin_number || "N/A";

  return `<!DOCTYPE html><html><body>
    <h1>${t["email_order_confirmed"] || "Order Confirmed"}</h1>
    <p><strong>${t["email_order_number"] || "Order Number"}:</strong> ${data.orderNumber}</p>
    <p><strong>Vehicle Type:</strong> ${data.vehicleType || "N/A"}</p>
    <p><strong>${identLabel}:</strong> ${identValue}</p>
    <p><strong>${t["email_product"] || "Product"}:</strong> ${data.packageType} ${t["email_report"] || "Report"}</p>
    <p><strong>${t["email_amount_paid"] || "Amount Paid"}:</strong> ${data.currency || "USD"} ${Number(data.amount).toFixed(2)}</p>
    <p>${t["email_thanks"] || "Thank you for your purchase! You can view your order or continue to checkout below."}</p>
    <p><a href="${checkoutLink}">${t["email_view_order"] || "View order / Continue to checkout"}</a></p>
    </body></html>`;
}

function generateContactFormEmail(data: any, lang = "en"): string {
  const t = getTranslationsForLang(lang);
  return `<!DOCTYPE html><html><body><h1>${t["email_contact_submission"] || "Contact Form Submission"}</h1><p>${t["email_name"] || "Name"}: ${data.name}</p><p>${t["email_email"] || "Email"}: ${data.email}</p><p>${t["email_subject"] || "Subject"}: ${data.subject}</p><pre>${data.message}</pre></body></html>`;
}

function generateReviewNotificationEmail(data: any, lang = "en"): string {
  const t = getTranslationsForLang(lang);
  return `<!DOCTYPE html><html><body><h1>${t["email_review_submitted"] || "New Review Submitted"}</h1><p>${t["email_name"] || "Name"}: ${data.name}</p><p>${t["email_email"] || "Email"}: ${data.email}</p><p>${t["email_rating"] || "Rating"}: ${data.rating}</p><p>${t["email_comment"] || "Comment"}:</p><pre>${data.comment}</pre><p>${t["email_submitted_at"] || "Submitted at"}: ${data.createdAt}</p></body></html>`;
}

function generatePaymentSuccessAdminEmail(data: any): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #22c55e;">Payment Successful! 🥳</h2>
      <p>Hello Admin,</p>
      <p>A new payment has been received for a vehicle history report via <strong>Carreaders</strong>.</p>
      
      <div style="background: #f9f9f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
        <h3 style="margin-top: 0; color: #333; border-bottom: 2px solid #ddd; padding-bottom: 10px;">Payment Details:</h3>
        <p style="margin: 8px 0;"><strong>Transaction ID:</strong> ${data.transactionId || "N/A"}</p>
        <p style="margin: 8px 0;"><strong>Product:</strong> ${data.packageType || "N/A"}</p>
        <p style="margin: 8px 0;"><strong>Amount:</strong> ${data.currency || "USD"} ${Number(data.amount).toFixed(2)}</p>
        <p style="margin: 8px 0;"><strong>Customer Email:</strong> ${data.customerEmail}</p>
        <p style="margin: 8px 0;"><strong>Customer Name:</strong> ${data.customerName || "Valued Customer"}</p>
        <p style="margin: 8px 0;"><strong>VIN:</strong> ${data.vinNumber || data.identificationValue || "N/A"}</p>
      </div>
      
      <p style="margin-top: 20px; color: #666; font-size: 14px;">The order has been marked as completed in the database for Carreaders.</p>
    </div>
  `;
}

function generatePaymentSuccessCustomerEmail(data: any): string {
  return `
    <div style="font-family: sans-serif; max-width: 600px; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
      <h2 style="color: #3b82f6;">Order Received - We're processing your report! 📄</h2>
      <p>Hello,</p>
      <p>Thank you for your purchase (Order: <strong>${data.orderNumber}</strong>). Your payment was successful.</p>
      
      <div style="background: #eff6ff; padding: 15px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
        <p style="margin: 0; color: #1e40af; font-weight: bold;">Wait Time Notice:</p>
        <p style="margin: 5px 0 0 0; color: #1e40af;">Your vehicle history report will be ready in approximately <strong>12 to 13 hours</strong>. We will send you a separate email with the full report once it has been generated.</p>
      </div>
      
      <p>If you have any questions, feel free to contact us.</p>
      <p>Best Regards,<br/><strong>Carreaders</strong></p>
    </div>
  `;
}

function generateVehicleRegistrationNotificationEmail(data: any, lang = "en"): string {
  const t = getTranslationsForLang(lang);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000";
  const registrationLink = `${baseUrl}/admin/dashboard/vehicle-registrations/${data.registrationId}`;
  return `<!DOCTYPE html><html><body>
    <h1>${t["email_new_vehicle_registration"] || "New Vehicle Registration Submitted"}</h1>
    <p><strong>${t["email_registration_number"] || "Registration Number"}:</strong> ${data.registrationNumber}</p>
    <p><strong>${t["email_owner_name"] || "Owner"}:</strong> ${data.ownerName}</p>
    <p><strong>${t["email_owner_email"] || "Email"}:</strong> ${data.ownerEmail}</p>
    <p><strong>${t["email_phone"] || "Phone"}:</strong> ${data.ownerPhone}</p>
    <p><strong>${t["email_vehicle"] || "Vehicle"}:</strong> ${data.vehicleTitle}</p>
    <p><strong>${t["email_make"] || "Make"}:</strong> ${data.vehicleMake}</p>
    <p><strong>${t["email_model"] || "Model"}:</strong> ${data.vehicleModel}</p>
    <p><strong>${t["email_vehicle_type"] || "Type"}:</strong> ${data.vehicleType}</p>
    <p><strong>${t["email_vin"] || "VIN"}:</strong> ${data.vin || "N/A"}</p>
    <p><strong>${t["email_license_plate"] || "License Plate"}:</strong> ${data.licensePlate || "N/A"}</p>
    <p><strong>${t["email_description"] || "Description"}:</strong></p>
    <pre>${data.description || 'N/A'}</pre>
    <p><strong>${t["email_price"] || "Price"}:</strong> ${data.currency} ${Number(data.price).toFixed(2)}</p>
    <p><strong>${t["email_payment_status"] || "Payment status"}:</strong> ${data.paymentStatus || "pending"}</p>
    <p><a href="${registrationLink}">${t["email_view_registration"] || "View registration in admin"}</a></p>
    </body></html>`;
}

function generateVehicleRegistrationConfirmationEmail(data: any, lang = "en"): string {
  const t = getTranslationsForLang(lang);
  const baseUrl =
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.BASE_URL ||
    "http://localhost:3000";
  const trackingLink = `${baseUrl}/register-vehicle/payment/${data.registrationId}`;
  return `<!DOCTYPE html><html><body>
    <h1>${t["email_registration_received"] || "We received your vehicle registration"}</h1>
    <p>${t["email_thank_you"] || "Thank you for registering your vehicle with Carreaders."}</p>
    <p><strong>${t["email_registration_number"] || "Registration Number"}:</strong> ${data.registrationNumber}</p>
    <p><strong>${t["email_vehicle"] || "Vehicle"}:</strong> ${data.vehicleTitle} (${data.vehicleMake} ${data.vehicleModel})</p>
    <p><strong>${t["email_amount"] || "Price"}:</strong> ${data.currency} ${Number(data.price).toFixed(2)}</p>
    <p>${t["email_next_steps"] || "We will review your listing and contact you shortly. You may also continue payment or review details below."}</p>
    <p><a href="${trackingLink}">${t["email_manage_registration"] || "Manage your registration"}</a></p>
    </body></html>`;
}

async function sendEmailWithResend(
  to: string,
  subject: string,
  htmlContent: string,
  fromAddress: string,
): Promise<{ success: boolean; message?: string }> {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  if (!RESEND_API_KEY) {
    return {
      success: false,
      message: "RESEND_API_KEY not configured.",
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: fromAddress,
        to: [to],
        subject,
        html: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown Resend error");
      console.error("Resend send failed:", errorText);
      try {
        await pool.execute(
          "INSERT INTO email_failures (to_address, subject, body, error_message, created_at) VALUES (?, ?, ?, ?, NOW())",
          [to, subject, htmlContent, errorText],
        );
      } catch (e) {
        console.error("Failed to log Resend email failure to DB:", e);
      }
      return {
        success: false,
        message: `Resend failed: ${errorText}`,
      };
    }

    try {
      await pool.execute(
        "INSERT INTO email_outbox (to_address, subject, body, provider, preview_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
        [to, subject, htmlContent, "resend", null, "sent"],
      );
    } catch (e) {
      console.error("Failed to persist sent email to outbox (Resend):", e);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Resend send failed:", err);
    try {
      await pool.execute(
        "INSERT INTO email_failures (to_address, subject, body, error_message, created_at) VALUES (?, ?, ?, ?, NOW())",
        [to, subject, htmlContent, String(err.message || err)],
      );
    } catch (e) {
      console.error("Failed to log Resend email failure to DB:", e);
    }
    return {
      success: false,
      message: err.message || "Unknown error sending email via Resend",
    };
  }
}

export async function sendEmail(
  to: string,
  subject: string,
  htmlContent: string,
): Promise<{ success: boolean; message?: string }> {
  try {
    const SMTP_HOST = process.env.SMTP_HOST;
    const SMTP_PORT = process.env.SMTP_PORT
      ? Number(process.env.SMTP_PORT)
      : undefined;
    const SMTP_USER = process.env.SMTP_USER;
    const SMTP_PASS = process.env.SMTP_PASS;
    const SMTP_SECURE =
      (process.env.SMTP_SECURE || "false").toLowerCase() === "true";
    const RESEND_API_KEY = process.env.RESEND_API_KEY;

    const fromAddress =
      process.env.EMAIL_FROM ||
      (SMTP_USER ? SMTP_USER : "Vehicle Reports <no-reply@localhost>");

    console.log(
      `[EMAIL DEBUG] SMTP_HOST=${SMTP_HOST ? 'configured' : 'missing'} SMTP_USER=${SMTP_USER ? 'configured' : 'missing'} RESEND_API_KEY=${RESEND_API_KEY ? 'configured' : 'missing'}`,
    );

    if (SMTP_HOST) {
      try {
        // @ts-ignore - optional dependency, install Nodemailer to enable SMTP sending
        const nodemailer = (await import("nodemailer")) as any;
        const transportOptions: any = {
          host: SMTP_HOST,
          port: SMTP_PORT || 587,
          secure: SMTP_SECURE,
          auth: { user: SMTP_USER, pass: SMTP_PASS },
          tls: {
            rejectUnauthorized: false,
          },
        };

        const transporter = nodemailer.createTransport(transportOptions);

        const info = await transporter.sendMail({
          from: fromAddress,
          to,
          subject,
          html: htmlContent,
        });

        console.log(
          "Email sent via SMTP:",
          info && (info.messageId || info.response),
        );

        try {
          await pool.execute(
            "INSERT INTO email_outbox (to_address, subject, body, provider, preview_url, status, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())",
            [to, subject, htmlContent, "smtp", null, "sent"],
          );
        } catch (e) {
          console.error("Failed to persist sent email to outbox (SMTP):", e);
        }

        return { success: true };
      } catch (smtpErr: any) {
        console.error("SMTP send failed:", smtpErr);
        try {
          await pool.execute(
            "INSERT INTO email_failures (to_address, subject, body, error_message, created_at) VALUES (?, ?, ?, ?, NOW())",
            [to, subject, htmlContent, String(smtpErr.message || smtpErr)],
          );
        } catch (e) {
          console.error("Failed to log SMTP email failure to DB:", e);
        }

        try {
          await pool.execute(
            "INSERT INTO email_outbox (to_address, subject, body, provider, preview_url, status, error_message, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, NOW())",
            [
              to,
              subject,
              htmlContent,
              "smtp",
              null,
              "failed",
              String(smtpErr.message || smtpErr),
            ],
          );
        } catch (e) {
          console.error("Failed to persist failed email to outbox (SMTP):", e);
        }

        if (RESEND_API_KEY) {
          console.log("Attempting fallback via Resend API...");
          return await sendEmailWithResend(to, subject, htmlContent, fromAddress);
        }

        return {
          success: false,
          message: "SMTP sending failed and no Resend API key is configured.",
        };
      }
    }

    if (RESEND_API_KEY) {
      return await sendEmailWithResend(to, subject, htmlContent, fromAddress);
    }

    return {
      success: false,
      message:
        "No email provider configured. Set SMTP_HOST/SMTP_USER/SMTP_PASS or RESEND_API_KEY.",
    };
  } catch (err: any) {
    console.error("Error sending email:", err);
    return {
      success: false,
      message: err.message || "Unknown error sending email",
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const lang = data.locale || data.lang || "en";

    if (data.type === "order_notification") {
      const html = generateOrderNotificationEmail(data, lang);
      const subject =
        getTranslationsForLang(lang)["email_new_order_subject"] ||
        `New Order: ${data.orderNumber}`;
      const result = await sendEmail(ADMIN_EMAIL, subject, html);
      return result.success
        ? NextResponse.json(result)
        : NextResponse.json(result, { status: 500 });
    }

    if (data.type === "order_confirmation") {
      const html = generateOrderConfirmationEmail(data, lang);
      const subject =
        getTranslationsForLang(lang)["email_order_confirmed_subject"] ||
        `Order Confirmation - ${data.orderNumber}`;
      const result = await sendEmail(data.customerEmail, subject, html);
      return result.success
        ? NextResponse.json(result)
        : NextResponse.json(result, { status: 500 });
    }

    // Convenience: send both admin notification and customer confirmation in a single request
    if (data.type === "order_both") {
      try {
        const adminHtml = generateOrderNotificationEmail(data, lang);
        const adminSubject =
          getTranslationsForLang(lang)["email_new_order_subject"] ||
          `New Order: ${data.orderNumber}`;
        const customerHtml = generateOrderConfirmationEmail(data, lang);
        const customerSubject =
          getTranslationsForLang(lang)["email_order_confirmed_subject"] ||
          `Order Confirmation - ${data.orderNumber}`;

        const adminRes = await sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
        const customerRes = await sendEmail(
          data.customerEmail,
          customerSubject,
          customerHtml,
        );

        if (!adminRes.success || !customerRes.success) {
          return NextResponse.json(
            {
              success: false,
              message: 'One or more order emails failed to send.',
              admin: adminRes,
              customer: customerRes,
            },
            { status: 500 },
          );
        }

        return NextResponse.json({
          success: true,
          admin: adminRes,
          customer: customerRes,
        });
      } catch (err: any) {
        console.error("Error sending order_both emails:", err);
        return NextResponse.json(
          { success: false, message: "Failed to send order emails" },
          { status: 500 },
        );
      }
    }

    if (data.type === "vehicle_registration_both") {
      try {
        const adminHtml = generateVehicleRegistrationNotificationEmail(data, lang);
        const adminSubject =
          getTranslationsForLang(lang)["email_new_registration_subject"] ||
          `New Vehicle Registration: ${data.registrationNumber}`;
        const customerHtml = generateVehicleRegistrationConfirmationEmail(data, lang);
        const customerSubject =
          getTranslationsForLang(lang)["email_registration_received_subject"] ||
          `Registration Received - ${data.registrationNumber}`;

        const adminRes = await sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
        const customerRes = await sendEmail(
          data.ownerEmail,
          customerSubject,
          customerHtml,
        );

        if (!adminRes.success || !customerRes.success) {
          return NextResponse.json(
            {
              success: false,
              message: 'One or more vehicle registration emails failed to send.',
              admin: adminRes,
              customer: customerRes,
            },
            { status: 500 },
          );
        }

        return NextResponse.json({
          success: true,
          admin: adminRes,
          customer: customerRes,
        });
      } catch (err: any) {
        console.error("Error sending vehicle_registration_both emails:", err);
        return NextResponse.json(
          { success: false, message: "Failed to send vehicle registration emails" },
          { status: 500 },
        );
      }
    }

    if (data.type === "contact_form") {
      const html = generateContactFormEmail(data, lang);
      const subject =
        getTranslationsForLang(lang)["email_contact_subject"] ||
        `Contact Form: ${data.subject}`;
      const result = await sendEmail(ADMIN_EMAIL, subject, html);
      return result.success
        ? NextResponse.json(result)
        : NextResponse.json(result, { status: 500 });
    }

    if (data.type === "review_notification") {
      const html = generateReviewNotificationEmail(data, lang);
      const subject =
        getTranslationsForLang(lang)["email_review_subject"] ||
        `New Review from ${data.name}`;
      const result = await sendEmail(ADMIN_EMAIL, subject, html);
      return result.success
        ? NextResponse.json(result)
        : NextResponse.json(result, { status: 500 });
    }

    if (data.type === "payment_success") {
      try {
        const adminHtml = generatePaymentSuccessAdminEmail(data);
        const adminSubject = `Payment Successful! - ${data.orderNumber}`;
        const customerHtml = generatePaymentSuccessCustomerEmail(data);
        const customerSubject = `Order Confirmed: Your Report is processing! [${data.orderNumber}]`;

        const adminRes = await sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
        const customerRes = await sendEmail(
          data.customerEmail,
          customerSubject,
          customerHtml,
        );

        if (!adminRes.success || !customerRes.success) {
          return NextResponse.json(
            {
              success: false,
              message: 'One or more payment success emails failed to send.',
              admin: adminRes,
              customer: customerRes,
            },
            { status: 500 },
          );
        }

        return NextResponse.json({
          success: true,
          admin: adminRes,
          customer: customerRes,
        });
      } catch (err: any) {
        console.error("Error sending payment_success emails:", err);
        return NextResponse.json(
          { success: false, message: "Failed to send payment success emails" },
          { status: 500 },
        );
      }
    }

    return NextResponse.json(
      { success: false, message: "Invalid email type" },
      { status: 400 },
    );
  } catch (err) {
    console.error("Error in send-email route:", err);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 },
    );
  }
}
