"use client";

import { useEffect, useMemo, useState } from "react";
import { computeMatchedPriceCents, formatMoney, type PCProduct, type ConditionCategory } from "@/lib/pricecharting";

type SearchItem = {
  id: string;
  "product-name": string;
  "console-name"?: string;
};

export function PriceMatchPicker({
  conditionCategory,
  currency,
  onPicked,
}: {
  conditionCategory: ConditionCategory;
  currency: string;
  onPicked: (payload: {
    priceChartingId: string;
    priceChartingName: string;
    priceChartingConsole?: string;
    matchedPriceCents: number | null;
  }) => void;
}) {
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState<SearchItem[]>([]);
  const [picked, setPicked] = useState<SearchItem | null>(null);
  const [product, setProduct] = useState<PCProduct | null>(null);
  const matched = useMemo(() => (product ? computeMatchedPriceCents(product, conditionCategory) : null), [product, conditionCategory]);

  async function search() {
    setBusy(true);
    setPicked(null);
    setProduct(null);
    try {
      const r = await fetch(`/api/pricecharting/search?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      const list: SearchItem[] = Array.isArray(data?.products) ? data.products : Array.isArray(data) ? data : [];
      setResults(list.slice(0, 10));
    } finally {
      setBusy(false);
    }
  }

  async function loadProduct(id: string) {
    setBusy(true);
    try {
      const r = await fetch(`/api/pricecharting/product?id=${encodeURIComponent(id)}`);
      const data = (await r.json()) as PCProduct;
      setProduct(data);
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!picked) return;
    void loadProduct(picked.id);
  }, [picked?.id]);

  useEffect(() => {
    if (!picked) return;
    onPicked({
      priceChartingId: picked.id,
      priceChartingName: picked["product-name"],
      priceChartingConsole: picked["console-name"],
      matchedPriceCents: matched,
    });
  }, [picked?.id, conditionCategory, matched]);

  return (
    <div className="card pad">
      <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
        <div>
          <div style={{fontWeight:800}}>Price match (PriceCharting)</div>
          <div className="small">Search the item and pick the exact match. If no token is set, you’ll get mock results.</div>
        </div>
        {matched != null ? <span className="badge ok">Matched: {formatMoney(matched, currency)}</span> : <span className="badge warn">No matched price yet</span>}
      </div>

      <div className="hr" />

      <div className="row">
        <div>
          <div className="label">Search title</div>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g., Mario Kart Double Dash GameCube" />
        </div>
        <div style={{display:"flex", alignItems:"end"}}>
          <button className="btn primary" onClick={search} disabled={busy || q.trim().length < 3}>
            {busy ? "Searching…" : "Search"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <>
          <div className="label">Results</div>
          <div style={{display:"grid", gap:8}}>
            {results.map((r) => {
              const selected = picked?.id === r.id;
              return (
                <button
                  key={r.id}
                  className={"btn" + (selected ? " primary" : "")}
                  style={{justifyContent:"space-between"}}
                  onClick={() => setPicked(r)}
                >
                  <span style={{textAlign:"left"}}>
                    <b>{r["product-name"]}</b>
                    <span className="small" style={{display:"block"}}>{r["console-name"] ?? ""}</span>
                  </span>
                  <span className="badge">{selected ? "Selected" : "Pick"}</span>
                </button>
              );
            })}
          </div>
        </>
      )}

      {product && (
        <>
          <div className="hr" />
          <div className="small">
            Prices are shown as PriceCharting values (often excluding shipping). This MVP enforces your listing price to be ≤ matched price.
          </div>
        </>
      )}
    </div>
  );
}
