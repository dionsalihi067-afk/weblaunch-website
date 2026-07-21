/**
 * End-to-end API test — requires: npm run dev
 * Run: node scripts/test-contact-api.js
 */
async function main() {
  const fd = new FormData();
  fd.append('fullName', 'SMTP Debug Test');
  fd.append('businessName', 'WEB LAUNCH Test Co');
  fd.append('email', 'dionsalihi067@gmail.com');
  fd.append('phone', '+38345949507');
  fd.append('country', 'Kosovo');
  fd.append('preferredLanguage', 'en');
  fd.append('selectedServices', JSON.stringify(['seo']));
  fd.append('seo_websiteUrl', 'https://example.com');
  fd.append('seo_mainServices', 'Digital marketing');
  fd.append('seo_cities', 'Pristina');
  fd.append('seo_keywords', 'web agency kosovo');
  fd.append('additionalNotes', 'Automated API test from scripts/test-contact-api.js');

  const ports = [3000, 3001, 3002];
  for (const port of ports) {
    const url = `http://127.0.0.1:${port}/api/contact`;
    try {
      console.log(`Trying ${url}...`);
      const res = await fetch(url, { method: 'POST', body: fd });
      const text = await res.text();
      console.log('Status:', res.status);
      console.log('Body:', text);
      process.exit(res.ok ? 0 : 1);
    } catch (err) {
      console.log(`Port ${port} unreachable:`, err.message);
    }
  }
  console.error('No Next.js dev server found on 3000–3002. Start with: npm run dev');
  process.exit(1);
}

main();
