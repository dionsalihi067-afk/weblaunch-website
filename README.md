# WEB LAUNCH - Premium Multilingual Digital Agency Website

A modern, premium digital agency website built with Next.js, TypeScript, Tailwind CSS, and Framer Motion. Supports 7 languages with complete internationalization.

## Features

✨ **Multilingual Support** - 7 languages (Albanian, English, German, French, Italian, Turkish, Spanish)
🎨 **Premium Design** - Modern, elegant, and professional UI/UX
📱 **Fully Responsive** - Optimized for all devices
🚀 **High Performance** - Built with Next.js 15 for optimal speed
📧 **Contact Form** - Multi-step form with email notifications
🌐 **SEO Optimized** - Multilingual SEO with proper metadata
💬 **WhatsApp Integration** - Floating WhatsApp button for instant contact
🎭 **Smooth Animations** - Framer Motion for elegant transitions

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Animations:** Framer Motion
- **Internationalization:** next-intl
- **Icons:** Lucide React
- **Email:** Nodemailer

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository or navigate to the project folder:
\`\`\`bash
cd Web_Launch_Website
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a \`.env.local\` file in the root directory and add:
\`\`\`
EMAIL_PASSWORD=your_gmail_app_password
\`\`\`

To get a Gmail app password:
- Go to your Google Account settings
- Security → 2-Step Verification → App passwords
- Generate a new app password for "Mail"
- Copy and paste it in \`.env.local\`

### Logo Setup

**IMPORTANT:** Add your WEB LAUNCH logos to the \`public/assets/\` directory:

Required logo files:
- \`logo.png\` - Main logo for light backgrounds
- \`logo-white.png\` - Logo for dark backgrounds (footer)

Recommended sizes:
- Main logo: 160px width (height auto)
- Favicon: 32x32, 64x64, 192x192, 512x512

### Running the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

The site will automatically redirect to \`/en\` (English by default).

## Available Languages

Access the site in different languages:

- 🇦🇱 Albanian: `/al`
- English: `/en`
- 🇩🇪 German: `/de`
- 🇫🇷 French: `/fr`
- 🇮🇹 Italian: `/it`
- 🇹🇷 Turkish: `/tr`
- 🇪🇸 Spanish: `/es`

## Project Structure

\`\`\`
Web_Launch_Website/
├── app/
│   ├── [locale]/          # Localized pages
│   │   ├── page.tsx       # Home page
│   │   ├── services/      # Services pages
│   │   ├── portfolio/     # Portfolio page
│   │   ├── about/         # About page
│   │   ├── process/       # Process page
│   │   └── contact/       # Contact page
│   ├── api/
│   │   └── contact/       # Contact form API
│   └── globals.css        # Global styles
├── components/
│   ├── Navigation.tsx     # Header with language selector
│   ├── Footer.tsx         # Footer component
│   ├── WhatsAppButton.tsx # Floating WhatsApp button
│   ├── home/              # Home page components
│   ├── services/          # Services components
│   ├── portfolio/         # Portfolio components
│   ├── process/           # Process timeline
│   └── contact/           # Contact form
├── messages/              # Translation files (JSON)
│   ├── en.json
│   ├── de.json
│   ├── fr.json
│   ├── it.json
│   ├── es.json
│   ├── tr.json
│   └── al.json
├── public/
│   └── assets/           # Logo and images
├── i18n.ts               # Internationalization config
├── middleware.ts         # Language routing
└── tailwind.config.ts    # Tailwind configuration
\`\`\`

## Pages

### Home Page
- Hero section with animated background
- Trust/Features section
- Services overview
- Call to action
- Stats showcase

### Services Page
- Complete services grid
- Individual service detail pages
- Interactive hover effects

### Portfolio Page
- Project showcase
- Case studies
- Results metrics

### About Page
- Company mission
- Values
- Why choose us

### Process Page
- 7-step process timeline
- Animated timeline visualization

### Contact Page
- Multi-step contact form
- Dynamic questions based on service
- Contact information
- Email notifications

## Contact Form Features

The contact form includes:
1. **Step 1:** Personal information
2. **Step 2:** Service selection
3. **Step 3:** Dynamic questions (changes based on service)
4. **Step 4:** Project description
5. **Step 5:** Review and submit

Dynamic questions for each service:
- **Website Development:** Existing website, business type, pages needed, features, goals
- **Branding:** Existing logo, industry, style preferences, colors
- **SEO:** Website URL, competitors, target audience
- **Ads:** Campaign goals, target audience, budget

## Contact Information

Update these in the components as needed:

- **Phone:** +383 45 949 507
- **Email:** weblaunchdigital@gmail.com
- **Instagram:** @getweblaunch

## Customization

### Colors
Edit \`tailwind.config.ts\` to match your logo colors:
\`\`\`typescript
colors: {
  primary: {
    500: '#0070f3', // Your primary color
    // ... other shades
  }
}
\`\`\`

### Translations
Edit files in \`messages/\` directory to customize text for each language.

### Services
Add or modify services in:
- \`messages/*.json\` (translations)
- \`components/services/ServiceGrid.tsx\`
- \`components/contact/ContactForm.tsx\` (dynamic questions)

## Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms
- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Traditional hosting with Node.js support

## Email Configuration

The contact form uses Gmail SMTP. For production:

1. Use a dedicated business email
2. Set up SPF/DKIM records
3. Consider using:
   - SendGrid
   - AWS SES
   - Mailgun
   - Postmark

## SEO Optimization

The site includes:
- Multilingual metadata
- Open Graph tags
- Semantic HTML
- Fast loading times
- Mobile optimization

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Optimized images
- Code splitting
- Lazy loading
- Server-side rendering
- Static generation where possible

## Support

For questions or issues:
- Email: weblaunchdigital@gmail.com
- WhatsApp: +383 45 949 507

## License

Proprietary - © 2026 WEB LAUNCH. All rights reserved.

---

Built with ❤️ by WEB LAUNCH
