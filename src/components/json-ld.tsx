import { FAQ_JSON_LD, SEO, getSiteUrl } from "@/lib/seo";

export function JsonLd() {
  const url = getSiteUrl();
  const payload = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: SEO.siteName,
      url,
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Web",
      inLanguage: "ru",
      isAccessibleForFree: true,
      description: SEO.description,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "RUB",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQ_JSON_LD.map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: {
          "@type": "Answer",
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(payload) }}
    />
  );
}
