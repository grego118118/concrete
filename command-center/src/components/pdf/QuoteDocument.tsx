import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image } from '@react-pdf/renderer';
import path from 'path';
import fs from 'fs';

// Load logo as base64 for PDF embedding
function getLogoBase64(): string | null {
    try {
        const logoPath = path.join(process.cwd(), 'public', 'logo.png');
        const logoBuffer = fs.readFileSync(logoPath);
        return `data:image/png;base64,${logoBuffer.toString('base64')}`;
    } catch {
        return null;
    }
}

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b',
        paddingBottom: 20,
    },
    logoSection: {
        width: '50%',
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 10,
    },
    logo: {
        width: 60,
        height: 60,
    },
    logoTextContainer: {
        justifyContent: 'center',
    },
    logoText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 3,
    },
    companyDetails: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.4,
    },
    invoiceDetails: {
        width: '40%',
        textAlign: 'right',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
    },
    quoteNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
    },
    date: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 20,
    },
    section: {
        width: '50%',
    },
    sectionTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#94a3b8',
        marginBottom: 6,
        letterSpacing: 1,
    },
    sectionContent: {
        borderLeftWidth: 3,
        borderLeftColor: '#e2e8f0',
        paddingLeft: 10,
    },
    clientName: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 2,
    },
    // Scope section
    scopeSection: {
        marginBottom: 20,
    },
    scopeTitle: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scopeGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 0,
    },
    scopeItem: {
        width: '50%',
        paddingVertical: 4,
    },
    scopeLabel: {
        fontSize: 8,
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    scopeValue: {
        fontSize: 10,
        color: '#0f172a',
        fontWeight: 'bold',
    },
    // Items table
    table: {
        marginTop: 10,
        marginBottom: 20,
    },
    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 2,
        borderBottomColor: '#0f172a',
        paddingBottom: 8,
        marginBottom: 8,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingVertical: 8,
    },
    colDesc: { width: '45%' },
    colQty: { width: '15%', textAlign: 'right' },
    colPrice: { width: '20%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },
    tableHeaderText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#0f172a',
    },
    // Totals
    totals: {
        alignItems: 'flex-end',
        marginTop: 10,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '40%',
        marginBottom: 6,
    },
    totalLabel: {
        color: '#64748b',
    },
    totalValue: {
        color: '#0f172a',
        fontWeight: 'bold',
    },
    grandTotal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '40%',
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 2,
        borderTopColor: '#0f172a',
    },
    grandTotalText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    depositBox: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#eff6ff',
        borderColor: '#bfdbfe',
        borderWidth: 1,
        borderRadius: 4,
        width: '40%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    depositLabel: {
        color: '#1d4ed8',
        fontWeight: 'bold',
        fontSize: 10,
    },
    depositValue: {
        color: '#1d4ed8',
        fontWeight: 'bold',
        fontSize: 10,
    },
    // Accept CTA
    ctaSection: {
        marginTop: 25,
        padding: 16,
        backgroundColor: '#f0fdf4',
        borderWidth: 2,
        borderColor: '#22c55e',
        borderRadius: 6,
        alignItems: 'center',
    },
    ctaTitle: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#15803d',
        marginBottom: 6,
    },
    ctaText: {
        fontSize: 10,
        color: '#166534',
        textAlign: 'center',
        marginBottom: 4,
    },
    ctaContact: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#15803d',
        marginTop: 4,
    },
    // Footer
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        paddingTop: 10,
    },
    footerCol: {
        width: '45%',
    },
    footerTitle: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 4,
        color: '#334155',
    },
    footerText: {
        fontSize: 8,
        color: '#64748b',
        lineHeight: 1.4,
    }
});

interface QuoteDocumentProps {
    quote: any;
    customer: any;
    items: any[];
}

