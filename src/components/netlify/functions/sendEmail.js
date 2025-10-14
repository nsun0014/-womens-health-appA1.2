const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  }

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    }
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method Not Allowed' }),
    }
  }

  try {
    const { to, subject, message, attachment } = JSON.parse(event.body)

    if (!to || !subject || !message) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing required fields' }),
      }
    }

    const emailData = {
      to: to,
      from: {
        email: 'nsun0014@student.monash.edu',
        name: 'WomenCare Platform',
      },
      subject: subject,
      text: message,
      html: `<div style="font-family: Arial, sans-serif; padding: 20px;">
        <p><strong>From:</strong> WomenCare Platform</p>
        <p><strong>To:</strong> ${to}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr style="margin: 20px 0; border: 1px solid #ddd;">
        <div style="margin-top: 20px;">
          <strong>Message:</strong>
          <p>${message.replace(/\n/g, '<br>')}</p>
        </div>
        <hr style="margin: 20px 0; border: 1px solid #ddd;">
        <p style="color: #888; font-size: 12px;">Sent from WomenCare Platform</p>
      </div>`,
    }

    if (attachment && attachment.content && attachment.filename) {
      emailData.attachments = [
        {
          content: attachment.content,
          filename: attachment.filename,
          type: attachment.type || 'application/octet-stream',
          disposition: 'attachment',
        },
      ]
    }

    await sgMail.send(emailData)

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Email sent successfully',
      }),
    }
  } catch (error) {
    console.error('Error sending email:', error)

    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Failed to send email',
        details: error.message,
      }),
    }
  }
}
