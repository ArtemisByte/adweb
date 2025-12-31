import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isDiscBased } from "@/lib/pricecharting";

export const dynamic = "force-dynamic";

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function GET() {
  const listings = await prisma.listing.findMany({
    orderBy: { createdAt: "desc" },
    include: { media: { orderBy: { sortOrder: "asc" } } },
    take: 60,
  });
  return NextResponse.json(listings);
}

export async function POST(req: Request) {
  const body = await req.json();

  const {
    sellerEmail,
    type,
    mediaFormat,
    title,
    platform,
    description,
    conditionCategory,
    currency,
    matchedPriceCents,
    listingPriceCents,
    priceChartingId,
    priceChartingName,
    priceChartingConsole,
    locationText,
    media,
  } = body ?? {};

  if (typeof sellerEmail !== "string" || !sellerEmail.includes("@")) return bad("Valid sellerEmail is required.");
  if (typeof type !== "string") return bad("type is required.");
  if (typeof mediaFormat !== "string") return bad("mediaFormat is required.");
  if (typeof title !== "string" || title.trim().length < 3) return bad("title is required.");
  if (typeof description !== "string") return bad("description is required.");
  if (typeof conditionCategory !== "string") return bad("conditionCategory is required.");
  if (typeof currency !== "string" || currency.length !== 3) return bad("currency is required.");
  if (typeof listingPriceCents !== "number" || listingPriceCents <= 0) return bad("listingPriceCents must be > 0.");

  // price match enforcement (when matched price exists)
  if (typeof matchedPriceCents === "number" && listingPriceCents > matchedPriceCents) {
    return bad("Listing price must be at or below the PriceCharting matched price.");
  }

  // media validation
  const mediaArr: { url: string; tag: string; sortOrder: number }[] = Array.isArray(media) ? media : [];
  const coverOk = mediaArr.some(m => m.tag === "COVER_FRONT" && typeof m.url === "string" && m.url.trim().length > 0);
  if (!coverOk) return bad("At least one COVER_FRONT image URL is required.");

  const disc = isDiscBased(type, mediaFormat);
  if (disc) {
    const discBackOk = mediaArr.some(m => m.tag === "DISC_BACK" && typeof m.url === "string" && m.url.trim().length > 0);
    if (!discBackOk) return bad("DISC_BACK image is required for disc/CD/DVD items so buyers can check scratches.");
  }

  const created = await prisma.listing.create({
    data: {
      sellerEmail,
      type,
      mediaFormat,
      title: title.trim(),
      platform: typeof platform === "string" ? platform : null,
      description,
      conditionCategory,
      currency,
      matchedPriceCents: typeof matchedPriceCents === "number" ? matchedPriceCents : null,
      listingPriceCents,
      priceChartingId: typeof priceChartingId === "string" ? priceChartingId : null,
      priceChartingName: typeof priceChartingName === "string" ? priceChartingName : null,
      priceChartingConsole: typeof priceChartingConsole === "string" ? priceChartingConsole : null,
      priceMatchedAt: typeof matchedPriceCents === "number" ? new Date() : null,
      locationText: typeof locationText === "string" ? locationText : null,
      media: {
        create: mediaArr
          .filter(m => typeof m.url === "string" && m.url.trim().length > 0)
          .map(m => ({
            url: m.url.trim(),
            tag: m.tag,
            sortOrder: typeof m.sortOrder === "number" ? m.sortOrder : 0,
          })),
      },
    },
    select: { id: true },
  });

  return NextResponse.json({ id: created.id }, { status: 201 });
}
