'use client';

export interface ShopCatalogEmptyLabels {
  title: string;
  body: string;
}

export function ShopCatalogEmpty({
  labels,
}: {
  labels: ShopCatalogEmptyLabels;
}) {
  return (
    <div
      className="flex flex-col items-stretch gap-6 p-4 rounded-2xl border border-[rgba(252,165,165,0.30)] bg-[rgba(239,68,68,0.08)]"
      data-testid="shop-catalog-empty"
    >
      <span className="text-[20px] font-bold">{labels.title}</span>
      <span className="text-[16px] text-[#94a3b8]">{labels.body}</span>
    </div>
  );
}
