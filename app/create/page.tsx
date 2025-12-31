"use client";

import { useMemo, useState } from "react";
import { Stepper } from "@/components/Stepper";
import { PriceMatchPicker } from "@/components/PriceMatchPicker";
import { formatMoney, isDiscBased } from "@/lib/pricecharting";

type ListingType = "GAME" | "CONSOLE" | "CD" | "DVD" | "ACCESSORY";
type MediaFormat = "DISC" | "CARTRIDGE" | "OTHER";
type ConditionCategory = "LOOSE" | "BOX_ONLY" | "BOX_WITH_MANUAL" | "BOX_NO_MANUAL";
type MediaTag = "COVER_FRONT" | "CASE_BACK" | "DISC_FRONT" | "DISC_BACK" | "EXTRAS";

type MediaInput = { url: string; tag: MediaTag; sortOrder: number };

export default function CreatePage() {
  const steps = ["Item", "Price match", "Photos", "Review"];
  const [step, setStep] = useState(0);

  const [sellerEmail, setSellerEmail] = useState("");
  const [type, setType] = useState<ListingType>("GAME");
  const [mediaFormat, setMediaFormat] = useState<MediaFormat>("DISC");
  const [title, setTitle] = useState("");
  const [platform, setPlatform] = useState("");
  const [description, setDescription] = useState("");
  const [conditionCategory, setConditionCategory] = useState<ConditionCategory>("LOOSE");
  const [locationText, setLocationText] = useState("");

  const [currency, setCurrency] = useState("EUR");

  const [priceChartingId, setPriceChartingId] = useState<string | null>(null);
  const [priceChartingName, setPriceChartingName] = useState<string | null>(null);
  const [priceChartingConsole, setPriceChartingConsole] = useState<string | null>(null);
  const [matchedPriceCents, setMatchedPriceCents] = useState<number | null>(null);

  const [listingPriceText, setListingPriceText] = useState("");
  const listingPriceCents = useMemo(() => {
    const n = Number(listingPriceText);
    if (!Number.isFinite(n) || n <= 0) return null;
    return Math.round(n * 100);
  }, [listingPriceText]);

  const discBased = useMemo(() => isDiscBased(type, mediaFormat), [type, mediaFormat]);

  const [media, setMedia] = useState<MediaInput[]>([
    { url: "", tag: "COVER_FRONT", sortOrder: 0 },
    { url: "", tag: "DISC_BACK", sortOrder: 1 },
    { url: "", tag: "DISC_FRONT", sortOrder: 2 },
  ]);

  function addMediaRow() {
    setMedia((m) => [...m, { url: "", tag: "EXTRAS", sortOrder: m.length }]);
  }

  function updateMedia(i: number, patch: Partial<MediaInput>) {
    setMedia((m) => m.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));
  }

  function removeMedia(i: number) {
    setMedia((m) => m.filter((_, idx) => idx !== i).map((x, idx) => ({ ...x, sortOrder: idx })));
  }

  const discBackPresent = useMemo(() => {
    return media.some((m) => m.tag === "DISC_BACK" && m.url.trim().length > 0);
  }, [media]);

  const canGoNext = useMemo(() => {
    if (step === 0) {
      if (!sellerEmail.includes("@")) return false;
      if (title.trim().length < 3) return false;
      if (discBased && (type === "CD" || type === "DVD")) {
        // force mediaFormat to DISC for these, but still validate
        return true;
      }
      return true;
    }
    if (step === 1) {
      // price match is optional, but if matched price exists we still enforce at publish time
      return true;
    }
    if (step === 2) {
      // require at least one cover/front URL
      const coverOk = media.some((m) => m.tag === "COVER_FRONT" && m.url.trim().length > 0);
      if (!coverOk) return false;
      if (discBased && !discBackPresent) return false;
      return true;
    }
    if (step === 3) {
      if (listingPriceCents == null) return false;
      if (matchedPriceCents != null && listingPriceCents > matchedPriceCents) return false;
      return true;
    }
    return true;
  }, [step, sellerEmail, title, discBased, discBackPresent, listingPriceCents, matchedPriceCents, media, type]);

  async function publish() {
    if (listingPriceCents == null) return;

    const payload = {
      sellerEmail,
      type,
      mediaFormat: type === "CD" || type === "DVD" ? "DISC" : mediaFormat,
      title,
      platform: platform.trim() ? platform : null,
      description,
      conditionCategory,
      currency,
      matchedPriceCents,
      listingPriceCents,
      priceChartingId,
      priceChartingName,
      priceChartingConsole,
      locationText: locationText.trim() ? locationText : null,
      media: media
        .filter((m) => m.url.trim().length > 0)
        .map((m) => ({ url: m.url.trim(), tag: m.tag, sortOrder: m.sortOrder })),
    };

    const r = await fetch("/api/listings", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await r.json();
    if (!r.ok) {
      alert(data?.error ?? "Failed to publish");
      return;
    }
    window.location.href = `/listings/${data.id}`;
  }

  return (
    <div style={{marginTop:16}}>
      <div className="card pad">
        <div style={{display:"flex", alignItems:"baseline", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
          <div>
            <h1 className="h1" style={{margin:0}}>Create listing</h1>
            <p className="sub" style={{margin:0}}>User-friendly flow, strict disc photo rules, PriceCharting matching.</p>
          </div>
          <div className="badge">{steps[step]}</div>
        </div>

        <div className="hr" />
        <Stepper steps={steps} activeIndex={step} />
        <div className="hr" />

        {step === 0 && (
          <div style={{display:"grid", gap:12}}>
            <div className="row">
              <div>
                <div className="label">Seller email</div>
                <input className="input" value={sellerEmail} onChange={(e) => setSellerEmail(e.target.value)} placeholder="you@example.com" />
              </div>
              <div>
                <div className="label">Currency</div>
                <select className="select" value={currency} onChange={(e) => setCurrency(e.target.value)}>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </div>

            <div className="row">
              <div>
                <div className="label">Item type</div>
                <select className="select" value={type} onChange={(e) => setType(e.target.value as ListingType)}>
                  <option value="GAME">Game</option>
                  <option value="CONSOLE">Console</option>
                  <option value="CD">CD</option>
                  <option value="DVD">DVD</option>
                  <option value="ACCESSORY">Accessory</option>
                </select>
              </div>

              <div>
                <div className="label">Media format</div>
                <select
                  className="select"
                  value={type === "CD" || type === "DVD" ? "DISC" : mediaFormat}
                  onChange={(e) => setMediaFormat(e.target.value as MediaFormat)}
                  disabled={type === "CD" || type === "DVD"}
                >
                  <option value="DISC">Disc</option>
                  <option value="CARTRIDGE">Cartridge</option>
                  <option value="OTHER">Other</option>
                </select>
                {(type === "CD" || type === "DVD") && <div className="small">CD/DVD are always Disc.</div>}
              </div>
            </div>

            <div className="row">
              <div>
                <div className="label">Title</div>
                <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., The Legend of Zelda: Wind Waker" />
              </div>
              <div>
                <div className="label">Platform (optional)</div>
                <input className="input" value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="e.g., GameCube / PS2 / Xbox 360" />
              </div>
            </div>

            <div className="row">
              <div>
                <div className="label">Condition category</div>
                <select className="select" value={conditionCategory} onChange={(e) => setConditionCategory(e.target.value as ConditionCategory)}>
                  <option value="LOOSE">Loose</option>
                  <option value="BOX_ONLY">Box</option>
                  <option value="BOX_WITH_MANUAL">Box with manual</option>
                  <option value="BOX_NO_MANUAL">Box with no manual</option>
                </select>
                <div className="small">For disc/CD/DVD items, buyers will also see the Disc Back photo.</div>
              </div>
              <div>
                <div className="label">Location (optional)</div>
                <input className="input" value={locationText} onChange={(e) => setLocationText(e.target.value)} placeholder="e.g., Dublin / Cork / Galway" />
              </div>
            </div>

            <div>
              <div className="label">Description</div>
              <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe condition, scratches, what’s included, etc." />
            </div>

            <div style={{display:"flex", gap:10, flexWrap:"wrap", alignItems:"center"}}>
              {discBased ? <span className="badge ok">Disc-based: Disc Back required</span> : <span className="badge">Non-disc: no scratch-check requirement</span>}
            </div>
          </div>
        )}

        {step === 1 && (
          <PriceMatchPicker
            conditionCategory={conditionCategory}
            currency={currency}
            onPicked={(p) => {
              setPriceChartingId(p.priceChartingId);
              setPriceChartingName(p.priceChartingName);
              setPriceChartingConsole(p.priceChartingConsole ?? null);
              setMatchedPriceCents(p.matchedPriceCents);
              // helpful: prefill price
              if (p.matchedPriceCents != null) setListingPriceText(String((p.matchedPriceCents / 100).toFixed(2)));
            }}
          />
        )}

        {step === 2 && (
          <div className="card pad">
            <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
              <div>
                <div style={{fontWeight:900}}>Photos</div>
                <div className="small">
                  Paste image URLs for testing. Disc items require <b>DISC_BACK</b> so buyers can check scratches.
                </div>
              </div>
              {discBased ? (
                discBackPresent ? <span className="badge ok">Disc Back ✓</span> : <span className="badge bad">Disc Back missing</span>
              ) : (
                <span className="badge">Disc Back not required</span>
              )}
            </div>

            <div className="hr" />

            <div style={{display:"grid", gap:10}}>
              {media.map((m, i) => (
                <div key={i} className="card pad" style={{background:"rgba(255,255,255,.02)"}}>
                  <div className="row">
                    <div>
                      <div className="label">Image URL</div>
                      <input className="input" value={m.url} onChange={(e) => updateMedia(i, { url: e.target.value })} placeholder="https://…" />
                    </div>
                    <div>
                      <div className="label">Tag</div>
                      <select className="select" value={m.tag} onChange={(e) => updateMedia(i, { tag: e.target.value as MediaTag })}>
                        <option value="COVER_FRONT">Cover front</option>
                        <option value="CASE_BACK">Case back</option>
                        <option value="DISC_FRONT">Disc front</option>
                        <option value="DISC_BACK">Disc back (scratch check)</option>
                        <option value="EXTRAS">Extras</option>
                      </select>
                    </div>
                    <div style={{display:"flex", alignItems:"end", justifyContent:"end"}}>
                      <button className="btn danger" onClick={() => removeMedia(i)}>Remove</button>
                    </div>
                  </div>

                  {m.url.trim() && (
                    <div style={{marginTop:10}}>
                      <img className="bigImg" src={m.url.trim()} alt="" />
                    </div>
                  )}
                </div>
              ))}

              <button className="btn" onClick={addMediaRow}>+ Add another photo</button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div style={{display:"grid", gap:12}}>
            <div className="card pad">
              <div style={{display:"flex", alignItems:"center", justifyContent:"space-between", gap:12, flexWrap:"wrap"}}>
                <div>
                  <div style={{fontWeight:900}}>Review & price</div>
                  <div className="small">Your price must be ≤ the matched PriceCharting value (when matched).</div>
                </div>
                {matchedPriceCents != null ? (
                  <span className="badge ok">Matched: {formatMoney(matchedPriceCents, currency)}</span>
                ) : (
                  <span className="badge warn">No match selected</span>
                )}
              </div>

              <div className="hr" />

              <div className="row">
                <div>
                  <div className="label">Listing price</div>
                  <input className="input" value={listingPriceText} onChange={(e) => setListingPriceText(e.target.value)} placeholder="e.g., 29.99" />
                  <div className="small">
                    {listingPriceCents != null ? `Parsed: ${formatMoney(listingPriceCents, currency)}` : "Enter a valid number"}
                  </div>
                </div>
                <div>
                  <div className="label">Match selection</div>
                  <div className="card pad" style={{background:"rgba(255,255,255,.02)"}}>
                    <div className="small">
                      {priceChartingId ? (
                        <>
                          <b>{priceChartingName}</b><br/>
                          <span>{priceChartingConsole ?? ""}</span><br/>
                          <span className="kbd">{priceChartingId}</span>
                        </>
                      ) : (
                        <>No PriceCharting item selected (allowed for testing, but not “competitive”).</>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="hr" />

              {discBased && !discBackPresent && (
                <div className="badge bad">
                  Disc Back is required for this item type.
                </div>
              )}

              {listingPriceCents != null && matchedPriceCents != null && listingPriceCents > matchedPriceCents && (
                <div className="badge bad">
                  Listing price must be ≤ matched price.
                </div>
              )}

              <div className="hr" />

              <button className="btn primary" onClick={publish} disabled={!canGoNext}>
                Publish listing
              </button>
            </div>
          </div>
        )}

        <div className="hr" />

        <div style={{display:"flex", justifyContent:"space-between", gap:10, flexWrap:"wrap"}}>
          <button className="btn" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
            Back
          </button>

          <button className="btn primary" onClick={() => setStep((s) => Math.min(3, s + 1))} disabled={!canGoNext || step === 3}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
