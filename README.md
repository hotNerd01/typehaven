# TypeHaven

A minimal, highly customizable typing test inspired by Monkeytype.

## Features

- **Modes**: Time (15/30/60/120s), Words (10/25/50/100), Quote, Code, Numbers, Zen
- **Live stats**: WPM & accuracy while typing
- **10 built-in themes** + full custom color theme editor
- **Sound effects**: click, error, and finish chime (Web Audio, no files)
- **Caret options**: bar / block / underline / outline / off + smooth + blink
- **Personal bests** saved in localStorage
- **Share results** to X (Twitter), Discord, or clipboard
- **Keyboard-first**: Tab + Enter to restart
- Clean dark UI matching the spirit of Monkeytype

## Deploy

### Netlify
1. Drag & drop the `typehaven` folder onto [app.netlify.com/drop](https://app.netlify.com/drop)  
   **or**
2. Connect a GitHub repo and set publish directory to the folder containing `index.html`.

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. From this folder: `vercel`
3. Or import the folder / repo in the Vercel dashboard (Framework Preset: Other).

No build step required — pure static HTML/CSS/JS.

## Local preview

Open `index.html` in a browser, or:

```bash
npx serve .
```

## Next steps you can add

- Real OAuth connectors (X, Discord, Reddit) so a new PB auto-posts
- Account system + cloud sync (Firebase / Supabase)
- Leaderboards
- More languages & funbox modifiers
- Custom text paste mode

Built for pure typing practice. Own it and extend it.
