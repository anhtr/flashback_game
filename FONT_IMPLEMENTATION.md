# Font Implementation Notes

## Overview
This document describes the font implementation for issues #33, #34, and #35.

## Issue #33: Noto Serif Font Family ✅ COMPLETE
Successfully implemented self-hosted Noto Serif fonts:
- Regular, Bold, Italic, and Bold Italic variants
- WOFF2 (optimized) and TTF (fallback) formats
- All fonts served locally from `/fonts` directory
- Proper fallback chain: `'Noto Serif', 'Noto Color Emoji', Georgia, 'Times New Roman', serif`

## Issue #34: Variable Font Width for Small Screens ⚠️ WORKAROUND
**Limitation**: The static Noto Serif fonts currently used do not support the variable font width axis (`wdth`).

**Workaround Implemented**: 
- Using CSS `font-stretch` property with progressive media queries
- Font width reduces smoothly from 100% (normal) to 75% (condensed) as viewport narrows
- Breakpoints: 768px (95%), 640px (90%), 560px (87%), 480px (83%), 400px (80%), 360px (77%), 320px (75%)
- At 320px and below, font-stretch is locked at 75%

**Ideal Solution**: 
To fully implement the variable font width feature as specified in issue #34, the project would need:
1. Noto Serif Variable Font (VF) files with width axis support
2. Use `font-variation-settings: 'wdth' <value>` instead of `font-stretch`
3. This would require downloading from Google Fonts or another source

**Browser Compatibility**: 
- `font-stretch` has good browser support (IE 9+, all modern browsers)
- Not as granular as true variable fonts, but provides similar visual effect

## Issue #35: Noto Emoji Fonts ⚠️ PARTIAL
**Implemented**:
- Noto Color Emoji font added and self-hosted
- WOFF2 (9.2MB) and TTF (11MB) formats
- Added to font-family stack for emoji rendering

**Limitation**: 
- Noto Emoji (black and white variant) is not available in system packages
- Would require manual download from Google Fonts or GitHub
- Currently only color emoji is available

**Current Behavior**:
- All emoji use Noto Color Emoji (color version)
- If an emoji character is not available, falls back to system fonts

**To Implement Black and White Emoji**:
1. Download Noto Emoji font files from: https://github.com/googlefonts/noto-emoji
2. Add to `/fonts` directory
3. Update CSS to prioritize black and white variant:
   ```css
   font-family: 'Noto Serif', 'Noto Emoji', 'Noto Color Emoji', ...
   ```

## File Sizes
- Noto Serif Regular: 170KB (woff2), 576KB (ttf)
- Noto Serif Bold: 175KB (woff2), 598KB (ttf)
- Noto Serif Italic: 189KB (woff2), 623KB (ttf)
- Noto Serif Bold Italic: 195KB (woff2), 642KB (ttf)
- Noto Color Emoji: 9.2MB (woff2), 11MB (ttf)

Total: ~12.9MB (woff2) or ~15.6MB (ttf)

## Testing
Tested on:
- Desktop: 1024px viewport - normal font width (100%)
- Mobile: 480px viewport - condensed font width (83%)
- Small mobile: 320px viewport - most condensed font width (75%)
- Both light and dark modes

All fonts load correctly with proper fallbacks.
