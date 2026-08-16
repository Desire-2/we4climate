"""
HTML email templates for volunteer application status notifications.
"""


def _base_wrapper(header_color: str, header_label: str, title: str, body_html: str) -> str:
    return f"""\
<html>
<body style="margin:0;padding:0;background-color:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;padding:24px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"
           style="max-width:580px;background:#ffffff;border-radius:20px;overflow:hidden;border:1px solid #e2e8f0;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
      <tr>
        <td style="background:{header_color};padding:28px 32px;">
          <span style="color:rgba(255,255,255,0.7);font-size:11px;letter-spacing:3px;text-transform:uppercase;font-weight:700;">We4Climate</span>
          <h1 style="margin:6px 0 0;color:#ffffff;font-size:22px;font-weight:800;line-height:1.3;">{title}</h1>
        </td>
      </tr>
      <tr>
        <td style="padding:32px;">
          {body_html}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 32px;background:#f1f5f9;border-top:1px solid #e2e8f0;">
          <p style="margin:0;color:#94a3b8;font-size:11px;text-align:center;">
            Leonard Regeneration Center &middot; We4Climate International Volunteer Program<br/>
            <a href="mailto:info@we4climate.org" style="color:#059669;">info@we4climate.org</a>
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>"""


def volunteer_approved(volunteer_name: str, programs: str, arrival: str, departure: str, message: str = "") -> tuple[str, str]:
    """Return (subject, html) for an approval email."""
    programs_html = f'<p style="color:#374151;margin:8px 0 0;">{programs}</p>' if programs else ""

    extra_message = ""
    if message:
        extra_message = f"""
        <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;color:#065f46;font-size:13px;font-weight:600;">A note from our team:</p>
          <p style="margin:8px 0 0;color:#047857;font-size:13px;line-height:1.6;">{message}</p>
        </div>"""

    body = f"""
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">
      Dear <strong>{volunteer_name}</strong>,
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      We are thrilled to inform you that your volunteer application has been
      <strong style="color:#059669;">approved</strong>!
    </p>

    <div style="background:#f0fdf4;border-radius:16px;padding:20px 24px;margin:24px 0;border:1px solid #bbf7d0;">
      <p style="margin:0;color:#065f46;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Next Steps</p>
      <table role="presentation" style="margin:12px 0 0;width:100%;font-size:13px;color:#374151;">
        <tr>
          <td style="padding:6px 0;color:#6b7280;width:120px;">Programs</td>
          <td style="padding:6px 0;font-weight:600;">{programs or "—"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;">Arrival</td>
          <td style="padding:6px 0;font-weight:600;">{arrival or "TBD"}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#6b7280;">Departure</td>
          <td style="padding:6px 0;font-weight:600;">{departure or "TBD"}</td>
        </tr>
      </table>
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      Our coordination team will reach out to you shortly with your detailed
      onboarding guide, accommodation arrangements, and travel logistics.
      Please ensure your passport and travel documents are up to date.
    </p>

    {extra_message}

    <p style="color:#374151;font-size:14px;line-height:1.7;margin:20px 0 0;">
      We look forward to welcoming you to the
      <strong>Leonard Regeneration Center</strong> and making a meaningful
      impact together.
    </p>

    <p style="color:#374151;font-size:14px;margin:24px 0 0;">
      Warm regards,<br/>
      <strong style="color:#065f46;">The We4Climate Team</strong>
    </p>"""

    subject = f"🎉 Application Approved — Welcome to We4Climate, {volunteer_name}!"
    return subject, _base_wrapper("#065f46", "APPROVED", "Your Application Has Been Approved!", body)


def volunteer_rejected(volunteer_name: str, reason: str = "", message: str = "") -> tuple[str, str]:
    """Return (subject, html) for a rejection email."""
    reason_html = ""
    if reason:
        reason_html = f"""
        <div style="background:#fef2f2;border-radius:16px;padding:20px 24px;margin:20px 0;border:1px solid #fecaca;">
          <p style="margin:0;color:#991b1b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Reason</p>
          <p style="margin:8px 0 0;color:#b91c1c;font-size:13px;line-height:1.6;">{reason}</p>
        </div>"""

    personal_note = ""
    if message:
        personal_note = f"""
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">Feedback from our team:</p>
          <p style="margin:8px 0 0;color:#b45309;font-size:13px;line-height:1.6;">{message}</p>
        </div>"""

    body = f"""
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">
      Dear <strong>{volunteer_name}</strong>,
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      Thank you for taking the time to apply for the We4Climate international
      volunteer program at the Leonard Regeneration Center. We truly appreciate
      your interest in contributing to our mission.
    </p>

    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      After careful review, we regret to inform you that we are <strong>unable to
      move forward</strong> with your application at this time. This decision
      does not reflect on your abilities or passion — our selection process is
      highly competitive and we must make difficult choices.
    </p>

    {reason_html}
    {personal_note}

    <div style="background:#f0f9ff;border-radius:16px;padding:20px 24px;margin:24px 0;border:1px solid #bae6fd;">
      <p style="margin:0;color:#0369a1;font-size:13px;font-weight:600;">We encourage you to:</p>
      <ul style="margin:10px 0 0;padding-left:20px;color:#374151;font-size:13px;line-height:1.8;">
        <li>Apply again in a future cohort when new positions open</li>
        <li>Explore our community action and tree-planting programs</li>
        <li>Follow us for updates on new volunteer opportunities</li>
      </ul>
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      We wish you the very best in your future endeavors and hope our paths
      will cross again.
    </p>

    <p style="color:#374151;font-size:14px;margin:24px 0 0;">
      With gratitude,<br/>
      <strong style="color:#065f46;">The We4Climate Team</strong>
    </p>"""

    subject = f"Update on Your Volunteer Application — We4Climate"
    return subject, _base_wrapper("#991b1b", "APPLICATION UPDATE", "Update on Your Volunteer Application", body)


