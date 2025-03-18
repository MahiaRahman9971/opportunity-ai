import React from 'react';
import TestNeighborhoodClient from './TestNeighborhoodClient';

// This ensures the page is not statically generated at build time
export const dynamic = 'force-dynamic';

// This ensures the page is only rendered on the client side
export const runtime = 'edge';

export default function TestNeighborhoodPage() {
  return <TestNeighborhoodClient />;
}
