## Contribution Intelligence Dashboard

A system I built to track, analyze, and present my real-world contributions to security-critical and performance-sensitive systems like Suricata, Zeek, and the Linux kernel.

Instead of listing projects, this work highlights:
- the problems I worked on
- the impact of each contribution
- what I learned while solving them

## Why This Project Exists

Traditional portfolios usually flatten technical work into screenshots and short descriptions. I wanted a way to present contributions the way engineers actually evaluate them:

- what changed
- why it mattered
- what I learned from the work
- how the work fits into larger systems such as Suricata, Zeek, and Linux networking

The result is a local-first contributions experience that highlights impact, debugging depth, and engineering context instead of generic UI polish alone.

## Key Features

- Searchable contribution tracking with clear technical titles, impact summaries, and engineering learnings
- High-impact contribution spotlight for the strongest systems work
- Lightweight recruiter-facing presentation with hidden admin tooling by default
- Local-first content management with versioned storage, backup, undo, and import/export
- Lightweight admin protection for controlled editing in a frontend-only environment

## Active Work

Some contributions are currently under review in active open-source projects.

## Tech Stack

- React
- Vite
- JavaScript
- Context API for app state
- Service-layer architecture for storage, auth, security, and validation
- Framer Motion
- lucide-react
- localStorage with schema versioning and migrations

## Screenshots

I was not able to capture and attach screenshots directly from this terminal environment, but the README is now structured for these three images:

- `docs/screenshots/hero.png` : name, positioning, and focus areas
- `docs/screenshots/high-impact.png` : 2 to 3 featured contribution cards
- `docs/screenshots/contributions-list.png` : clean searchable contribution list

Add them to the repo like this:

```md
![Hero](docs/screenshots/hero.png)
![High Impact Work](docs/screenshots/high-impact.png)
![Contributions List](docs/screenshots/contributions-list.png)
```

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## What I Learned

This project helped me think about frontend work as system design, not just presentation.

- I learned how to structure a React app so storage, validation, auth, and UI concerns stay separate.
- I learned how to present technical contributions in a way that is understandable to recruiters without losing engineering depth.
- I learned how far a frontend-only app can go with local-first architecture, versioned storage, backup recovery, and input hardening.
- I learned that product storytelling matters just as much as implementation quality when the goal is to communicate real technical work clearly.
