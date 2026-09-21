import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchExperience } from "@/components/search-experience";
import { SearchResultsSkeleton } from "@/components/search-skeleton";
import { SEO } from "@/lib/seo";

export const metadata: Metadata = {
  title: SEO.searchTitle,
  description: SEO.searchDescription,
  alternates: { canonical: "/search" },
};

export default function SearchPage() {
  return (
    <Suspense fallback={<SearchResultsSkeleton />}>
      <SearchExperience />
    </Suspense>
  );
}
