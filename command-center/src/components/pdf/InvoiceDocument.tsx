import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

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
        marginBottom: 40,
        borderBottomWidth: 2,
        borderBottomColor: '#1e293b',
        paddingBottom: 20,
    },
    logoSection: {
        width: '50%',
    },
    logoText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 4,
    },
    companyDetails: {
        fontSize: 9,
        color: '#475569',
        lineHeight: 1.4,
    },
    invoiceDetailsSection: {
        width: '40%',
        textAlign: 'right',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: 10,
    },
    invoiceNumber: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#334155',
    },
    date: {
        fontSize: 10,
        color: '#64748b',
        marginTop: 4,
    },
    dueDate: {
        fontSize: 10,
        color: '#dc2626',
        marginTop: 4,
        fontWeight: 'bold',
    },
    statusBadge: {
        marginTop: 10,
        alignSelf: 'flex-end',
        borderWidth: 1,
        borderColor: '#0f172a',
        paddingHorizontal: 8,
        paddingVertical: 2,
    },
    statusText: {
        fontSize: 9,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    row: {
        flexDirection: 'row',
        marginBottom: 30,
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
    table: {
        marginTop: 20,
        marginBottom: 40,
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
    colDesc: { width: '55%' },
    colQty: { width: '10%', textAlign: 'right' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right', fontWeight: 'bold' },
    tableHeaderText: {
        fontSize: 8,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        color: '#0f172a',
    },
    totals: {
        alignItems: 'flex-end',
        marginTop: 20,
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
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
    },
    grandTotalText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0f172a',
    },
    amountDueBox: {
        marginTop: 12,
        padding: 10,
        backgroundColor: '#fef2f2',
        borderColor: '#fecaca',
        borderWidth: 1,
        borderRadius: 4,
        width: '40%',
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    amountDueLabel: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 10,
    },
    amountDueValue: {
        color: '#dc2626',
        fontWeight: 'bold',
        fontSize: 10,
    },
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

interface InvoiceDocumentProps {
    invoice: any;
    customer: any;
    items: any[];
}

export const InvoiceDocument: React.FC<InvoiceDocumentProps> = ({ invoice, customer, items }) => {
    const invoiceTotal = Number(invoice.amount);

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.logoSection}>
                        <Text style={styles.logoText}>Pioneer Concrete Coatings</Text>
                        <Text style={styles.companyDetails}>Serving Southern New England</Text>
                        <Text style={styles.companyDetails}>(413) 544-4933</Text>
                        <Text style={styles.companyDetails}>billing@pioneerconcretecoatings.com</Text>
                    </View>
                    <View style={styles.invoiceDetailsSection}>
                        <Text style={styles.title}>INVOICE</Text>
                        <Text style={styles.invoiceNumber}>#{invoice.number}</Text>
                        <Text style={styles.date}>Issued: {new Date(invoice.createdAt).toLocaleDateString()}</Text>
                        {invoice.dueDate && (
                            <Text style={styles.dueDate}>Due: {new Date(invoice.dueDate).toLocaleDateString()}</Text>
                        )}
                        <View style={styles.statusBadge}>
                            <Text style={styles.statusText}>{invoice.status}</Text>
                        </View>
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.row}>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Bill To</Text>
                        <View style={styles.sectionContent}>
                            <Text style={styles.clientName}>{customer.name}</Text>
                            {customer.address && <Text style={styles.companyDetails}>{customer.address}</Text>}
                            {customer.city && <Text style={styles.companyDetails}>{`${customer.city}, ${customer.state} ${customer.zip}`}</Text>}
                            {customer.phone && <Text style={styles.companyDetails}>{customer.phone}</Text>}
                            <Text style={{ ...styles.companyDetails, color: '#2563eb' }}>{customer.email}</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Invoice Details</Text>
                        <View style={styles.sectionContent}>
                            <Text style={{ fontSize: 10 }}>Invoice #: {invoice.number}</Text>
                            {invoice.quote && (
                                <Text style={{ fontSize: 10, marginTop: 4 }}>Quote #: {invoice.quote.number}</Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Items Table */}
                <View style={styles.table}>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.colDesc, styles.tableHeaderText]}>Description</Text>
                        <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
                        <Text style={[styles.colPrice, styles.tableHeaderText]}>Price</Text>
                        <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
                    </View>
                    {items.length > 0 ? (
                        items.map((item, i) => (
                            <View key={i} style={styles.tableRow}>
                                <Text style={styles.colDesc}>{item.description}</Text>
                                <Text style={styles.colQty}>{item.quantity}</Text>
                                <Text style={styles.colPrice}>${Number(item.unitPrice).toFixed(2)}</Text>
                                <Text style={styles.colTotal}>${Number(item.total).toFixed(2)}</Text>
                            </View>
                        ))
                    ) : (
                        <View style={styles.tableRow}>
                            <Text style={styles.colDesc}>Services Rendered</Text>
                            <Text style={styles.colQty}>1</Text>
                            <Text style={styles.colPrice}>${invoiceTotal.toFixed(2)}</Text>
                            <Text style={styles.colTotal}>${invoiceTotal.toFixed(2)}</Text>
                        </View>
                    )}
                </View>

                {/* Totals */}
                <View style={styles.totals}>
                    <View style={styles.grandTotal}>
                        <Text style={styles.grandTotalText}>Amount Due:</Text>
                        <Text style={styles.grandTotalText}>${invoiceTotal.toFixed(2)}</Text>
                    </View>

                    <View style={styles.amountDueBox}>
                        <Text style={styles.amountDueLabel}>Balance Due:</Text>
                        <Text style={styles.amountDueValue}>${invoiceTotal.toFixed(2)}</Text>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <View style={styles.footerCol}>
                        <Text style={styles.footerTitle}>Payment Terms</Text>
                        <Text style={styles.footerText}>
                            - Payment is due upon receipt unless otherwise noted.{'\n'}
                            - Late payments may be subject to a 1.5% monthly fee.{'\n'}
                            - Please include invoice number with payment.
                        </Text>
                    </View>
                    <View style={styles.footerCol}>
                        <Text style={styles.footerTitle}>Pioneer Concrete Coatings</Text>
                        <Text style={styles.footerText}>
                            Thank you for your business. We appreciate your prompt payment!
                        </Text>
                    </View>
                </View>
            </Page>
        </Document>
    );
};
