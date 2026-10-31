# Vanshika's Hogwarts Birthday — React Edition

A front-end-only React + Vite birthday experience with a Three.js-powered enchanted spellbook, floating candles, and golden snitch, a cinematic night-sky atmosphere, responsive story sections, a Framer Motion Hogwarts-envelope invitation with an interactive wax seal, Daily Prophet portrait, playlist, Patronus card, Mirror of Erised placeholder, and birthday wish celebration.

## Requirements
- Node.js 18.18+ (Node 20 LTS recommended)
- npm

## Run locally
1. Extract this ZIP.
2. Open the extracted folder in VS Code.
3. Open the VS Code terminal in this folder.
4. Run:

   npm install
   npm run dev

5. Open the local URL printed by Vite (usually http://localhost:5173).

## Production build
   npm run build

The production-ready site will be generated in `dist/`.

## Customize
- Main page content and interactions: `src/App.jsx`
- Invitation experience: `src/InvitationExperience.jsx`
- Styling and responsive layout: `src/styles.css`
- 3D scene: `src/MagicScene.jsx`
- Portrait image: `public/assets/azkaban-mugshot.png`
- Project setup: `package.json`

## Notes
- This is a front-end-only project. It does not need a backend or database.
- The interactive 3D scene is rendered with React Three Fiber / Three.js and respects `prefers-reduced-motion`.
- The invitation animations use Framer Motion and provide a user-controlled synthesized chime.
- Replace the timeline and Mirror of Erised placeholders with your own photos when ready.
- The portrait is currently a still image. You can replace it with a GIF or MP4 later.
