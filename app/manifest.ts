import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'WEB LAUNCH - Premium Digital Agency',
    short_name: 'WEB LAUNCH',
    description: 'Professional websites, branding, SEO and digital solutions that help businesses grow online',
    start_url: '/en',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0070f3',
    icons: [
      {
        src: '/assets/favicon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/assets/favicon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
