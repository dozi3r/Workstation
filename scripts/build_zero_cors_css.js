/**
 * Zero-CORS Utility CSS Generator & Offline Hardening Tool
 * Targets: Companion HTML surfaces using external CDN/fonts
 * Authority: Wave 4 Technical Debt Remediation
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');

const PALETTE = {
  slate: {
    50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8',
    500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 900: '#0f172a', 950: '#020617'
  },
  amber: {
    100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b',
    600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
  },
  emerald: {
    100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981',
    600: '#059669', 700: '#047857', 800: '#065f46', 900: '#064e3b', 950: '#022c22'
  },
  sky: {
    100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9',
    600: '#0284c7', 700: '#0369a1', 800: '#075985', 900: '#0c4a6e', 950: '#082f49'
  },
  cyan: {
    100: '#cffafe', 200: '#a5f3fc', 300: '#67e8f9', 400: '#22d3ee', 500: '#06b6d4',
    600: '#0891b2', 700: '#0e7490', 800: '#155e75', 900: '#164e63', 950: '#083344'
  },
  indigo: {
    100: '#e0e7ff', 200: '#c7d2fe', 300: '#a5b4fc', 400: '#818cf8', 500: '#6366f1',
    600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 900: '#312e81', 950: '#1e1b4b'
  },
  purple: {
    100: '#f3e8ff', 200: '#e9d5ff', 300: '#d8b4fe', 400: '#c084fc', 500: '#a855f7',
    600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 900: '#581c87', 950: '#3b0764'
  },
  rose: {
    100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e',
    600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
  },
  red: {
    100: '#fee2e2', 200: '#fecaca', 300: '#fca5a5', 400: '#f87171', 500: '#ef4444',
    600: '#dc2626', 700: '#b91c1c', 800: '#991b1b', 900: '#7f1d1d', 950: '#450a0a'
  },
  blue: {
    100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6',
    600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
  },
  pink: {
    300: '#f9a8d4', 500: '#ec4899', 600: '#db2777', 800: '#9d174d', 950: '#500724'
  },
  teal: {
    300: '#5eead4', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 950: '#042f2e'
  },
  orange: {
    300: '#fdba74', 500: '#f97316', 600: '#ea580c', 950: '#431407'
  }
};

const SPACING = {
  '0': '0px', '0.2': '0.05rem', '0.5': '0.125rem', '1': '0.25rem', '1.5': '0.375rem',
  '2': '0.5rem', '2.5': '0.625rem', '3': '0.75rem', '3.5': '0.875rem', '4': '1rem',
  '5': '1.25rem', '6': '1.5rem', '7': '1.75rem', '8': '2rem', '10': '2.5rem', '12': '3rem',
  '14': '3.5rem', '16': '4rem', '20': '5rem', '24': '6rem', '36': '9rem',
  '56': '14rem', '80': '20rem', 'auto': 'auto', 'full': '100%', 'screen': '100vh'
};

function hexToRgba(hex, alpha) {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resolveColor(colorStr, opacity) {
  if (!colorStr) return null;
  if (colorStr === 'white') return opacity !== null ? `rgba(255, 255, 255, ${opacity})` : '#ffffff';
  if (colorStr === 'black') return opacity !== null ? `rgba(0, 0, 0, ${opacity})` : '#000000';
  if (colorStr === 'transparent') return 'transparent';
  if (colorStr.startsWith('[#')) {
    const hex = colorStr.slice(1, -1);
    return opacity !== null ? hexToRgba(hex, opacity) : hex;
  }
  if (colorStr.startsWith('[var(')) {
    return colorStr.slice(1, -1);
  }
  const parts = colorStr.split('-');
  if (parts.length === 2 && PALETTE[parts[0]] && PALETTE[parts[0]][parts[1]]) {
    const hex = PALETTE[parts[0]][parts[1]];
    return opacity !== null ? hexToRgba(hex, opacity) : hex;
  }
  return null;
}

function escapeSelector(cls) {
  return cls.replace(/([#:\/\[\]\.\$%])/g, '\\$1');
}

function generateCssForClass(rawCls) {
  let cls = rawCls;
  let prefix = '';
  if (cls.startsWith('hover:')) { prefix = 'hover'; cls = cls.slice(6); }
  else if (cls.startsWith('focus:')) { prefix = 'focus'; cls = cls.slice(6); }
  else if (cls.startsWith('md:')) { prefix = 'md'; cls = cls.slice(3); }
  else if (cls.startsWith('lg:')) { prefix = 'lg'; cls = cls.slice(3); }
  else if (cls.startsWith('group-hover:')) { prefix = 'group-hover'; cls = cls.slice(12); }

  const sel = '.' + escapeSelector(rawCls);
  let decl = null;

  // Layout & Display
  if (cls === 'flex') decl = 'display: flex;';
  else if (cls === 'inline-flex') decl = 'display: inline-flex;';
  else if (cls === 'grid') decl = 'display: grid;';
  else if (cls === 'block') decl = 'display: block;';
  else if (cls === 'inline-block') decl = 'display: inline-block;';
  else if (cls === 'hidden') decl = 'display: none;';
  else if (cls === 'contents') decl = 'display: contents;';
  else if (cls === 'flex-col') decl = 'flex-direction: column;';
  else if (cls === 'flex-row') decl = 'flex-direction: row;';
  else if (cls === 'flex-wrap') decl = 'flex-wrap: wrap;';
  else if (cls === 'flex-1') decl = 'flex: 1 1 0%;';
  else if (cls === 'flex-grow') decl = 'flex-grow: 1;';
  else if (cls === 'shrink-0') decl = 'flex-shrink: 0;';
  else if (cls === 'items-center') decl = 'align-items: center;';
  else if (cls === 'items-start') decl = 'align-items: flex-start;';
  else if (cls === 'items-stretch') decl = 'align-items: stretch;';
  else if (cls === 'justify-between') decl = 'justify-content: space-between;';
  else if (cls === 'justify-center') decl = 'justify-content: center;';
  else if (cls === 'justify-end') decl = 'justify-content: flex-end;';
  else if (cls === 'self-center') decl = 'align-self: center;';
  else if (cls === 'relative') decl = 'position: relative;';
  else if (cls === 'absolute') decl = 'position: absolute;';
  else if (cls === 'fixed') decl = 'position: fixed;';
  else if (cls === 'sticky') decl = 'position: sticky;';
  else if (cls === 'inset-0') decl = 'top: 0; right: 0; bottom: 0; left: 0;';
  else if (cls === 'top-0') decl = 'top: 0;';
  else if (cls === 'top-2.5') decl = 'top: 0.625rem;';
  else if (cls === 'top-4') decl = 'top: 1rem;';
  else if (cls === 'top-5') decl = 'top: 1.25rem;';
  else if (cls === 'left-3') decl = 'left: 0.75rem;';
  else if (cls === 'left-4') decl = 'left: 1rem;';
  else if (cls === 'right-5') decl = 'right: 1.25rem;';
  else if (cls === 'bottom-4') decl = 'bottom: 1rem;';
  else if (cls.startsWith('z-')) decl = `z-index: ${cls.slice(2)};`;
  else if (cls === 'overflow-hidden') decl = 'overflow: hidden;';
  else if (cls === 'overflow-x-auto') decl = 'overflow-x: auto;';
  else if (cls === 'overflow-y-auto') decl = 'overflow-y: auto;';
  else if (cls === 'pointer-events-none') decl = 'pointer-events: none;';
  else if (cls === 'select-none') decl = 'user-select: none;';
  else if (cls === 'cursor-pointer') decl = 'cursor: pointer;';
  else if (cls === 'cursor-crosshair') decl = 'cursor: crosshair;';
  else if (cls === 'truncate') decl = 'overflow: hidden; text-overflow: ellipsis; white-space: nowrap;';
  else if (cls === 'whitespace-nowrap') decl = 'white-space: nowrap;';
  else if (cls === 'italic') decl = 'font-style: italic;';
  else if (cls === 'uppercase') decl = 'text-transform: uppercase;';
  else if (cls === 'normal-case') decl = 'text-transform: none;';
  else if (cls === 'underline') decl = 'text-decoration-line: underline;';
  else if (cls === 'antialiased') decl = '-webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;';
  else if (cls === 'list-disc') decl = 'list-style-type: disc;';
  else if (cls === 'border-collapse') decl = 'border-collapse: collapse;';
  else if (cls === 'animate-pulse') decl = 'animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;';
  else if (cls === 'line-clamp-2') decl = 'display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;';
  else if (cls === 'text-center') decl = 'text-align: center;';
  else if (cls === 'text-left') decl = 'text-align: left;';
  else if (cls === 'text-right') decl = 'text-align: right;';

  // Sizing w-*, h-*, min-*, max-*
  else if (cls.startsWith('w-')) {
    const val = cls.slice(2);
    if (val === '1/4') decl = 'width: 25%;';
    else if (val.startsWith('[')) decl = `width: ${val.slice(1, -1)};`;
    else if (SPACING[val]) decl = `width: ${SPACING[val]};`;
  } else if (cls.startsWith('h-')) {
    const val = cls.slice(2);
    if (val.startsWith('[')) decl = `height: ${val.slice(1, -1)};`;
    else if (SPACING[val]) decl = `height: ${SPACING[val]};`;
  } else if (cls.startsWith('min-h-')) {
    const val = cls.slice(6);
    if (val.startsWith('[')) decl = `min-height: ${val.slice(1, -1)};`;
    else if (SPACING[val]) decl = `min-height: ${SPACING[val]};`;
  } else if (cls.startsWith('min-w-')) {
    const val = cls.slice(6);
    if (val === '0') decl = 'min-width: 0px;';
    else if (val.startsWith('[')) decl = `min-width: ${val.slice(1, -1)};`;
  } else if (cls.startsWith('max-h-')) {
    const val = cls.slice(6);
    if (val.startsWith('[')) decl = `max-height: ${val.slice(1, -1)};`;
    else if (SPACING[val]) decl = `max-height: ${SPACING[val]};`;
  } else if (cls.startsWith('max-w-')) {
    const val = cls.slice(6);
    const maxMap = {
      'xs': '20rem', 'sm': '24rem', 'md': '28rem', 'lg': '32rem', 'xl': '36rem',
      '2xl': '42rem', '3xl': '48rem', '4xl': '56rem', '5xl': '64rem', '6xl': '72rem', '7xl': '80rem'
    };
    if (maxMap[val]) decl = `max-width: ${maxMap[val]};`;
    else if (val.startsWith('[')) decl = `max-width: ${val.slice(1, -1)};`;
  }

  // Padding & Margin
  else if (/^p[trblxy]?-/.test(cls)) {
    const m = cls.match(/^p([trblxy])?-(.+)$/);
    const dir = m[1];
    let val = m[2];
    val = val.startsWith('[') ? val.slice(1, -1) : (SPACING[val] || val);
    if (!dir) decl = `padding: ${val};`;
    else if (dir === 't') decl = `padding-top: ${val};`;
    else if (dir === 'b') decl = `padding-bottom: ${val};`;
    else if (dir === 'l') decl = `padding-left: ${val};`;
    else if (dir === 'r') decl = `padding-right: ${val};`;
    else if (dir === 'x') decl = `padding-left: ${val}; padding-right: ${val};`;
    else if (dir === 'y') decl = `padding-top: ${val}; padding-bottom: ${val};`;
  } else if (/^m[trblxy]?-/.test(cls)) {
    const m = cls.match(/^m([trblxy])?-(.+)$/);
    const dir = m[1];
    let val = m[2];
    val = val.startsWith('[') ? val.slice(1, -1) : (SPACING[val] || val);
    if (!dir) decl = `margin: ${val};`;
    else if (dir === 't') decl = `margin-top: ${val};`;
    else if (dir === 'b') decl = `margin-bottom: ${val};`;
    else if (dir === 'l') decl = `margin-left: ${val};`;
    else if (dir === 'r') decl = `margin-right: ${val};`;
    else if (dir === 'x') decl = `margin-left: ${val}; margin-right: ${val};`;
    else if (dir === 'y') decl = `margin-top: ${val}; margin-bottom: ${val};`;
  }

  // Gap & Space
  else if (cls.startsWith('gap-')) {
    const val = cls.slice(4);
    decl = `gap: ${SPACING[val] || val};`;
  } else if (cls.startsWith('space-x-')) {
    const val = cls.slice(8);
    decl = `& > :not([hidden]) ~ :not([hidden]) { margin-left: ${SPACING[val] || val}; }`;
  } else if (cls.startsWith('space-y-')) {
    const val = cls.slice(8);
    decl = `& > :not([hidden]) ~ :not([hidden]) { margin-top: ${SPACING[val] || val}; }`;
  }

  // Grid columns
  else if (cls.startsWith('grid-cols-')) {
    const val = cls.slice(10);
    decl = `grid-template-columns: repeat(${val}, minmax(0, 1fr));`;
  } else if (cls.startsWith('col-span-')) {
    const val = cls.slice(9);
    decl = `grid-column: span ${val} / span ${val};`;
  }

  // Typography
  else if (cls.startsWith('text-')) {
    const val = cls.slice(5);
    const sizes = {
      'xs': 'font-size: 0.75rem; line-height: 1rem;',
      'sm': 'font-size: 0.875rem; line-height: 1.25rem;',
      'base': 'font-size: 1rem; line-height: 1.5rem;',
      'lg': 'font-size: 1.125rem; line-height: 1.75rem;',
      'xl': 'font-size: 1.25rem; line-height: 1.75rem;',
      '2xl': 'font-size: 1.5rem; line-height: 2rem;',
      '3xl': 'font-size: 1.875rem; line-height: 2.25rem;',
      '4xl': 'font-size: 2.25rem; line-height: 2.5rem;'
    };
    if (sizes[val]) decl = sizes[val];
    else if (val.startsWith('[')) {
      decl = `font-size: ${val.slice(1, -1)};`;
    } else {
      const [colPart, opPart] = val.split('/');
      const alpha = opPart ? (parseInt(opPart) / 100) : null;
      const c = resolveColor(colPart, alpha);
      if (c) decl = `color: ${c};`;
    }
  } else if (cls.startsWith('font-')) {
    const val = cls.slice(5);
    const weights = {
      'normal': 'font-weight: 400;', 'medium': 'font-weight: 500;', 'semibold': 'font-weight: 600;',
      'bold': 'font-weight: 700;', 'extrabold': 'font-weight: 800;', 'black': 'font-weight: 900;',
      'mono': 'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;'
    };
    if (weights[val]) decl = weights[val];
  } else if (cls.startsWith('leading-')) {
    const val = cls.slice(8);
    const leads = { 'none': '1;', 'tight': '1.25;', 'snug': '1.375;', 'normal': '1.5;', 'relaxed': '1.625;' };
    if (leads[val]) decl = `line-height: ${leads[val]}`;
  } else if (cls.startsWith('tracking-')) {
    const val = cls.slice(9);
    const tracks = { 'tight': '-0.025em;', 'normal': '0em;', 'wide': '0.025em;', 'wider': '0.05em;' };
    if (tracks[val]) decl = `letter-spacing: ${tracks[val]}`;
  }

  // Backgrounds
  else if (cls.startsWith('bg-')) {
    const val = cls.slice(3);
    if (val === 'gradient-to-r') decl = 'background-image: linear-gradient(to right, var(--tw-gradient-stops));';
    else if (val === 'gradient-to-b') decl = 'background-image: linear-gradient(to bottom, var(--tw-gradient-stops));';
    else if (val === 'gradient-to-tr') decl = 'background-image: linear-gradient(to top right, var(--tw-gradient-stops));';
    else {
      const [colPart, opPart] = val.split('/');
      const alpha = opPart ? (parseInt(opPart) / 100) : null;
      const c = resolveColor(colPart, alpha);
      if (c) decl = `background-color: ${c};`;
    }
  }

  // Gradients from-*, to-*, via-*
  else if (cls.startsWith('from-')) {
    const val = cls.slice(5);
    const [colPart, opPart] = val.split('/');
    const c = resolveColor(colPart, opPart ? parseInt(opPart)/100 : null);
    if (c) decl = `--tw-gradient-from: ${c}; --tw-gradient-to: rgba(0,0,0,0); --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to);`;
  } else if (cls.startsWith('to-')) {
    const val = cls.slice(3);
    const [colPart, opPart] = val.split('/');
    const c = resolveColor(colPart, opPart ? parseInt(opPart)/100 : null);
    if (c) decl = `--tw-gradient-to: ${c};`;
  } else if (cls.startsWith('via-')) {
    const val = cls.slice(4);
    const [colPart, opPart] = val.split('/');
    const c = resolveColor(colPart, opPart ? parseInt(opPart)/100 : null);
    if (c) decl = `--tw-gradient-to: rgba(0,0,0,0); --tw-gradient-stops: var(--tw-gradient-from), ${c}, var(--tw-gradient-to);`;
  }

  // Borders & Rounded
  else if (cls === 'border') decl = 'border-width: 1px; border-style: solid;';
  else if (cls === 'border-2') decl = 'border-width: 2px; border-style: solid;';
  else if (cls === 'border-b') decl = 'border-bottom-width: 1px; border-bottom-style: solid;';
  else if (cls === 'border-b-2') decl = 'border-bottom-width: 2px; border-bottom-style: solid;';
  else if (cls === 'border-t') decl = 'border-top-width: 1px; border-top-style: solid;';
  else if (cls === 'border-l') decl = 'border-left-width: 1px; border-left-style: solid;';
  else if (cls === 'border-dashed') decl = 'border-style: dashed;';
  else if (cls.startsWith('border-')) {
    const val = cls.slice(7);
    const [colPart, opPart] = val.split('/');
    const c = resolveColor(colPart, opPart ? parseInt(opPart)/100 : null);
    if (c) decl = `border-color: ${c};`;
  } else if (cls.startsWith('rounded')) {
    const rMap = {
      'rounded': 'border-radius: 0.25rem;', 'rounded-md': 'border-radius: 0.375rem;',
      'rounded-lg': 'border-radius: 0.5rem;', 'rounded-xl': 'border-radius: 0.75rem;',
      'rounded-2xl': 'border-radius: 1rem;', 'rounded-3xl': 'border-radius: 1.5rem;',
      'rounded-full': 'border-radius: 9999px;'
    };
    if (rMap[cls]) decl = rMap[cls];
  }

  // Shadows, Backdrop, Transitions
  else if (cls.startsWith('shadow')) {
    const sMap = {
      'shadow-sm': 'box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);',
      'shadow': 'box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);',
      'shadow-md': 'box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);',
      'shadow-lg': 'box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);',
      'shadow-xl': 'box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);',
      'shadow-2xl': 'box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);',
      'shadow-inner': 'box-shadow: inset 0 2px 4px 0 rgb(0 0 0 / 0.05);'
    };
    if (sMap[cls]) decl = sMap[cls];
    else if (cls.startsWith('shadow-')) {
      const col = resolveColor(cls.slice(7));
      if (col) decl = `--tw-shadow-color: ${col}; box-shadow: 0 10px 15px -3px var(--tw-shadow-color);`;
    }
  } else if (cls.startsWith('backdrop-blur')) {
    const bMap = {
      'backdrop-blur': 'backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);',
      'backdrop-blur-sm': 'backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px);',
      'backdrop-blur-md': 'backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);'
    };
    if (bMap[cls]) decl = bMap[cls];
  } else if (cls.startsWith('transition')) {
    decl = 'transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); transition-duration: 150ms;';
  } else if (cls.startsWith('duration-')) {
    decl = `transition-duration: ${cls.slice(9)}ms;`;
  }

  // Focus & Accent
  else if (cls === 'outline-none') decl = 'outline: 2px solid transparent; outline-offset: 2px;';
  else if (cls === 'ring-1') decl = 'box-shadow: 0 0 0 1px var(--tw-ring-color, #38bdf8);';
  else if (cls.startsWith('ring-')) {
    const c = resolveColor(cls.slice(5));
    if (c) decl = `--tw-ring-color: ${c};`;
  } else if (cls.startsWith('accent-')) {
    const c = resolveColor(cls.slice(7));
    if (c) decl = `accent-color: ${c};`;
  }

  // Placeholders
  else if (cls.startsWith('placeholder-')) {
    const c = resolveColor(cls.slice(12));
    if (c) decl = `&::placeholder { color: ${c}; }`;
  }

  // Divide
  else if (cls === 'divide-y') {
    decl = '& > :not([hidden]) ~ :not([hidden]) { border-top-width: 1px; border-top-style: solid; }';
  } else if (cls.startsWith('divide-')) {
    const [colPart, opPart] = cls.slice(7).split('/');
    const c = resolveColor(colPart, opPart ? parseInt(opPart)/100 : null);
    if (c) decl = `& > :not([hidden]) ~ :not([hidden]) { border-color: ${c}; }`;
  }

  // Transforms & SVG
  else if (cls === 'scale-110') decl = 'transform: scale(1.1);';
  else if (cls === 'scale-125') decl = 'transform: scale(1.25);';
  else if (cls === 'translate-x-0.5') decl = 'transform: translateX(0.125rem);';
  else if (cls.startsWith('fill-')) {
    const c = resolveColor(cls.slice(5));
    if (c) decl = `fill: ${c};`;
  } else if (cls.startsWith('stroke-')) {
    const c = resolveColor(cls.slice(7));
    if (c) decl = `stroke: ${c};`;
  }

  if (decl) {
    if (prefix === 'hover') {
      return `${sel}:hover { ${decl} }`;
    } else if (prefix === 'focus') {
      return `${sel}:focus { ${decl} }`;
    } else if (prefix === 'group-hover') {
      return `.group:hover ${sel} { ${decl} }`;
    } else if (prefix === 'md') {
      return `@media (min-width: 768px) { ${sel} { ${decl} } }`;
    } else if (prefix === 'lg') {
      return `@media (min-width: 1024px) { ${sel} { ${decl} } }`;
    } else {
      if (decl.includes('& >')) {
        return decl.replace('&', sel);
      } else if (decl.includes('&::')) {
        return decl.replace('&', sel);
      } else {
        return `${sel} { ${decl} }`;
      }
    }
  }
  return null;
}

function extractClassesFromContent(content) {
  const classes = new Set();
  const classMatches = content.matchAll(/class(?:Name)?\s*=\s*["'`]([^"'`]+)["'`]/g);
  for (const m of classMatches) {
    m[1].split(/\s+/).forEach(c => {
      c = c.replace(/^[${}"'`]+|[${}"'`]+$/g, '');
      if (c && !c.includes('${') && !c.includes('<?') && !c.includes('//')) {
        classes.add(c);
      }
    });
  }
  return [...classes];
}

function compileCssForFile(content) {
  const classes = extractClassesFromContent(content);
  const rules = [];
  // CSS Reset / baseline variables for tailwind
  rules.push('*, ::before, ::after { box-sizing: border-box; border-width: 0; border-style: solid; border-color: #e2e8f0; }');
  rules.push(':root { --tw-gradient-stops: var(--tw-gradient-from), var(--tw-gradient-to, rgba(0,0,0,0)); }');
  rules.push('@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: .5; } }');

  for (const cls of classes) {
    const rule = generateCssForClass(cls);
    if (rule) rules.push(rule);
  }
  return rules.join('\n');
}

function processFile(filePath) {
  const fullPath = path.isAbsolute(filePath) ? filePath : path.join(ROOT_DIR, filePath);
  if (!fs.existsSync(fullPath)) return;

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // 1. Replace tailwind script with inlined style or refresh zero-cors-tailwind
  if (content.includes('tailwindcss.min.js') || content.includes('cdn.tailwindcss.com')) {
    const compiledCss = compileCssForFile(content);
    const styleTag = `<style id="zero-cors-tailwind">\n${compiledCss}\n</style>`;
    content = content.replace(/<script[^>]+(?:tailwindcss\.min\.js|cdn\.tailwindcss\.com)[^>]*><\/script>/gi, styleTag);
    modified = true;
  } else if (content.includes('<style id="zero-cors-tailwind">')) {
    const compiledCss = compileCssForFile(content);
    const styleTag = `<style id="zero-cors-tailwind">\n${compiledCss}\n</style>`;
    content = content.replace(/<style id="zero-cors-tailwind">[\s\S]*?<\/style>/i, styleTag);
    modified = true;
  }

  // 2. Strip Google Fonts preconnect and css2 links
  if (content.includes('fonts.googleapis.com')) {
    content = content.replace(/<link[^>]+(?:fonts\.googleapis\.com|fonts\.gstatic\.com)[^>]*>/gi, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[OK] Zero-CORS offline hardening applied to ${filePath}`);
  }
}

// Execute on all target files
console.log('========================================================');
console.log('   CREATOR STUDIO - ZERO-CORS CSS & OFFLINE HARDENER    ');
console.log('========================================================\n');

const targets = [
  'admin.html',
  'network/platform_audit_dashboard.html',
  'network/odv_archetype_matrix.html',
  'tickets/tier_0/tier_0_project_visualizer.html',
  'tarot/tarot_deck_analytics.html'
];

targets.forEach(processFile);

// Also update templates / generators that emit external URLs:
// 1. tarot/generate_tarot_matrix.js
const genTarotPath = path.join(ROOT_DIR, 'tarot', 'generate_tarot_matrix.js');
if (fs.existsSync(genTarotPath)) {
  let gtc = fs.readFileSync(genTarotPath, 'utf8');
  gtc = gtc.replace(/<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com">/g, '');
  gtc = gtc.replace(/<link rel="preconnect" href="https:\/\/fonts\.gstatic\.com" crossorigin>/g, '');
  gtc = gtc.replace(/<link href="https:\/\/fonts\.googleapis\.com\/css2\?[^"]+" rel="stylesheet">/g, '');
  gtc = gtc.replace(/--font-sans:[^;\r\n]+;/, "--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;");
  gtc = gtc.replace(/--font-mono:[^;\r\n]+;/, "--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;");
  gtc = gtc.replace(/--font-serif:[^;\r\n]+;/, "--font-serif: 'Cinzel', Georgia, Cambria, 'Times New Roman', serif;");
  fs.writeFileSync(genTarotPath, gtc, 'utf8');
  console.log('[OK] Updated offline fonts in tarot/generate_tarot_matrix.js');
}

// 1b. tarot/tarot_deck_analytics.html
const analyticsHtmlPath = path.join(ROOT_DIR, 'tarot', 'tarot_deck_analytics.html');
if (fs.existsSync(analyticsHtmlPath)) {
  let ac = fs.readFileSync(analyticsHtmlPath, 'utf8');
  ac = ac.replace(/--font-sans:[^;\r\n]+;/, "--font-sans: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;");
  ac = ac.replace(/--font-mono:[^;\r\n]+;/, "--font-mono: 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;");
  ac = ac.replace(/--font-serif:[^;\r\n]+;/, "--font-serif: 'Cinzel', Georgia, Cambria, 'Times New Roman', serif;");
  fs.writeFileSync(analyticsHtmlPath, ac, 'utf8');
  console.log('[OK] Updated offline fonts in tarot/tarot_deck_analytics.html');
}

// 2. tickets/tier_0/build_tier_0_visualizer.js
const bldTier0Path = path.join(ROOT_DIR, 'tickets', 'tier_0', 'build_tier_0_visualizer.js');
if (fs.existsSync(bldTier0Path)) {
  let btc = fs.readFileSync(bldTier0Path, 'utf8');
  if (btc.includes('tailwindcss.min.js')) {
    // Generate compiled CSS for tier 0 template
    const tier0HtmlPath = path.join(ROOT_DIR, 'tickets', 'tier_0', 'tier_0_project_visualizer.html');
    const tier0Content = fs.existsSync(tier0HtmlPath) ? fs.readFileSync(tier0HtmlPath, 'utf8') : btc;
    const compiledCss = compileCssForFile(tier0Content);
    btc = btc.replace(/<script src="https:\/\/www\.gstatic\.com\/antigravity\/web\/dev\/tailwindcss\.min\.js"><\/script>/g, `<style id="zero-cors-tailwind">\n${compiledCss}\n</style>`);
    fs.writeFileSync(bldTier0Path, btc, 'utf8');
    console.log('[OK] Inlined offline CSS in tickets/tier_0/build_tier_0_visualizer.js');
  }
}

module.exports = {
  compileCssForFile,
  generateCssForClass,
  processFile
};
