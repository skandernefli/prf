import { ContactButtons } from "@/components/portfolio/contact-buttons";

export function FooterSection() {
  return (
    <section
      className="footer-finale"
      id="footer"
      aria-labelledby="footer-title"
      data-thread-anchor="footer.section"
      data-thread-label="Contact · section"
    >
      <div className="footer-stage">
        <div className="footer-copy">
          <h2
            className="footer-statement"
            id="footer-title"
            data-thread-anchor="footer.statement"
            data-thread-label="Contact · statement"
          >
            <span>JUDGE ME</span>
            <span>IN CONVERSATION.</span>
          </h2>
          <span
            className="footer-pull"
            data-thread-anchor="footer.pull"
            data-thread-label="Contact · pull quote"
          >
            LET&apos;S TALK.
          </span>
        </div>
        <ContactButtons />
      </div>
      <div className="footer-bottom">
        <a className="footer-top" href="/privacy">
          PRIVACY &amp; COOKIES
        </a>
        <a
          className="footer-top"
          href="#top"
          data-thread-anchor="footer.back"
          data-thread-label="Contact · back to top"
        >
          BACK TO TOP <span aria-hidden="true">↑</span>
        </a>
      </div>
    </section>
  );
}
