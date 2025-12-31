export function AdSlot({ title, text }: { title: string; text: string }) {
  return (
    <div className="ad" role="complementary" aria-label="Advertisement">
      <p className="adTitle">{title}</p>
      <p className="adText">{text}</p>
    </div>
  );
}
