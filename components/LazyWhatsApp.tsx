'use client';

import dynamic from 'next/dynamic';

/**
 * Floating WhatsApp control — client-only, deferred from critical path.
 */
const WhatsAppButton = dynamic(() => import('@/components/WhatsAppButton'), {
  ssr: false,
});

export default function LazyWhatsApp() {
  return <WhatsAppButton />;
}
