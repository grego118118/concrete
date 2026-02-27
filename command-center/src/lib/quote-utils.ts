
// Helper to generate DB items from scope calculator data
export function generateQuoteItemsFromScope(scopeArea: number, baseRate: number, scopeData: any) {
    const items = [];

    if (scopeArea > 0 && baseRate > 0) {
        const prepType = scopeData?.prepType || "Standard Diamond Grind";
        const coatingType = scopeData?.coatingType || "Epoxy Clear Base";
        const topCoatType = scopeData?.topCoatType || "";
        const flakeType = scopeData?.flakeType || "";
        const parts = [coatingType, topCoatType, flakeType].filter(Boolean).join(" + ");

        items.push({
            description: `${parts || "Epoxy Floor Coating"} System — ${prepType}`,
            qty: scopeArea,
            unit: "sqft",
            price: baseRate
        });
    }

    const customItems = (scopeData?.customItems || []) as Array<{ name: string; sqft: number; rate: number }>;
    for (const ci of customItems) {
        if (ci.name && ci.sqft > 0 && ci.rate > 0) {
            items.push({
                description: ci.name,
                qty: ci.sqft,
                unit: "ea",
                price: ci.rate
            });
        }
    }

    // Add cleanup fee item if selected
    if (scopeData?.jobsiteCleanup) {
        items.push({
            description: "Jobsite Clean Up & Waste Removal",
            qty: 1,
            unit: "ea",
            price: 150
        });
    }

    return items;
}
