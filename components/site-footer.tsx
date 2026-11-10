import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer" aria-label="Site information">
      <span>© Skander Nefli</span>
      <nav aria-label="Footer navigation">
        <Link href="/privacy">Privacy</Link>
        <a href="mailto:skander.nefli@gmail.com">Contact</a>
        <a
          href="https://www.linkedin.com/in/skander-nefli/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </a>
      </nav>
    </footer>
  );
}
