import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "GameSwap | Gaming Classifieds (MVP)",
  description: "Sell games, consoles, CDs & DVDs with PriceCharting price-match and disc-back scratch photos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container">
          <header className="nav">
            <Link href="/" className="brand">
              <span style={{fontSize:18}}>🎮</span>
              <span>GameSwap</span>
              <span className="pill">PriceCharting price-match</span>
            </Link>

            <nav style={{display:"flex", gap:10, alignItems:"center"}}>
              <Link className="btn" href="/browse">Browse</Link>
              <Link className="btn primary" href="/create">Create listing</Link>
            </nav>
          </header>

          <main>{children}</main>

          <footer style={{marginTop:18}}>
            <div className="card pad">
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
                <p className="small" style={{margin:0}}>
                  MVP demo. Disc/CD/DVD listings must include a <b>Disc Back</b> photo.
                </p>
                <p className="small" style={{margin:0}}>
                  Tip: Press <span className="kbd">Ctrl</span>+<span className="kbd">K</span> in your browser to focus the address bar 😉
                </p>
              </div>
              <div className="hr" />
              <div className="ad">
                <p className="adTitle">Ad slot (footer)</p>
                <p className="adText">Keep ads in only a few areas so the marketplace stays usable and clean.</p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
