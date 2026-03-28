
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function reproduce() {
  const quoteNumber = 'Q-1774713241045';
  console.log(`--- Starting Diagnosis for Quote ${quoteNumber} ---`);

  try {
    const quote = await prisma.quote.findUnique({
      where: { number: quoteNumber },
      include: { customer: true, items: true, invoice: true }
    });

    if (!quote) {
      console.error('Quote not found in DB!');
      return;
    }

    console.log('Quote found:', {
      status: quote.status,
      customerId: quote.customerId,
      total: quote.total,
      hasInvoice: !!quote.invoice
    });

    // Try to trigger the sync logic (imitating invoice-sync.ts)
    const businessId = quote.customer.businessId;
    console.log(`Business ID: ${businessId}`);

    const connection = await prisma.quickBooksConnection.findUnique({
      where: { businessId }
    });

    if (!connection) {
      console.error('No QuickBooks Connection found for this business!');
      return;
    }

    console.log('QB Connection found:', {
      realmId: connection.realmId,
      isActive: connection.isActive,
      expiry: connection.tokenExpiry
    });

    // Check if token is expired
    if (new Date(connection.tokenExpiry) < new Date()) {
       console.log('WARNING: Token is expired. Refresh would be needed.');
    }

  } catch (err) {
    console.error('Error during diagnosis:', err);
  } finally {
    await prisma.$disconnect();
  }
}

reproduce();