def volunteer_suspended(volunteer_name: str, reason: str = "", message: str = "") -> tuple[str, str]:
    """Return (subject, html) for a suspension notice."""
    reason_html = ""
    if reason:
        reason_html = f"""
        <div style="background:#fff7ed;border-radius:16px;padding:20px 24px;margin:20px 0;border:1px solid #fed7aa;">
          <p style="margin:0;color:#9a3412;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Reason</p>
          <p style="margin:8px 0 0;color:#c2410c;font-size:13px;line-height:1.6;">{reason}</p>
        </div>"""

    extra = ""
    if message:
        extra = f"""
        <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;color:#92400e;font-size:13px;font-weight:600;">Details:</p>
          <p style="margin:8px 0 0;color:#b45309;font-size:13px;line-height:1.6;">{message}</p>
        </div>"""

    body = f"""
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">
      Dear <strong>{volunteer_name}</strong>,
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      We are writing to inform you that your participation in the We4Climate
      volunteer program has been <strong style="color:#ea580c;">temporarily
      suspended</strong>.
    </p>

    {reason_html}
    {extra}

    <div style="background:#f8fafc;border-radius:16px;padding:20px 24px;margin:24px 0;border:1px solid #e2e8f0;">
      <p style="margin:0;color:#475569;font-size:13px;line-height:1.7;">
        During this period, please refrain from representing the program in any
        official capacity. If you believe this was done in error, or if you
        would like to discuss this matter further, please contact our team at
        <a href="mailto:info@we4climate.org" style="color:#059669;">info@we4climate.org</a>.
      </p>
    </div>

    <p style="color:#374151;font-size:14px;margin:24px 0 0;">
      Sincerely,<br/>
      <strong style="color:#065f46;">The We4Climate Team</strong>
    </p>"""

    subject = f"Important: Your Volunteer Status Has Been Updated — We4Climate"
    return subject, _base_wrapper("#9a3412", "ACTION REQUIRED", "Your Volunteer Status Has Changed", body)


def volunteer_completed(volunteer_name: str, hours: float, programs: str, message: str = "") -> tuple[str, str]:
    """Return (subject, html) for a program completion thank-you."""
    extra = ""
    if message:
        extra = f"""
        <div style="background:#ecfdf5;border-left:4px solid #10b981;border-radius:0 12px 12px 0;padding:16px 20px;margin:20px 0;">
          <p style="margin:0;color:#065f46;font-size:13px;font-weight:600;">From our team:</p>
          <p style="margin:8px 0 0;color:#047857;font-size:13px;line-height:1.6;">{message}</p>
        </div>"""

    body = f"""
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:0;">
      Dear <strong>{volunteer_name}</strong>,
    </p>
    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      Congratulations on successfully completing your volunteer program with
      We4Climate at the Leonard Regeneration Center!
    </p>

    <div style="background:#f0fdf4;border-radius:16px;padding:20px 24px;margin:24px 0;border:1px solid #bbf7d0;text-align:center;">
      <p style="margin:0;color:#065f46;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:1.5px;">Your Impact</p>
      <p style="margin:10px 0 0;color:#059669;font-size:36px;font-weight:900;">{hours:.1f}</p>
      <p style="margin:4px 0 0;color:#6b7280;font-size:13px;">hours contributed</p>
      {"<p style='margin:8px 0 0;color:#374151;font-size:13px;'>Programs: <strong>" + programs + "</strong></p>" if programs else ""}
    </div>

    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      Your dedication and hard work have made a real difference in our
      communities. We will be issuing your certificate of participation and
      volunteer hours documentation shortly.
    </p>

    {extra}

    <p style="color:#374151;font-size:14px;line-height:1.7;margin:16px 0 0;">
      We would love to stay connected — consider joining our alumni network
      and future programs. Your experience and skills are always welcome here.
    </p>

    <p style="color:#374151;font-size:14px;margin:24px 0 0;">
      With deep appreciation,<br/>
      <strong style="color:#065f46;">The We4Climate Team</strong>
    </p>"""

    subject = f"🌟 Thank You for Completing Your Volunteer Program — We4Climate!"
    return subject, _base_wrapper("#065f46", "WELL DONE", "Congratulations — You Did It!", body)