export const QuoteDocument: React.FC<QuoteDocumentProps> = ({ quote, customer, items }) => {
    const logoSrc = getLogoBase64();
    const scopeData = quote.scopeData as any;
    const scopeArea = Number(quote.scopeArea) || 0;
    // baseRate: try stored baseRate/total first, then calculate from scopeData
    const baseRate = Number(quote.baseRate) || (scopeArea > 0 ? Number(quote.total) / scopeArea : 0) || Number(scopeData?.baseRate) || 12;
    const customItems = (scopeData?.customItems || []) as Array<{ name: string; sqft: number; rate: number }>;

    // Calculate totals from scope data
    const baseCost = scopeArea * baseRate;
    const customItemsTotal = customItems.reduce((sum: number, item: any) => sum + (item.sqft * item.rate), 0);

    // Add cleanup fee if selected
    const cleanupFee = scopeData?.jobsiteCleanup ? 150 : 0;

    const subtotal = baseCost + customItemsTotal + cleanupFee;
    const applyTax = scopeData?.applyTax ?? true;
    const taxRate = applyTax ? 0.0625 : 0;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;
    const depositRequired = total * 0.5;

    // Use scope-calculated total if available, otherwise fall back to stored total
    const quoteTotal = subtotal > 0 ? total : Number(quote.total);
    const quoteSubtotal = subtotal > 0 ? subtotal : Number(quote.subtotal);
    const quoteTax = subtotal > 0 ? tax : Number(quote.tax);
    const quoteDeposit = quoteTotal * 0.5;

    // Comments can be in scopeData or root quote object
    const additionalComments = scopeData?.comments || quote.comments;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header with Logo */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        {logoSrc && (
                            <Image style={styles.logo} src={logoSrc} />
                        )}
                        <View style={styles.logoTextContainer}>
                            <Text style={styles.logoText}>Pioneer Concrete Coatings</Text>
                            <Text style={styles.companyDetails}>Serving Southern New England</Text>
                            <Text style={styles.companyDetails}>(413) 544-4933</Text>
                            <Text style={styles.companyDetails}>quotes@pioneerconcretecoatings.com</Text>
                        </View>
                    </View>
                    <View style={styles.invoiceDetails}>
                        <Text style={styles.title}>QUOTE</Text>
                        <Text style={styles.quoteNumber}>#{quote.number}</Text>
                        <Text style={styles.date}>{new Date(quote.createdAt).toLocaleDateString()}</Text>
                    </View>
                </View>

                {/* Client & Job Info */}
                <View style={styles.row}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Customer</Text>
                        <View style={styles.sectionContent}>
                            <Text style={styles.clientName}>{customer.name}</Text>
                            {customer.address && <Text style={styles.companyDetails}>{customer.address}</Text>}
                            {customer.city && <Text style={styles.companyDetails}>{`${customer.city}, ${customer.state} ${customer.zip}`}</Text>}
                            {customer.phone && <Text style={styles.companyDetails}>{customer.phone}</Text>}
                            <Text style={{ ...styles.companyDetails, color: '#2563eb' }}>{customer.email}</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Jobsite Address</Text>
                        <View style={styles.sectionContent}>
                            <Text style={{ fontSize: 10 }}>{quote.jobLocation || "Same as Customer Address"}</Text>
                        </View>
                    </View>
                </View>

                {/* Scope Details - only show if scope data exists */}
                {scopeData && scopeArea > 0 && (
                    <View style={styles.scopeSection}>
                        <Text style={styles.scopeTitle}>Project Scope</Text>
                        <View style={styles.scopeGrid}>
                            <View style={styles.scopeItem}>
                                <Text style={styles.scopeLabel}>Total Area</Text>
                                <Text style={styles.scopeValue}>{scopeArea.toLocaleString()} sq ft</Text>
                            </View>
                            <View style={styles.scopeItem}>
                                <Text style={styles.scopeLabel}>Rate</Text>
                                <Text style={styles.scopeValue}>${baseRate.toFixed(2)} / sq ft</Text>
                            </View>
                            {scopeData.prepType && (
                                <View style={styles.scopeItem}>
                                    <Text style={styles.scopeLabel}>Prep Work</Text>
                                    <Text style={styles.scopeValue}>{scopeData.prepType}</Text>
                                </View>
                            )}
                            {scopeData.coatingType && (
                                <View style={styles.scopeItem}>
                                    <Text style={styles.scopeLabel}>Base Coat</Text>
                                    <Text style={styles.scopeValue}>{scopeData.coatingType}</Text>
                                </View>
                            )}
                            {scopeData.topCoatType && (
                                <View style={styles.scopeItem}>
                                    <Text style={styles.scopeLabel}>Top Coat</Text>
                                    <Text style={styles.scopeValue}>{scopeData.topCoatType}</Text>
                                </View>
                            )}
                            {scopeData.flakeType && (
                                <View style={styles.scopeItem}>
                                    <Text style={styles.scopeLabel}>Flake Broadcast</Text>
                                    <Text style={styles.scopeValue}>{scopeData.flakeType}</Text>
                                </View>
                            )}
                        </View>
                    </View>
                )}

                {/* Pricing Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colDesc, styles.tableHeaderText]}>Description</Text>
                        <Text style={[styles.colQty, styles.tableHeaderText]}>Qty (sqft)</Text>
                        <Text style={[styles.colPrice, styles.tableHeaderText]}>Rate</Text>
                        <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
                    </View>

                    {/* Main area line item - from scope calculator */}
                    {scopeArea > 0 && baseRate > 0 && (
                        <View style={styles.tableRow}>
                            <Text style={styles.colDesc}>Epoxy Floor Coating System</Text>
                            <Text style={styles.colQty}>{scopeArea.toLocaleString()}</Text>
                            <Text style={styles.colPrice}>${baseRate.toFixed(2)}</Text>
                            <Text style={styles.colTotal}>${baseCost.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                    )}

                    {/* Custom items from scope calculator (add-ons like coving) */}
                    {customItems.map((item: any, i: number) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.name || 'Add-on'}</Text>
                            <Text style={styles.colQty}>{item.sqft}</Text>
                            <Text style={styles.colPrice}>${Number(item.rate).toFixed(2)}</Text>
                            <Text style={styles.colTotal}>${(item.sqft * item.rate).toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                        </View>
                    ))}

                    {/* Jobsite Clean Up Fee */}
                    {cleanupFee > 0 && (
                        <View style={styles.tableRow}>
                            <Text style={styles.colDesc}>Jobsite Clean Up & Waste Removal</Text>
                            <Text style={styles.colQty}>1</Text>
                            <Text style={styles.colPrice}>$150.00</Text>
                            <Text style={styles.colTotal}>$150.00</Text>
                        </View>
                    )}

                    {/* Fallback: show stored quote items if no scope data */}
                    {scopeArea === 0 && items.map((item, i) => (
                        <View key={i} style={styles.tableRow}>
                            <Text style={styles.colDesc}>{item.description}</Text>
                            <Text style={styles.colQty}>{item.quantity}</Text>
                            <Text style={styles.colPrice}>${Number(item.unitPrice).toFixed(2)}</Text>
                            <Text style={styles.colTotal}>${Number(item.total).toFixed(2)}</Text>
                        </View>
                    ))}
                </View>

                {/* Additional Comments */}
                {additionalComments && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.sectionTitle}>Additional Project Comments</Text>
                        <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.5, fontStyle: 'italic' }}>
                            {additionalComments}
                        </Text>
                    </View>
                )}

                {/* Site Photos */}
                {quote.photos && quote.photos.length > 0 && (
                    <View style={{ marginBottom: 20 }}>
                        <Text style={styles.sectionTitle}>Site Photos (Before)</Text>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                            {quote.photos.map((photo: any) => (
                                <Image
                                    key={photo.id}
                                    src={photo.url}
                                    style={{ width: '30%', height: 100, borderRadius: 4, marginBottom: 10, objectFit: 'cover' }}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>Subtotal:</Text>
                        <Text style={styles.totalValue}>${quoteSubtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>MA Sales Tax (6.25%):</Text>
                        <Text style={styles.totalValue}>${quoteTax.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalText}>Total Quote:</Text>
                        <Text style={styles.grandTotalText}>${quoteTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>

                    <View style={styles.depositBox}>
                        <Text style={styles.depositLabel}>50% Deposit Due to Book:</Text>
                        <Text style={styles.depositValue}>${quoteDeposit.toLocaleString(undefined, { minimumFractionDigits: 2 })}</Text>
                    </View>
                </View>

                {/* Accept Quote CTA */}
                <View style={styles.ctaSection}>
                    <Text style={styles.ctaTitle}>Ready to Accept This Quote?</Text>
                    <Text style={styles.ctaText}>
                        Reply to this email or call us to confirm your booking.
                    </Text>
                    <Text style={styles.ctaText}>
                        A 50% deposit is required to secure your installation date.
                    </Text>
                    <Text style={styles.ctaContact}>(413) 544-4933 • quotes@pioneerconcretecoatings.com</Text>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerCol}>
                        <Text style={styles.footerTitle}>Payment Terms</Text>
                        <Text style={styles.footerText}>
                            - 50% deposit required to confirm booking.{'\n'}
                            - Full balance due immediately upon completion.{'\n'}
                            - Quote valid for 30 days.
                        </Text>
                    </View>
                    <View style={styles.footerCol}>
                        <Text style={styles.footerTitle}>Pioneer Concrete Coatings</Text>
                        <Text style={styles.footerText}>
                            Thank you for your business. We look forward to transforming your space!
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
