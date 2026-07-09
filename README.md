# BrainMax

Brain training app refactored into a modular no-build architecture.

## Structure

- `index.html`: shell markup only
- `styles/`: split by tokens, layout, and feature areas
- `src/`: state, theme, navigation, visuals, data, and game modules
- `src/games/`: one module per game plus shared engine

Runs directly from static hosting like GitHub Pages or raw.githack.