# Popover Issues

## React-specific

- The popover's open/closed state lives entirely in the DOM, outside React's model. You can't read it from React
  state, react to it in effects, or see it in DevTools. If anything else needed to respond to the panel being open
  (e.g. disabling background scroll), there's no clean hook.
- popoverTarget / popoverTargetAction weren't in React 18's TypeScript definitions until late in the 18.3 cycle.
  This project targets ^18.3.1, so depending on the exact version installed you may get TS errors or unknown prop
  warnings.

## CSS feature support

- @starting-style and transition-behavior: allow-discrete (used for the slide-in animation) are only in Chrome
  117+, Firefox 129+, Safari 17.5+. On older browsers the panel appears/disappears with no animation — there's no
  graceful fallback.
- No feature detection or @supports guard around those animation rules.

## Structural coupling

- The popover's identity is a bare DOM id="navigation". The CSS in src/index.css, the trigger buttons, and the hide
   buttons all hard-code that string. It can't be reused, composed, or rendered more than once in the page.

## Accessibility gaps (fixed)

- The <nav> has no aria-label, so screen readers just announce "navigation" with no context.
- When the popover closes, focus returns to <body>, not back to the "Exercises" button that opened it. The Popover
  API doesn't handle focus restoration the way a proper dialog (<dialog>) does.

## Double-close logic

- Each nav item does two things simultaneously: popoverTargetAction="hide" (DOM) and navigate(ex.path) (React
  Router). The order isn't guaranteed to matter here, but it's redundant — one popoverTarget handler and a
  beforeNavigate-style hook would be cleaner.

## No fallback

- Browsers without Popover API support (notably Firefox before 125, which only shipped in April 2024) get a broken
  layout where #navigation renders inline in document flow, not as a panel.

The pattern is well-suited for this demo context, but the lack of React state integration and the reliance on cutting-edge CSS features are the most relevant practical constraints for production use.
