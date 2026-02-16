
import { db } from '../src/lib/db';
import { deleteQuote } from '../src/app/actions/quotes';

async function main() {
    const targetId = 'cmlpful0q0007ih040mfh1khx'; // FH1KHX
    console.log(`Attempting to delete quote ${targetId}...`);

    try {
        await deleteQuote(targetId);
        console.log("SUCCESS: Quote deleted via server action logic.");
    } catch (error: any) {
        console.error("FAILURE:", error);
    }
}

main()
    .catch(console.error)
    .finally(() => db.$disconnect());
