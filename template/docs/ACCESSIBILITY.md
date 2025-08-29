# Bible RPG Template - Accessibility Guide

## Overview

This template meets WCAG 2.1 AA accessibility standards and provides comprehensive support for users with disabilities.

## Accessibility Features

### Screen Reader Support
- **ARIA Live Regions**: Dynamic content announcements
- **Semantic HTML**: Proper heading hierarchy and landmarks
- **Alternative Text**: All images have descriptive alt attributes
- **Form Labels**: Every form control has an associated label

### Keyboard Navigation
- **Tab Order**: Logical navigation flow
- **Focus Indicators**: Visible focus states for all interactive elements
- **Skip Links**: Quick navigation to main content
- **Arrow Key Support**: Game controls using arrow keys

### Visual Accessibility
- **High Contrast Mode**: Toggle for better visibility
- **Large Text Option**: Scalable text sizes
- **Color Contrast**: WCAG AA compliant contrast ratios
- **No Color-Only Information**: Information conveyed through multiple means

### Motor Disabilities
- **Large Touch Targets**: Minimum 44px target size
- **Reduced Motion**: Respects prefers-reduced-motion
- **Keyboard Alternatives**: All mouse interactions have keyboard equivalents

### Cognitive Accessibility
- **Clear Navigation**: Consistent interface patterns
- **Error Prevention**: Form validation with clear messages
- **Progress Indicators**: Clear feedback for loading states
- **Simple Language**: Clear, concise content

## Testing Checklist

### Screen Reader Testing
- [ ] NVDA (Windows)
- [ ] JAWS (Windows)
- [ ] VoiceOver (macOS/iOS)
- [ ] TalkBack (Android)

### Keyboard Testing
- [ ] Tab navigation works correctly
- [ ] All interactive elements are reachable
- [ ] Focus is visible
- [ ] Game controls work with keyboard

### Visual Testing
- [ ] High contrast mode functions
- [ ] Text scaling works
- [ ] Color contrast meets WCAG AA
- [ ] UI remains usable at 200% zoom

### Automated Testing Tools
- [ ] axe-core DevTools extension
- [ ] WAVE Web Accessibility Evaluator
- [ ] Lighthouse accessibility audit
- [ ] Pa11y command line tool

## Implementation Notes

### ARIA Patterns Used
- `role="application"` for game canvas
- `aria-live="polite"` for status updates
- `aria-live="assertive"` for urgent messages
- `role="progressbar"` for health/XP bars
- `aria-expanded` for dropdown states

### Keyboard Shortcuts
- `Tab` / `Shift+Tab`: Navigate interface
- `Arrow Keys`: Move character
- `Space`: Interact/action
- `Escape`: Open/close menus
- `Alt+C`: Toggle high contrast
- `Alt+T`: Toggle large text
- `Alt+M`: Toggle reduced motion

### Focus Management
- Focus is trapped in modals
- Focus is restored when closing modals
- Skip links allow bypassing navigation
- Roving tabindex for button groups

## Customization Guide

### Adding New Interactive Elements
```javascript
// Ensure all interactive elements are keyboard accessible
element.addEventListener('click', handleClick);
element.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    handleClick();
  }
});
```

### Announcing Dynamic Content
```javascript
// Use the screen reader announcer
BibleRPG.Accessibility.announce('Quest completed!', 'polite');
```

### Adding ARIA Attributes
```html
<!-- Progress bars -->
<div role="progressbar" aria-valuenow="75" aria-valuemin="0" aria-valuemax="100">
  Health: 75/100
</div>

<!-- Form controls -->
<label for="setting-volume">Master Volume</label>
<input id="setting-volume" type="range" aria-describedby="volume-help">
<div id="volume-help">Adjust the overall game volume</div>
```

## Common Issues and Solutions

### Issue: Screen Reader Not Announcing Changes
**Solution**: Use ARIA live regions or the built-in announcer system

### Issue: Focus Lost After Dynamic Content Update
**Solution**: Manually restore focus to appropriate element

### Issue: Game Canvas Not Accessible
**Solution**: Canvas has proper ARIA labels and keyboard controls

### Issue: Mobile Touch Targets Too Small
**Solution**: All interactive elements are minimum 44px

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Screen Reader Testing](https://webaim.org/articles/screenreader_testing/)
- [Color Contrast Checker](https://webaim.org/resources/contrastchecker/)

## Support

For accessibility-related questions or issues, please:
1. Check this guide for common solutions
2. Test with actual screen readers
3. Validate with automated tools
4. Consider user feedback from the disability community