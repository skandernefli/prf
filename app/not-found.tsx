import Link from "next/link";

export default function NotFound() {
  return (
    <main className="site-message">
      <p className="site-message-code">404</p>
      <h1>This page isn&apos;t part of the thread.</h1>
      <p>The address may be outdated or the page may have moved.</p>
      <Link className="site-message-link" href="/">
        Return to the portfolio
      </Link>
    </main>
  );
}
