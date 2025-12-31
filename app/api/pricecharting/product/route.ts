import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function mockProduct(id: string) {
  // cents
  const base = id.includes("2001") ? 10999 : 4999;
  return {
    status: "success",
    id,
    "product-name": "Mock product",
    "console-name": "Mock console",
    "loose-price": base,
    "box-only-price": Math.round(base * 0.55),
    "manual-only-price": Math.round(base * 0.18),
    "cib-price": Math.round(base * 1.25),
    "condition-8-price": Math.round(base * 1.05),
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const token = process.env.PRICECHARTING_TOKEN;

  if (!token || id.startsWith("MOCK-")) {
    return NextResponse.json(mockProduct(id));
  }

  const url = new URL("https://www.pricecharting.com/api/product");
  url.searchParams.set("t", token);
  url.searchParams.set("id", id);

  const r = await fetch(url.toString(), { cache: "no-store" });
  const data = await r.json();
  return NextResponse.json(data);
}
