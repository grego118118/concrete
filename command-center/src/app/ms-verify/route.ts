import { NextResponse } from 'next/server';

export async function GET() {
  const content = `{
  "Description": "Domain ownership verification file for Microsoft 365 - place in the website root",
  "Domain": "pioneerconcretecoatings.com",
  "Id": "bc3c9387-239c-4c36-8973-3f8e1dc6b145"
}`;

  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain',
    },
  });
}
