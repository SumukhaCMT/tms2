import mjml2html from "mjml";

interface SubscriptionReminderProps {
  organizationName: string;
  planName: string;
  expiryDate: string;
  daysLeft: number;
  renewLink: string;
}

export const subscriptionReminderTemplate = ({
  organizationName,
  planName,
  expiryDate,
  daysLeft,
  renewLink,
}: SubscriptionReminderProps) => {
  const { html } = mjml2html(`
<mjml>
  <mj-head>
    <mj-title>Subscription Renewal Reminder</mj-title>
    <mj-attributes>
      <mj-all font-family="Inter, Arial, sans-serif" />
      <mj-text font-size="16px" line-height="26px" color="#333333" />
    </mj-attributes>
  </mj-head>

  <mj-body background-color="#f5f5f5">

    <mj-section background-color="#ffffff" padding="40px">

      <mj-column>

        <mj-text font-size="30px" font-weight="bold">
          Hello ${organizationName},
        </mj-text>

        <mj-text>
          This is a friendly reminder that your
          <b>${planName}</b> subscription will expire in
          <b>${daysLeft} day${daysLeft > 1 ? "s" : ""}</b>.
        </mj-text>

        <mj-text>
          <b>Expiry Date:</b> ${expiryDate}
        </mj-text>

        <mj-text>
          To avoid any interruption in your Temple Management System,
          please renew your subscription before the expiry date.
        </mj-text>

        <mj-button
          background-color="#2563eb"
          color="#ffffff"
          href="${renewLink}"
        >
          Renew Subscription
        </mj-button>

        <mj-divider />

        <mj-text color="#777777">
          If you have already renewed your subscription, you can safely ignore this email.
        </mj-text>

        <mj-text>
          Regards,<br/>
          TMS Support Team
        </mj-text>

      </mj-column>

    </mj-section>

    <mj-section>
      <mj-column>
        <mj-text align="center" color="#999999" font-size="12px">
          © 2026 Temple Management SaaS. All Rights Reserved.
        </mj-text>
      </mj-column>
    </mj-section>

  </mj-body>
</mjml>
`);

  return html;
};