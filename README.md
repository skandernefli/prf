# Skander Nefli Portfolio

Production portfolio built with Next.js 16, React, TypeScript, GSAP, and
Tailwind CSS.

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Run the production checks before deployment:

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm build
pnpm audit --prod
```

## Production deployment

The canonical site origin is `https://www.skandernefli.eu`. The app redirects
requests for `skandernefli.eu` to the `www` host and sets production security
headers. Configure both domains in Vercel and point their DNS records to the
values Vercel provides. Confirm Vercel reports the domain as valid and HTTPS
is active before announcing the site.

The production build is `pnpm build`; Vercel should use the repository's
`pnpm-lock.yaml` and the `pnpm` package manager. No runtime secrets are
required by the site. To enable Google Search Console verification, add the
verification token as `GOOGLE_SITE_VERIFICATION` in the Vercel Production
environment, redeploy, then submit
`https://www.skandernefli.eu/sitemap.xml` in Search Console.

The app publishes:

- `/robots.txt` and `/sitemap.xml`
- Canonical, Open Graph, and Twitter metadata
- Generated Open Graph, browser, and Apple touch icons
- Person and WebSite structured data
- A branded 404 and recoverable error boundary
- A privacy notice at `/privacy`

The `/test` route is excluded from indexing.

## Privacy and analytics

No analytics tracker or advertising technology is currently installed, so
there is no analytics consent banner. The privacy notice describes the
current state and explains that disclosures and consent controls must be
updated before any analytics is enabled.

Umami is not deployed or configured by this repository. A self-hosted Umami
installation needs its own running application and PostgreSQL database; the
portfolio's Vercel deployment alone is not that service. Umami documents
deployments on Vercel with PostgreSQL providers such as Neon. Those providers
may offer free tiers, but quotas, eligibility, and terms can change; confirm
that a setup remains free and does not request payment details before using
it. Do not send analytics data until the service is configured, its retention
period and hosting/logging behavior are understood, and any legally required
consent is implemented.

Umami does not store raw IP addresses in standard analytics records, but it
processes IP addresses transiently for approximate location and uses IP plus
browser user-agent to derive a rotating pseudonymous session identifier.
Infrastructure or security logs can separately process IP addresses. Its
self-hosted database retains data until it is deleted, so establish and
automate an appropriate retention period. Never pass names, email addresses,
full clicked URLs, or other identifying details as event properties. If added,
analytics needs a clear opt-in/withdrawal path where required, updated privacy
and cookie disclosures, and CSP allowances limited to the configured Umami
host.

## Security and operations

Production responses include a Content Security Policy and standard browser
security headers. The policy permits inline scripts and styles because the
Next.js runtime and GSAP motion use them; keep dependencies current and do not
add third-party scripts without reviewing and updating the policy. HTTPS
certificates, DNS, deployment logs, and rollback controls are managed through
Vercel. The source repository is the recovery copy; this site currently has no
application database to back up.

The site supports reduced-motion preferences and keyboard operation of the
mobile navigation. This is not a substitute for a complete WCAG 2.2 AA audit:
verify contrast, screen-reader behavior, keyboard flows, and mobile layouts
before launch.

A separate Terms of Use page is not included because the site currently has
no accounts, transactions, or user-submitted content. Reassess if those
features are introduced.
