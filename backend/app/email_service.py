"""
Email delivery for the We4Climate platform (via Brevo).

Configuration (environment variables):
    BREVO_API_KEY            – Brevo API key (required to send)
    CONTACT_RECIPIENT_EMAIL  – inbox that receives contact-form submissions
                               (default: we4climate.rwanda@gmail.com)
    CONTACT_SENDER_EMAIL     – verified sender address in Brevo
                               (default: noreply@we4climate.org)
    CONTACT_SENDER_NAME      – sender display name (default: We4Climate)

The sender address/domain must be verified in the Brevo dashboard before
emails can be delivered.
"""
import html
import logging
import os

logger = logging.getLogger(__name__)


def _html_body(name: str, email: str, subject: str, message: str) -> str:
    """Build a clean, readable HTML email body for a contact submission.

    All user-provided values are HTML-escaped to prevent content/script
    injection in the email rendered by the recipient's mail client.
    """
    safe_name = html.escape(name)
    safe_email = html.escape(email)
    safe_subject = html.escape(subject)
    safe_message = html.escape(message)

    return f"""\
<html>
  <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:Arial,Helvetica,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0fdf4;padding:24px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #d1fae5;">
            <tr>
              <td style="background-color:#022c22;padding:20px 28px;">
                <span style="color:#6ee7b7;font-size:12px;letter-spacing:2px;text-transform:uppercase;">We4Climate</span>
                <h1 style="margin:6px 0 0;color:#ffffff;font-size:20px;">New contact form submission</h1>
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:14px;line-height:1.6;color:#1f2937;">
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;width:110px;">Name</td>
                    <td style="padding:8px 0;font-weight:600;">{safe_name}</td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;">Email</td>
                    <td style="padding:8px 0;"><a href="mailto:{safe_email}" style="color:#047857;">{safe_email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding:8px 0;color:#6b7280;">Subject</td>
                    <td style="padding:8px 0;font-weight:600;">{safe_subject}</td>
                  </tr>
                  <tr>
                    <td style="padding:16px 0 8px;color:#6b7280;vertical-align:top;">Message</td>
                    <td style="padding:16px 0 8px;white-space:pre-wrap;">{safe_message}</td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 28px;border-top:1px solid #e5e7eb;color:#9ca3af;font-size:11px;">
                Sent via the We4Climate website contact form.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
"""


def send_contact_notification(name: str, email: str, subject: str, message: str) -> bool:
    """Email a copy of a contact-form submission to the We4Climate inbox.

    Returns True when Brevo accepted the email for delivery, False otherwise.
    Never raises – callers must not fail a request because of email problems.
    """
    api_key = os.environ.get("BREVO_API_KEY", "").strip()
    recipient_email = os.environ.get(
        "CONTACT_RECIPIENT_EMAIL", "we4climate.rwanda@gmail.com"
    ).strip()
    sender_email = os.environ.get("CONTACT_SENDER_EMAIL", "noreply@we4climate.org").strip()
    sender_name = os.environ.get("CONTACT_SENDER_NAME", "We4Climate").strip()

    if not api_key:
        logger.warning("BREVO_API_KEY not configured – skipping contact email notification")
        return False

    try:
        # Lazy import so the app still boots when the SDK is missing locally.
        from brevo import Brevo
        from brevo.transactional_emails import (
            SendTransacEmailRequestReplyTo,
            SendTransacEmailRequestSender,
            SendTransacEmailRequestToItem,
        )

        client = Brevo(api_key=api_key)
        client.transactional_emails.send_transac_email(
            subject=f"[We4Climate Contact Form] {subject}",
            html_content=_html_body(name, email, subject, message),
            text_content=(
                f"New contact form submission\n"
                f"============================\n\n"
                f"Name:    {name}\n"
                f"Email:   {email}\n"
                f"Subject: {subject}\n\n"
                f"{message}\n"
            ),
            sender=SendTransacEmailRequestSender(name=sender_name, email=sender_email),
            to=[SendTransacEmailRequestToItem(email=recipient_email, name="We4Climate")],
            reply_to=SendTransacEmailRequestReplyTo(name=name, email=email),
        )
        logger.info("Contact notification email accepted for delivery (from %s)", email)
        return True
    except Exception as exc:  # never let email issues break the request
        logger.exception("Failed to send contact notification email: %s", exc)
        return False


def send_email(to: str, subject: str, html: str) -> bool:
    """Send a transactional email via Brevo.

    Returns True when Brevo accepted the email for delivery, False otherwise.
    Never raises – callers must not fail a request because of email problems.
    """
    api_key = os.environ.get("BREVO_API_KEY", "").strip()
    sender_email = os.environ.get("CONTACT_SENDER_EMAIL", "noreply@we4climate.org").strip()
    sender_name = os.environ.get("CONTACT_SENDER_NAME", "We4Climate").strip()

    if not api_key:
        logger.warning("BREVO_API_KEY not configured – skipping email to %s", to)
        return False

    try:
        from brevo import Brevo
        from brevo.transactional_emails import (
            SendTransacEmailRequestSender,
            SendTransacEmailRequestToItem,
        )

        client = Brevo(api_key=api_key)
        client.transactional_emails.send_transac_email(
            subject=subject,
            html_content=html,
            sender=SendTransacEmailRequestSender(name=sender_name, email=sender_email),
            to=[SendTransacEmailRequestToItem(email=to, name=to)],
        )
        logger.info("Email accepted for delivery to %s: %s", to, subject)
        return True
    except Exception as exc:
        logger.exception("Failed to send email to %s: %s", to, exc)
        return False
