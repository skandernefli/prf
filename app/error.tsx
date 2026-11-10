"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="site-message" role="alert">
      <p className="site-message-code">ERROR</p>
      <h1>Something interrupted the thread.</h1>
      <p>Please try again. If the problem continues, contact me by email.</p>
      <button className="site-message-link" type="button" onClick={reset}>
        Try again
      </button>
      <a className="site-message-link" href="mailto:skander.nefli@gmail.com">
        Email Skander
      </a>
    </main>
  );
}
