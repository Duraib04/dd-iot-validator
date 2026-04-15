// Vercel API Route: Send Email Notification
// POST /api/send-email

import { emailConfig, supabase } from './config.js';

const RESEND_API_URL = 'https://api.resend.com/emails';
const SENDGRID_API_URL = 'https://api.sendgrid.com/v3/mail/send';
const MAILGUN_API_URL = 'https://api.mailgun.net/v3/{{domain}}/messages';

async function sendViaResend(to, subject, htmlContent) {
  const response = await fetch(RESEND_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${emailConfig.apiKey}`,
    },
    body: JSON.stringify({
      from: 'noreply@dd-iot-validator.com',
      to,
      subject,
      html: htmlContent,
    }),
  });
  return response.json();
}

async function sendViaSendGrid(to, subject, htmlContent) {
  const response = await fetch(SENDGRID_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${emailConfig.apiKey}`,
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: to }] }],
      from: { email: 'noreply@dd-iot-validator.com' },
      subject,
      content: [{ type: 'text/html', value: htmlContent }],
    }),
  });
  return response.json();
}

async function sendViaMailgun(to, subject, htmlContent) {
  const formData = new URLSearchParams();
  formData.append('from', 'noreply@dd-iot-validator.com');
  formData.append('to', to);
  formData.append('subject', subject);
  formData.append('html', htmlContent);

  const response = await fetch(MAILGUN_API_URL.replace('{{domain}}', emailConfig.domain), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`api:${emailConfig.apiKey}`).toString('base64')}`,
    },
    body: formData,
  });
  return response.json();
}

function generateEmailHTML(candidateData) {
  const { name, email, phone, score, decision, reason, resumeAnalysis } = candidateData;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1e40af; color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 20px; }
        .footer { background: #e5e7eb; padding: 10px; border-radius: 0 0 8px 8px; text-align: center; font-size: 12px; }
        .score-box { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 15px 0; }
        .score-item { background: white; padding: 15px; border-radius: 5px; border-left: 4px solid #1e40af; }
        .score-value { font-size: 24px; font-weight: bold; color: #1e40af; }
        .score-label { font-size: 12px; color: #666; margin-top: 5px; }
        .decision-selected { color: #16a34a; font-weight: bold; font-size: 18px; }
        .decision-training { color: #ea580c; font-weight: bold; font-size: 18px; }
        .decision-rejected { color: #dc2626; font-weight: bold; font-size: 18px; }
        .skill-tag { display: inline-block; background: #dbeafe; color: #1e40af; padding: 4px 8px; margin: 3px; border-radius: 3px; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>DD IoT Solutions - Candidate Evaluation Report</h1>
        </div>
        <div class="content">
          <h2>Candidate Information</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>

          <h2>Evaluation Results</h2>
          <div class="score-box">
            <div class="score-item">
              <div class="score-value">${score.hardware}</div>
              <div class="score-label">Hardware Knowledge</div>
            </div>
            <div class="score-item">
              <div class="score-value">${score.programming}</div>
              <div class="score-label">Programming Skills</div>
            </div>
            <div class="score-item">
              <div class="score-value">${score.communication}</div>
              <div class="score-label">Communication</div>
            </div>
            <div class="score-item">
              <div class="score-value">${score.problemSolving}</div>
              <div class="score-label">Problem Solving</div>
            </div>
          </div>

          <h2>Final Score</h2>
          <div class="score-item">
            <div class="score-value">${score.final}/100</div>
            <div class="score-label">Overall Performance</div>
          </div>

          <h2>Decision</h2>
          <p class="decision-${decision.toLowerCase()}">${decision}</p>
          <p><strong>Reason:</strong> ${reason}</p>

          <h2>Resume Analysis</h2>
          <p><strong>Summary:</strong> ${resumeAnalysis.summary}</p>
          <p><strong>Years of Experience:</strong> ${resumeAnalysis.experience}</p>
          <p><strong>Skills:</strong></p>
          <div>
            ${resumeAnalysis.skills.map((skill) => `<span class="skill-tag">${skill}</span>`).join('')}
          </div>

          <p style="margin-top: 30px; color: #666; font-size: 12px;">
            This is an automated evaluation. Please review the candidate's full profile for additional context.
          </p>
        </div>
        <div class="footer">
          <p>DD IoT Solutions Candidate Validator © 2024</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { candidateId, candidateData } = req.body;

    if (!candidateId || !candidateData) {
      return res.status(400).json({ error: 'Missing candidate data' });
    }

    // Only send if score > 30
    if (candidateData.score.final <= 30) {
      return res.status(200).json({
        success: true,
        message: 'Email not sent (score below threshold)',
        sent: false,
      });
    }

    const adminEmail = emailConfig.adminEmail || process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      return res.status(400).json({ error: 'Admin email not configured' });
    }

    const subject = `DD IoT - Candidate Selected: ${candidateData.name} (Score: ${candidateData.score.final})`;
    const htmlContent = generateEmailHTML(candidateData);

    let emailResult;
    const emailService = emailConfig.service || process.env.EMAIL_SERVICE || 'resend';

    switch (emailService.toLowerCase()) {
      case 'resend':
        emailResult = await sendViaResend(adminEmail, subject, htmlContent);
        break;
      case 'sendgrid':
        emailResult = await sendViaSendGrid(adminEmail, subject, htmlContent);
        break;
      case 'mailgun':
        emailResult = await sendViaMailgun(adminEmail, subject, htmlContent);
        break;
      default:
        return res.status(400).json({ error: `Unsupported email service: ${emailService}` });
    }

    // Log email in database
    await supabase.from('email_logs').insert([
      {
        candidate_id: candidateId,
        recipient: adminEmail,
        subject,
        sent_at: new Date().toISOString(),
        service: emailService,
        status: 'sent',
      },
    ]);

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
      sent: true,
      data: {
        service: emailService,
        recipient: adminEmail,
        candidateName: candidateData.name,
      },
    });
  } catch (error) {
    console.error('Email send error:', error);

    // Log failed email
    if (req.body?.candidateId) {
      await supabase.from('email_logs').insert([
        {
          candidate_id: req.body.candidateId,
          recipient: emailConfig.adminEmail || process.env.ADMIN_EMAIL,
          subject: 'Failed to send',
          sent_at: new Date().toISOString(),
          service: emailConfig.service || process.env.EMAIL_SERVICE || 'resend',
          status: 'failed',
          error_message: error.message,
        },
      ]);
    }

    return res.status(500).json({
      error: error.message || 'Failed to send email',
      service: emailConfig.service || process.env.EMAIL_SERVICE || 'resend',
    });
  }
}
