# Invoicerly — Invoice Generator

A modern, responsive invoice generator built with Next.js 15, Tailwind CSS, and Framer Motion.

## Features

- Next.js 15 with App Router
- Tailwind CSS v4 for styling
- Framer Motion animations
- Responsive design for all devices
- TypeScript for type safety
- Modular components for reusability

## Tech Stack

- Framework: Next.js 15 (App Router)
- Styling: Tailwind CSS v4
- Animations: Framer Motion
- Language: TypeScript
- Icons: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd invoicegen
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open http://localhost:3000 in your browser.

## Project Structure

```
src/
  app/                    # Next.js App Router
    globals.css           # Global styles
    layout.tsx            # Root layout
    page.tsx              # Home page
    generator/page.tsx    # Invoice generator page
  components/             # React components
    demo/                 # Demo-related components
    layout/               # Layout components
    sections/             # Page sections
    ui/                   # Reusable UI components
    index.ts              # Component exports
  lib/                    # Utilities and data
    data.ts               # Static data
    theme.ts              # Theme configuration
  types/                  # TypeScript type definitions
    index.ts              # Type exports
```

## Components

### UI Components
- `Button` — Animated button with variants
- `Input` — Form input with validation
- `Textarea` — Textarea with animations
- `Card` — Container with hover effects

### Layout Components
- `Header` — Navigation header
- `Footer` — Site footer
- `Section` — Page section wrapper

### Section Components
- `Hero` — Landing page hero section
- `WhyUs` — Features showcase
- `Pricing` — Pricing plans
- `Testimonials` — Customer testimonials
- `Contact` — Contact form
- `TrustedBy` — Trust indicators
- `TemplatesGallery` — Template showcase

### Demo Components
- `DemoPreview` — Demo container with live preview
- `InvoiceForm` — Static invoice form example (read-only)
- `InvoicePaper` — Live invoice preview
- `ItemRow` — Invoice line item display component

## Available Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Customization

### Theme
Edit `src/lib/theme.ts` to customize colors and styling.

### Data
Update `src/lib/data.ts` to modify pricing plans, testimonials, and features.

### Components
All components are modular and can be easily customized or extended.

## Deployment

The app can be deployed to any platform that supports Next.js:

- Vercel (recommended)
- Netlify
- AWS Amplify
- Railway

## License

This project is licensed under the MIT License.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Support

For support, email info@invoicerly.co.uk or create an issue in the repository.

