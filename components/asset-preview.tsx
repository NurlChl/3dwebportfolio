type AssetPreviewProps = {
  title: string;
  category: string;
  posterUrl?: string | null;
};

export function AssetPreview({ title, category, posterUrl }: AssetPreviewProps) {
  const variant = title.toLowerCase().includes("shrine")
    ? "shrine"
    : title.toLowerCase().includes("console")
      ? "console"
      : "drone";

  return (
    <div className={`asset-preview ${variant}`} aria-label={`${category} preview`}>
      {posterUrl ? <span className="asset-poster" style={{ backgroundImage: `url(${posterUrl})` }} /> : null}
      <div className="preview-grid" />
      <div className="preview-object">
        <span className="shape main" />
        <span className="shape side-a" />
        <span className="shape side-b" />
      </div>
      <div className="preview-shadow" />
    </div>
  );
}
