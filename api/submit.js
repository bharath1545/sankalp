const MAX_ABSTRACT_BYTES = 3 * 1024 * 1024;
const ALLOWED_FILE_TYPES = new Map([
  ['.pdf', new Set(['application/pdf', 'application/octet-stream'])],
  ['.doc', new Set(['application/msword', 'application/octet-stream'])],
  ['.docx', new Set([
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/octet-stream',
  ])],
]);

function sendJson(res, status, body) {
  return res.status(status).json(body);
}

function cleanText(value, maxLength) {
  return typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, maxLength)
    : '';
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
}

function validateSubmission(body) {
  if (cleanText(body.website, 200)) {
    return { spam: true };
  }

  const teamName = cleanText(body.teamName, 100);
  const college = cleanText(body.college, 160);
  const leaderPhone = cleanText(body.leaderPhone, 30).replace(/\D/g, '').slice(-10);
  const theme = cleanText(body.theme, 300);
  if (!teamName || !college || !/^[6-9]\d{9}$/.test(leaderPhone) || !theme) {
    return { error: 'Enter a team name, college, valid leader phone, and challenge theme.' };
  }

  if (!Array.isArray(body.members) || body.members.length !== 3) {
    return { error: 'Invalid team member details.' };
  }
  const members = body.members.map(member => ({
    name: cleanText(member?.name, 100),
    usn: cleanText(member?.usn, 20),
    email: cleanText(member?.email, 254),
  }));
  const activeMembers = members.filter(member => member.name || member.usn || member.email);
  if (!activeMembers.length) {
    return { error: 'Add the team leader details.' };
  }

  const emails = new Set();
  const usns = new Set();
  for (const member of activeMembers) {
    if (!member.name || !/^[A-Za-z0-9]{8,12}$/.test(member.usn) || !isValidEmail(member.email)) {
      return { error: 'Each team member must have a valid name, USN, and email.' };
    }
    const email = member.email.toLowerCase();
    const usn = member.usn.toUpperCase();
    if (emails.has(email) || usns.has(usn)) {
      return { error: 'Team member emails and USNs must be unique.' };
    }
    emails.add(email);
    usns.add(usn);
  }

  const attachment = body.attachment;
  if (!attachment || typeof attachment.content !== 'string') {
    return { error: 'Attach your one-page abstract.' };
  }
  const filename = cleanText(attachment.name, 150).replace(/[\\/]/g, '_');
  const extension = filename.match(/\.[^.]+$/)?.[0]?.toLowerCase();
  const contentType = cleanText(attachment.type, 100) || 'application/octet-stream';
  const allowedTypes = ALLOWED_FILE_TYPES.get(extension);
  if (!allowedTypes || !allowedTypes.has(contentType)) {
    return { error: 'Attach the abstract as a PDF, DOC, or DOCX file.' };
  }
  if (!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(attachment.content)) {
    return { error: 'The abstract file could not be read. Please select it again.' };
  }
  const file = Buffer.from(attachment.content, 'base64');
  if (!file.length || file.length > MAX_ABSTRACT_BYTES) {
    return { error: 'The abstract must be no larger than 3 MB.' };
  }

  return {
    submission: {
      teamName,
      college,
      leaderPhone,
      theme,
      members: activeMembers,
      attachment: {
        filename,
        content_type: contentType,
        content: file.toString('base64'),
      },
    },
  };
}

function formatEmail(submission) {
  const members = submission.members.map((member, index) => [
    `Member ${index + 1}`,
    `Name: ${member.name}`,
    `USN: ${member.usn}`,
    `Email: ${member.email}`,
  ].join('\n')).join('\n\n');

  return [
    'SANKALP 2026 registration',
    '',
    `Team name: ${submission.teamName}`,
    `College: ${submission.college}`,
    `Leader phone: ${submission.leaderPhone}`,
    `Challenge theme: ${submission.theme}`,
    `Team size: ${submission.members.length}`,
    '',
    members,
  ].join('\n');
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return sendJson(res, 405, { error: 'Method not allowed.' });
  }
  if (!req.body || typeof req.body !== 'object' || Array.isArray(req.body)) {
    return sendJson(res, 400, { error: 'Invalid registration data.' });
  }

  const { submission, error, spam } = validateSubmission(req.body);
  if (spam) {
    return sendJson(res, 200, { success: true });
  }
  if (error) {
    return sendJson(res, 400, { error });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const recipient = process.env.REGISTRATION_EMAIL;
  if (!apiKey || !fromEmail || !recipient) {
    console.error('Email configuration missing: set REGISTRATION_EMAIL, RESEND_API_KEY, and RESEND_FROM_EMAIL in Vercel.');
    return sendJson(res, 503, { error: 'Email delivery is not configured. Please contact the organizer.' });
  }

  try {
    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [recipient],
        reply_to: submission.members[0].email,
        subject: `SANKALP 2026 registration: ${submission.teamName}`,
        text: formatEmail(submission),
        attachments: [submission.attachment],
      }),
    });

    if (!emailResponse.ok) {
      const providerError = await emailResponse.text();
      console.error('Email provider rejected registration:', emailResponse.status, providerError);
      return sendJson(res, 502, { error: 'The email provider rejected the submission. Check the Vercel email settings and try again.' });
    }

    return sendJson(res, 200, { success: true });
  } catch (error) {
    console.error('Email provider request failed:', error);
    return sendJson(res, 502, { error: 'Could not reach the email provider. Please retry.' });
  }
};
