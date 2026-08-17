const TITLE = "Propio - Financial Intelligence for Hotels";
const DESCRIPTION =
    "Track property bookings, payouts and expenses per property with Propio. AI-powered insights, compliance alerts, and zero accounting complexity.";
const KEYWORDS = [
    "short term rental finance software",
    "homestay expense tracker",
    "Airbnb expense management India",
    "STR accounting alternative",
    "property-level financial tracking",
    "AI expense tracking",
    "homestay compliance tracker",
];

const JSONLD = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "Propio",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
        "Propio is a financial intelligence platform for short-term rental and homestay owners to track bookings, expenses, and compliance without accounting complexity.",
    offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
    },
};

const DOMAIN = process.env.VITE_SITE_DOMAIN;
const OGIMAGE = "https://" + DOMAIN + "/assets/og.png";

export default function useMetaTags({
    title,
    description,
    pathname = "/",
}: {
    title?: string;
    description?: string;
    pathname?: string;
}) {
    title = title || TITLE;
    description = description || DESCRIPTION;

    const url = `https://${DOMAIN}${pathname}`;

    const tags = [
        // basic information
        { title },
        { name: "description", content: description },
        { name: "keywords", content: KEYWORDS.join(", ") },

        // Open Graph / Facebook
        { property: "og:type", content: "website" },
        { property: "og:url", content: url },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:image", content: OGIMAGE },

        // Twitter Meta
        { property: "twitter:card", content: "summary_large_image" },
        { property: "twitter:domain", content: DOMAIN },
        { property: "twitter:url", content: url },
        { property: "twitter:title", content: title },
        { property: "twitter:description", content: description },
        { property: "twitter:image", content: OGIMAGE },

        // Pinterest and Linkedin specific tags
        { property: "og:site_name", content: "Propio" },
        { property: "og:locale", content: "en_US" },
        { property: "og:image:width", content: "1200" },
        { property: "og:image:height", content: "630" },

        // Add Pinterest specific
        { property: "pinterest:description", content: description },
        { property: "pinterest:image", content: OGIMAGE },

        // Add LinkedIn specific
        { property: "og:image:alt", content: title },

        // Schema json
        { "script:ld+json": JSONLD },
    ];

    return tags;
}
