export function SiteHeader() {
  return (
    <header className="site-header">
      <a className="wordmark" href="#top" aria-label="SN home">
        SN
      </a>
      <button className="menu-button" type="button" aria-expanded="false">
        MENU
      </button>
      <nav aria-label="Primary navigation">
        <a href="#capabilities">CAPABILITIES</a>
        <a href="#projects">PROJECTS</a>
        <a href="#conclusion">ABOUT</a>
        <a href="#footer">CONTACT</a>
      </nav>
    </header>
  );
}
