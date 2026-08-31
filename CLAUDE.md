# Anime.js v4 Quick Reference (Condensed)

## 🚨 CRITICAL: USE V4 SYNTAX ONLY
NEVER use `import anime from 'animejs'` - that's v3!

## 🚀 Essential Setup (MANDATORY)
```js
// 1. Correct v4 import
import { animate, createTimeline, stagger, utils, svg, engine } from 'animejs';

// 2. Set time units to seconds (do this ONCE at app start)
engine.timeUnit = 's';

// 3. Use single line for simple animations
animate('.element', { x: 250, duration: 1, ease: 'outQuad' });  // ✅ GOOD
```

## ✅ Quick Validation Checklist
Before using anime.js code:
- [ ] Set `engine.timeUnit = 's'` at app start
- [ ] Using seconds for durations (1 = 1 second)
- [ ] Simple animations on ONE LINE
- [ ] Import uses `{ animate, ... }` NOT `anime`
- [ ] Using `animate()` NOT `anime()`
- [ ] Using `ease:` NOT `easing:`
- [ ] NO `targets` property
- [ ] Callbacks have `on` prefix
- [ ] Using `createTimeline()` for timelines

## 🎯 Quick Syntax Reference

### Basic Animation (ALWAYS single line for simple tweens)
```js
// ✅ CORRECT - v4 (using seconds, single line)
animate('.element', { x: 250, rotate: 180, duration: 0.8, ease: 'inOutQuad' });

// ❌ WRONG - v3 (NEVER USE)
anime({ targets: '.element', translateX: 250, easing: 'easeInOutQuad' });
```

### Timeline
```js
// ✅ CORRECT - v4 (using seconds)
const tl = createTimeline({ defaults: { duration: 1 } });
tl.add('.el1', { x: 100 })
  .add('.el2', { y: 100 }, '+=0.2')  // 0.2s after previous
  .add('.el3', { scale: 2 }, '<');   // at start of previous

// ❌ WRONG - v3
const tl = anime.timeline();
```

### Stagger (single line)
```js
// ✅ CORRECT - v4 (using seconds)
animate('.items', { x: 100, delay: stagger(0.1) });  // 0.1s between each
animate('.items', { y: 50, delay: stagger(0.1, { from: 'center' }) });

// ❌ WRONG - v3
anime({ targets: '.items', stagger: 100 });
```

## 📋 Property Quick Reference

| v3 (WRONG) | v4 (CORRECT) | Notes |
|---|---|---|
| `targets: '.el'` | First parameter | `animate('.el', {...})` |
| `easing: 'easeInOutQuad'` | `ease: 'inOutQuad'` | No 'ease' prefix |
| `value: 100` | `to: 100` | For animation values |
| `direction: 'alternate'` | `alternate: true` | Boolean property |
| `loop: true` | `loop: true` | Same syntax |
| `complete: fn` | `onComplete: fn` | All callbacks prefixed with 'on' |
| `translateX` | `x` (preferred) or `translateX` | Shorthand available |

## 🎨 Common Patterns (All single line)
```js
// Fade in
animate('.el', { opacity: [0, 1], y: [20, 0], duration: 0.6 });

// Infinite loop
animate('.el', { rotate: 360, duration: 2, loop: true });

// Scale bounce
animate('.el', { scale: [0, 1], duration: 0.8, ease: 'outElastic(1, 0.5)' });

// Hover effect (single line per event)
el.addEventListener('mouseenter', () => animate(el, { scale: 1.1, duration: 0.3 }));
el.addEventListener('mouseleave', () => animate(el, { scale: 1, duration: 0.3 }));
```

## 🔴 Common Mistakes to Avoid
- Wrong import: `import anime from 'animejs'` ❌
- Using `targets:` `{ targets: '.el' }` ❌
- Wrong easing: `{ easing: 'easeInOutQuad' }` ❌
- Using `value:` `{ x: { value: 100 } }` ❌
- Wrong timeline: `anime.timeline()` ❌
- Wrong callbacks: `{ complete: fn }` ❌

## 🔄 Transform Shorthands (Preferred)
```js
// Prefer shorthand (single line)
animate('.el', { x: 100, y: 50, z: 25, duration: 0.5 });

// Also valid but verbose
animate('.el', { translateX: 100, translateY: 50, translateZ: 25, duration: 0.5 });
```

**Remember:** If you see `anime({ targets: ... })` it's v3 - UPDATE IT!
