import Link from "next/link";

export type ListingCardData = {
  id: string;
  title: string;
  type: string;
  platform: string | null;
  listingPriceCents: number;
  currency: string;
  createdAt: string;
  thumbUrl: string | null;
};

function formatMoney(cents: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(cents / 100);
}

export function ListingCard({ l }: { l: ListingCardData }) {
  return (
    <Link className="card" href={`/listings/${l.id}`} style={{display:"block"}}>
      <img
        className="thumb"
        src={l.thumbUrl ?? "https://images.unsplash.com/photo-1598550482040-5f8b3e1ff0d7?auto=format&fit=crop&w=1200&q=60"}
        alt=""
      />
      <div className="card pad">
        <div style={{display:"flex", justifyContent:"space-between", gap:10, alignItems:"flex-start"}}>
          <div>
            <div style={{fontWeight:700, lineHeight:1.15}}>{l.title}</div>
            <div className="small">{l.type}{l.platform ? ` • ${l.platform}` : ""}</div>
          </div>
          <div style={{fontWeight:800}}>{formatMoney(l.listingPriceCents, l.currency)}</div>
        </div>
      </div>
    </Link>
  );
}
