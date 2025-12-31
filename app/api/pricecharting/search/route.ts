import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

function mockProducts(q: string) {
  const pool = [
    { id: "MOCK-1001", "product-name": "Mario Kart: Double Dash!!", "console-name": "Nintendo GameCube" },
    { id: "MOCK-1002", "product-name": "Halo 2", "console-name": "Xbox" },
    { id: "MOCK-1003", "product-name": "Gran Turismo 4", "console-name": "PlayStation 2" },
    { id: "MOCK-1004", "product-name": "The Legend of Zelda: The Wind Waker", "console-name": "Nintendo GameCube" },
    { id: "MOCK-2001", "product-name": "PlayStation 2 Console", "console-name": "Sony" },
    { id: "MOCK-3001", "product-name": "Random DVD Movie", "console-name": "DVD" },
    { id: "MOCK-4001", "product-name": "Random Music CD", "console-name": "CD" },
  ];
  const t = q.toLowerCase();
  return pool.filter(x => x["product-name"].toLowerCase().includes(t) || (x["console-name"] ?? "").toLowerCase().includes(t));
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();
  if (!q || q.length < 3) return NextResponse.json({ products: [] });

  const token = process.env.PRICECHARTING_TOKEN;

  if (!token) {
    return NextResponse.json({ products: mockProducts(q) });
  }

  const url = new URL("https://www.pricecharting.com/api/products");
  url.searchParams.set("t", token);
  url.searchParams.set("q", q);

  const r = await fetch(url.toString(), { cache: "no-store" });
  const data = await r.json();
  // normalize in case API returns slightly different shapes
  const products = Array.isArray((data as any)?.products) ? (data as any).products : data;
  return NextResponse.json({ products });
}
