# CARS24 Warranty Page

A pixel-perfect, production-grade warranty page built from the CARS24 Figma design system with antigravity microanimations.

## Features

- 🎯 **Figma-accurate** — Built from WARRANTY-2025 Figma file
- 🚀 **Antigravity microanimations** — Cursor tracking, parallax, magnetic buttons, particle effects
- 🎨 **Cars24 design tokens** — Brand blue #4736FE, Geist-equivalent typography
- 📱 **Mobile-first** — 430px max-width optimized for mobile

## Animation System

| Animation | Trigger |
|-----------|---------|
| Custom cursor + ring | Mouse move |
| Particle burst | Click anywhere |
| Magnetic buttons | Hover Proceed / Skip buttons |
| Scroll reveal | Scroll into viewport |
| Parallax layers | Scroll (stamp, car, coin) |
| Counter animation | Stats section enters view |
| Risk graph draw | Graph section enters view |
| Car float | Continuous on coverage card |
| Stamp bounce | Page load |
| Ripple effect | Click tabs, cards, CTA |

## Deploy to Vercel

### Option 1: Vercel CLI
```bash
npm install -g vercel
cd cars24-warranty
npm install
vercel
```

### Option 2: Vercel Dashboard
1. Push this folder to a GitHub repo
2. Go to vercel.com → New Project
3. Import the repo
4. Framework: **Vite**
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click Deploy

### Option 3: Drag & Drop
```bash
npm install
npm run build
```
Drag the `dist/` folder to vercel.com/new

## Local Dev
```bash
npm install
npm run dev
```

Open http://localhost:5173
