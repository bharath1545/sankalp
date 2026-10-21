# Vercel registration email setup

The registration endpoint sends team details and the abstract attachment to the address in `REGISTRATION_EMAIL`. The Resend API key is only read by the serverless function and must never be added to browser JavaScript.

## Required Vercel environment variables

In **Project Settings → Environment Variables**, add:

- `REGISTRATION_EMAIL` — `bharathbhat87@gmail.com`
- `RESEND_API_KEY` — a newly-created Resend API key, entered as the variable **value** (not its name)
- `RESEND_FROM_EMAIL` — a sender address on a domain verified in Resend, for example `Sankalp Registration <registrations@your-verified-domain>`

Apply them to Production and redeploy after saving.

If an API key was entered as the environment variable name or exposed in a screenshot, revoke it in Resend and create a new one before deployment. Do not share the replacement key.

Resend requires the sender domain to be verified. After setup, test with a real registration and confirm the email and PDF arrive at the registration inbox.

Abstract uploads are limited to 3 MB so the request fits within Vercel's function request-size limit.
