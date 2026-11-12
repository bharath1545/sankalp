# Sankalp'26

Website for **Sankalp'26**, the 3rd edition of AJIET Mangaluru's national-level 24-hour hackathon, organised by the IEEE Student Branch with the Department of ECE.

Static site, no build step. Hosted on Vercel. One serverless function emails team registrations to the organiser.

## Structure

```
index.html              all pages as <section data-view="...">
api/submit.js           Vercel function: validates the form, emails it via Resend
assets/
  css/style.css         theme tokens in :root, then layout and responsive rules
  js/config.js          event dates (single source of truth)
  js/script.js          hash router, registration form, countdown
  img/logos/            AJIET, IEEE, Sankalp logos
  img/sponsors/         sponsor logos
docs/
  VERCEL_EMAIL_SETUP.md environment variables for email delivery
  content.docx          source copy for the event text
```

## Changing event dates

Edit `assets/js/config.js` only. Dates in the page and the countdown follow it.

The `<meta name="description">` in `index.html` is plain text for search engines, so update its dates by hand.

## Run locally

Page and styling only:

```
python -m http.server 8080
```

Open http://127.0.0.1:8080/index.html. The registration form needs the serverless function, so to test it use the Vercel CLI:

```
npx vercel dev
```

Email delivery needs `RESEND_API_KEY`, `RESEND_FROM_EMAIL` and `REGISTRATION_EMAIL`. See `docs/VERCEL_EMAIL_SETUP.md`. Never put the API key in browser code.

## Contributing

1. Fork, then branch from `main`.
2. Keep changes small and focused, one topic per commit.
3. Check the page at desktop width and at 420 px, and test the form with `vercel dev` when touching `api/submit.js` or the form code.
4. Open a pull request describing what changed and why.
