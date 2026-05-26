import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { AssetPreview } from "@/components/asset-preview";
import { Tag } from "@/components/ui";

type PortfolioCardProps = {
  item: {
    title: string;
    slug: string;
    summary: string;
    category: string;
    year: number;
    software: string[];
    modelUrl: string;
    posterUrl?: string | null;
  };
};

export function PortfolioCard({ item }: PortfolioCardProps) {
  return (
    <Link className="portfolio-card" data-reveal href={`/portfolio/${item.slug}`}>
      <div className="card-preview">
        <AssetPreview title={item.title} category={item.category} posterUrl={item.posterUrl} />
      </div>
      <div className="card-body">
        <div className="meta">
          <span>{item.category}</span>
          <span>/</span>
          <span>{item.year}</span>
        </div>
        <h3>{item.title}</h3>
        <p className="meta">{item.summary}</p>
        <div className="tag-row">
          <div className="tag-list">
            {item.software.slice(0, 3).map((software) => (
              <Tag key={software}>{software}</Tag>
            ))}
          </div>
          <ArrowUpRight size={18} />
        </div>
      </div>
    </Link>
  );
}
