# Contribution Intelligence Dashboard

A production-style developer portfolio for **Urval**, focused on open source contributions in cybersecurity and systems engineering. The site is designed as a contribution intelligence dashboard rather than a traditional portfolio, highlighting upstream impact, technical depth, and engineering state.

## Tech Stack

- React + Vite
- JavaScript
- Modular global CSS
- Framer Motion
- lucide-react

## Project Structure

```text
root/
├── public/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── cards/
│   │   ├── layout/
│   │   └── ui/
│   ├── data/
│   ├── hooks/
│   ├── sections/
│   ├── styles/
│   ├── App.jsx
│   └── main.jsx
├── .gitignore
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Build for production:

   ```bash
   npm run build
   ```

4. Preview the production build locally:

   ```bash
   npm run preview
   ```

## Deployment

### Vercel

1. Push the repository to GitHub.
2. Import the repository into Vercel.
3. Keep the default Vite settings:
   - Build command: `npm run build`
   - Output directory: `dist`
4. Deploy.

### GitHub Pages

1. Run `npm run build`.
2. Upload the generated `dist` directory to your Pages branch or publish it with your preferred static hosting workflow.
3. If you deploy to a repository subpath, update `vite.config.js` with the correct `base` value before building.

## Notes

- Contribution content is centralized in `src/data/contributions.js`.
- Filtering is managed through `src/hooks/useContributionFilter.js`.
- Shared UI primitives and cards keep the dashboard maintainable and easy to extend.
