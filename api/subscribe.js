const { Resend } = require('resend');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, newsletter_consent } = req.body;

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Valid email address required.' });
  }

  try {
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: 'Vaidya Aran | Brown Heart <aran@thebrownheart.health>',
      to: email,
      subject: 'Your guide is here — and one thing before you read it',
      headers: {
        'X-Entity-Ref-ID': `brownheart-guide-${Date.now()}`,
      },
      html: `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F0ECE6;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F0ECE6;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:#FAF6F0;border-top:3px solid #8B0000;">

          <tr>
            <td style="background:#1C1C1E;padding:24px 40px;">
              <div style="line-height:1;">
                <div style="font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:300;font-size:9px;letter-spacing:6px;text-transform:uppercase;color:#F2E8E0;margin-bottom:2px;">BROWN</div>
                <div style="font-family:Georgia,serif;font-size:14px;color:#E8897A;">Heart</div>
              </div>
            </td>
          </tr>

          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 18px;font-size:14px;line-height:1.72;color:#1C1C1E;">Your guide is attached.</p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.72;color:#1C1C1E;">Before you read it — one thing worth knowing. The four numbers in this guide are not exotic or experimental. They are standard blood tests. The problem is not that they do not exist. The problem is that nobody ordered them for you.</p>
              <p style="margin:0 0 18px;font-size:14px;line-height:1.72;color:#1C1C1E;">Page 4 has a GP script — exact words you can say at your next appointment. That page alone is worth the ten minutes it takes to read the rest.</p>

              <table cellpadding="0" cellspacing="0" style="margin:28px 0;">
                <tr>
                  <td style="background:#8B0000;border-radius:2px;">
                    <a href="${process.env.PDF_URL}" style="display:inline-block;padding:14px 28px;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;font-weight:800;font-size:12px;letter-spacing:1px;text-transform:uppercase;color:white;text-decoration:none;">
                      Download Your Guide
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 18px;font-size:14px;line-height:1.72;color:#1C1C1E;">Every week I send one email breaking down what is happening inside South Asian men's arteries and what to do about it. That is all this list is for.</p>
              <p style="margin:0;font-size:14px;font-style:italic;color:#1C1C1E;">— Vaidya</p>
            </td>
          </tr>

          <tr>
            <td style="background:#1C1C1E;padding:24px 40px;text-align:center;">
              <p style="margin:0;font-size:9px;color:#8B7355;letter-spacing:1px;">
                Brown Heart &nbsp;·&nbsp; thebrownheart.health &nbsp;·&nbsp; @thebrownheart on TikTok and Instagram
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    try {
      const kitHeaders = {
        'Content-Type': 'application/json',
        'X-Kit-Api-Key': process.env.KIT_API_KEY,
      };

      await fetch('https://api.kit.com/v4/subscribers', {
        method: 'POST',
        headers: kitHeaders,
        body: JSON.stringify({ email_address: email }),
      });

      const tagId = newsletter_consent ? 19576572 : 19576574;
      const tagRes = await fetch(`https://api.kit.com/v4/tags/${tagId}/subscribers`, {
        method: 'POST',
        headers: kitHeaders,
        body: JSON.stringify({ email_address: email }),
      });
      const tagData = await tagRes.json();
      console.log('Kit tag response:', JSON.stringify(tagData));
    } catch (kitErr) {
      console.error('Kit error:', kitErr);
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Something went wrong. Please try again.' });
  }
};
