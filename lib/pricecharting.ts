export type PCProduct = {
  status?: "success" | "error";
  id?: string;
  "product-name"?: string;
  "console-name"?: string;
  "loose-price"?: number;     // cents
  "cib-price"?: number;       // cents
  "box-only-price"?: number;  // cents
  "manual-only-price"?: number; // cents
  [k: string]: unknown;
};

export type ConditionCategory = "LOOSE" | "BOX_ONLY" | "BOX_WITH_MANUAL" | "BOX_NO_MANUAL";

export function computeMatchedPriceCents(pc: PCProduct, condition: ConditionCategory): number | null {
  const loose = typeof pc["loose-price"] === "number" ? pc["loose-price"] : null;
  const cib = typeof pc["cib-price"] === "number" ? pc["cib-price"] : null;
  const boxOnly = typeof pc["box-only-price"] === "number" ? pc["box-only-price"] : null;
  const manualOnly = typeof pc["manual-only-price"] === "number" ? pc["manual-only-price"] : null;

  if (condition === "LOOSE") return loose;
  if (condition === "BOX_ONLY") return boxOnly;
  if (condition === "BOX_WITH_MANUAL") return cib;

  // BOX_NO_MANUAL (disc + box, no manual)
  const cond8 = (pc as any)["condition-8-price"];
  if (typeof cond8 === "number") return cond8;

  if (cib != null && manualOnly != null) {
    const v = cib - manualOnly;
    return v > 0 ? v : null;
  }
  if (loose != null && boxOnly != null) return loose + boxOnly;
  return loose;
}

export function formatMoney(cents: number, currency: string) {
  const v = cents / 100;
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(v);
}

export function isDiscBased(type: string, mediaFormat: string) {
  if (type === "CD" || type === "DVD") return true;
  if (type === "GAME" && mediaFormat === "DISC") return true;
  return false;
}
