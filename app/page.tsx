import Link from "next/link";
import { AdSlot } from "@/components/AdSlot";

export default function HomePage() {
  return (
    <div className="grid">
      <section className="card pad" style={{gridColumn:"span 8"}}>
        <h1 className="h1">Buy & sell games, consoles, CDs and DVDs—clean UI, strict rules.</h1>
        <p className="sub">
          Listings are price-matched to PriceCharting. Disc items must include a <b>Disc Back</b> photo so buyers can check scratches.
        </p>
        <div className="hr" />
        <div style={{display:"flex", gap:10, flexWrap:"wrap"}}>
          <Link className="btn primary" href="/create">Create a listing</Link>
          <Link className="btn" href="/browse">Browse listings</Link>
        </div>
      </section>

      <aside className="card pad" style={{gridColumn:"span 4"}}>
        <h2 style={{margin:"0 0 8px"}}>Rules (MVP)</h2>
        <p className="small" style={{marginTop:0}}>
          • Disc listings require Disc Back photo<br/>
          • Condition categories: Loose, Box, Box+Manual, Box-No-Manual<br/>
          • Price must be ≤ PriceCharting matched value
        </p>
        <AdSlot title="Ad slot (header/sidebar)" text="Only a few ad placements across the site so users aren’t overwhelmed." />
      </aside>

      <section className="card pad" style={{gridColumn:"span 12"}}>
        <h2 style={{margin:"0 0 8px"}}>Quick start</h2>
        <ol className="small" style={{marginTop:0, paddingLeft:18}}>
          <li>Go to <b>Create listing</b></li>
          <li>Pick type, platform, and condition</li>
          <li>Search PriceCharting and select the correct match</li>
          <li>Paste photo URLs (Disc Back is required for disc items)</li>
          <li>Publish and view in Browse</li>
        </ol>
      </section>
    </div>
  );
}
