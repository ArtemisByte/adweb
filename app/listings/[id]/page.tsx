import { prisma } from "@/lib/prisma";
import { formatMoney, isDiscBased } from "@/lib/pricecharting";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  const listing = await prisma.listing.findUnique({
    where: { id: params.id },
    include: { media: { orderBy: { sortOrder: "asc" } } },
  });

  if (!listing) {
    return (
      <div style={{marginTop:16}}>
        <div className="card pad">
          <h1 className="h1">Not found</h1>
          <Link className="btn" href="/browse">Back to browse</Link>
        </div>
      </div>
    );
  }

  const disc = isDiscBased(listing.type, listing.mediaFormat);
  const big = listing.media[0]?.url ?? null;
  const side = listing.media.slice(1, 4);
  const discBack = listing.media.find(m => m.tag === "DISC_BACK")?.url ?? null;

  return (
    <div style={{marginTop:16}}>
      <div className="card pad">
        <div style={{display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
          <div>
            <h1 className="h1" style={{margin:"0 0 6px"}}>{listing.title}</h1>
            <p className="sub" style={{margin:0}}>
              {listing.type}{listing.platform ? ` • ${listing.platform}` : ""} • {listing.conditionCategory.replaceAll("_", " ")}
            </p>
            <div style={{display:"flex", gap:8, flexWrap:"wrap", marginTop:10}}>
              {listing.matchedPriceCents != null ? (
                <span className="badge ok">Price matched: {formatMoney(listing.matchedPriceCents, listing.currency)}</span>
              ) : (
                <span className="badge warn">No PriceCharting match</span>
              )}
              {disc ? <span className="badge ok">Disc item • Scratch-check required</span> : <span className="badge">Non-disc</span>}
              <span className="badge">Seller: {listing.sellerEmail}</span>
            </div>
          </div>

          <div style={{textAlign:"right"}}>
            <div className="badge ok" style={{fontWeight:900, fontSize:14}}>
              {formatMoney(listing.listingPriceCents, listing.currency)}
            </div>
            <div className="small" style={{marginTop:8}}>
              Location: {listing.locationText ?? "—"}
            </div>
          </div>
        </div>

        <div className="hr" />

        <div className="gallery">
          <div>
            {big ? (
              <img className="bigImg" src={big} alt="" />
            ) : (
              <div className="card pad">No images provided</div>
            )}

            {disc && discBack && (
              <div style={{marginTop:12}}>
                <div style={{display:"flex", alignItems:"center", justifyContent:"space-between"}}>
                  <b>Disc Back (Scratch Check)</b>
                  <span className="badge ok">Required</span>
                </div>
                <img className="bigImg" src={discBack} alt="Disc back" style={{marginTop:8}} />
              </div>
            )}
          </div>

          <div className="sideImgs">
            {side.map((m) => (
              <img key={m.id} className="sideImg" src={m.url} alt="" />
            ))}
            {side.length === 0 && <div className="card pad small">No extra photos</div>}

            <div className="card pad">
              <b>Description</b>
              <p className="small" style={{whiteSpace:"pre-wrap"}}>{listing.description}</p>
              {listing.priceChartingId && (
                <>
                  <div className="hr" />
                  <p className="small" style={{margin:0}}>
                    Price match ID: <span className="kbd">{listing.priceChartingId}</span><br/>
                    Matched at: {listing.priceMatchedAt ? listing.priceMatchedAt.toISOString() : "—"}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="hr" />
        <Link className="btn" href="/browse">Back to browse</Link>
      </div>
    </div>
  );
}
