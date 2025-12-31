import { prisma } from "@/lib/prisma";
import { ListingCard, type ListingCardData } from "@/components/ListingCard";
import { AdSlot } from "@/components/AdSlot";

export const dynamic = "force-dynamic";

export default async function BrowsePage() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    take: 60,
    include: { media: true },
  });

  const cards: ListingCardData[] = listings.map((l) => {
    const thumb = l.media.sort((a,b)=>a.sortOrder-b.sortOrder)[0]?.url ?? null;
    return {
      id: l.id,
      title: l.title,
      type: l.type,
      platform: l.platform,
      listingPriceCents: l.listingPriceCents,
      currency: l.currency,
      createdAt: l.createdAt.toISOString(),
      thumbUrl: thumb,
    };
  });

  return (
    <div style={{marginTop:16}}>
      <div className="card pad">
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
          <div>
            <h1 className="h1" style={{margin:0}}>Browse listings</h1>
            <p className="sub" style={{margin:0}}>Clean grid, minimal ads, scratch-check photos for disc listings.</p>
          </div>

          <div className="badge">
            {cards.length} listing{cards.length === 1 ? "" : "s"}
          </div>
        </div>

        <div className="hr" />

        <div className="listingGrid">
          {cards.map((l, idx) => (
            <div key={l.id} style={{display:"grid", gap:14}}>
              <ListingCard l={l} />
              {idx === 7 && (
                <AdSlot title="Ad slot (inline)" text="Example inline ad after 8 listings (desktop-friendly, non-distracting)." />
              )}
            </div>
          ))}
        </div>

        {cards.length === 0 && (
          <p className="small" style={{marginTop:12}}>No listings yet. Create one!</p>
        )}
      </div>
    </div>
  );
}
