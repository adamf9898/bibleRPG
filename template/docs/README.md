# Bible RPG Template

A comprehensive, accessible, and modern template for the Bible RPG project featuring semantic HTML5, modular CSS, ES6+ JavaScript, and full WCAG compliance.

## Features

### 🎯 **Semantic HTML5 Structure**
- Semantic elements (`<header>`, `<main>`, `<section>`, `<aside>`, `<footer>`)
- Proper heading hierarchy (h1-h6)
- ARIA labels and roles for screen readers
- Structured data with JSON-LD

### 🎨 **Modern CSS Architecture**
- CSS Custom Properties (variables) for theming
- Mobile-first responsive design
- CSS Grid and Flexbox layouts
- Component-based styling
- Dark mode and high contrast support

### ⚡ **ES6+ JavaScript Modules**
- Modular architecture with clear separation of concerns
- Game engine with ECS pattern
- UI component system
- Comprehensive accessibility features
- Performance optimization

### ♿ **WCAG 2.1 AA Compliance**
- Screen reader announcements
- Keyboard navigation
- Focus management
- High contrast mode
- Reduced motion support
- Alternative text for all images

### 📱 **Progressive Web App (PWA)**
- Service worker for offline functionality
- Web app manifest
- Push notifications support
- Background sync
- Responsive design for all devices

### 🎮 **Game Features**
- Canvas-based rendering
- Sprite-based player movement
- Biblical NPCs and locations
- Quest system
- Inventory management
- Save/load functionality

## File Structure

```
template/
├── index.html              # Main HTML template
├── manifest.json           # PWA manifest
├── sw.js                   # Service worker
├── css/
│   ├── main.css            # Core styles and variables
│   ├── components.css      # UI component styles
│   └── responsive.css      # Responsive design rules
├── js/
│   ├── utils.js            # Utility functions
│   ├── game-engine.js      # Game engine core
│   ├── ui-components.js    # UI component system
│   ├── accessibility.js    # Accessibility features
│   └── main.js             # Application initialization
├── assets/
│   ├── images/             # Optimized images
│   └── icons/              # PWA icons and favicons
└── docs/
    ├── README.md           # This file
    ├── API.md              # API documentation
    ├── ACCESSIBILITY.md    # Accessibility guide
    └── DEPLOYMENT.md       # Deployment instructions
```

## Getting Started

### Prerequisites
- Modern web browser with ES6+ support
- Local web server (for development)

### Installation

1. Copy the template files to your project directory
2. Customize the placeholders in `index.html`:
   - `{{GAME_TITLE}}` - Your game title
   - `{{GAME_DESCRIPTION}}` - Game description
   - `{{CANONICAL_URL}}` - Your domain URL
   - `{{VERSION}}` - Version number

3. Update the manifest.json with your app details
4. Add your game assets to the `assets/` directory
5. Customize the CSS variables in `css/main.css`

### Development

1. Start a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
   php -S localhost:8000
   ```

2. Open your browser to `http://localhost:8000`
3. Open browser DevTools for debugging

### Customization

#### CSS Variables
The template uses CSS custom properties for easy theming:

```css
:root {
  --color-primary-800: #0f1222;    /* Primary background */
  --color-secondary-700: #4a7a3c;  /* Accent color */
  --text-primary: #e9ebff;         /* Primary text */
  --text-secondary: #9aa3cf;       /* Secondary text */
}
```

#### JavaScript Modules
Each module is self-contained and can be customized:

- `BibleRPG.Utils` - Utility functions
- `BibleRPG.GameEngine` - Core game logic
- `BibleRPG.UI` - User interface components
- `BibleRPG.Accessibility` - Accessibility features
- `BibleRPG.App` - Application coordination

#### Game Configuration
Update game settings in `js/game-engine.js`:

```javascript
const CONFIG = {
  TILE_SIZE: 32,        // Game tile size
  MAP_WIDTH: 20,        // Map width in tiles
  MAP_HEIGHT: 15,       // Map height in tiles
  TARGET_FPS: 60        // Target frame rate
};
```

## Accessibility Features

### Screen Reader Support
- ARIA live regions for dynamic content
- Semantic markup with proper roles
- Alternative text for all images
- Form labels and descriptions

### Keyboard Navigation
- Tab order management
- Arrow key navigation for games
- Focus indicators
- Skip links

### Visual Accessibility
- High contrast mode toggle
- Large text mode
- Reduced motion support
- Sufficient color contrast ratios

### Cognitive Accessibility
- Clear navigation structure
- Consistent interface patterns
- Progress indicators
- Error prevention and recovery

## Performance Optimization

### Loading Performance
- Critical CSS inlined
- Non-critical resources deferred
- Resource preloading
- Lazy loading for images

### Runtime Performance
- Efficient DOM manipulation
- RequestAnimationFrame for animations
- Debounced event handlers
- Memory leak prevention

### Network Performance
- Service worker caching
- Resource compression
- CDN-ready structure
- Offline functionality

## Browser Support

### Minimum Requirements
- Chrome 63+
- Firefox 67+
- Safari 13+
- Edge 79+

### Progressive Enhancement
- Core functionality works without JavaScript
- Enhanced features with modern APIs
- Graceful degradation for older browsers

## SEO Optimization

### Meta Tags
- Open Graph tags for social sharing
- Twitter Card metadata
- Canonical URLs
- Structured data (JSON-LD)

### Performance
- Fast loading times
- Mobile-friendly design
- Core Web Vitals optimization
- Accessibility compliance

## Security Considerations

### Content Security Policy
- Inline scripts avoided
- External resource validation
- XSS prevention
- Secure cookie handling

### Privacy
- No tracking scripts by default
- Local storage only
- GDPR-ready structure
- User consent management

## Testing

### Accessibility Testing
- Screen reader testing (NVDA, JAWS, VoiceOver)
- Keyboard navigation testing
- Color contrast validation
- WAVE accessibility checker

### Cross-browser Testing
- BrowserStack or similar service
- Local testing on multiple browsers
- Mobile device testing
- Progressive enhancement validation

### Performance Testing
- Lighthouse audits
- WebPageTest.org
- Core Web Vitals monitoring
- Load testing

## Deployment

### Build Process
1. Minify CSS and JavaScript files
2. Optimize images and assets
3. Update version numbers
4. Generate service worker cache manifest

### Production Checklist
- [ ] Update all placeholder content
- [ ] Set production URLs in manifest
- [ ] Configure HTTPS
- [ ] Set up CDN for assets
- [ ] Configure caching headers
- [ ] Enable compression (gzip/brotli)
- [ ] Set up error monitoring
- [ ] Configure analytics (if needed)

### Hosting Recommendations
- **Static Hosting**: Netlify, Vercel, GitHub Pages
- **CDN**: CloudFlare, AWS CloudFront
- **Traditional**: Apache, Nginx with proper headers

## Contributing

### Code Style
- Use semantic HTML elements
- Follow CSS methodology (component-based)
- Write self-documenting JavaScript
- Include accessibility considerations
- Test across devices and assistive technologies

### Pull Request Guidelines
1. Test accessibility with screen readers
2. Validate HTML and CSS
3. Check cross-browser compatibility
4. Update documentation
5. Include performance impact assessment

## Troubleshooting

### Common Issues

**Service Worker Not Updating**
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Check service worker registration

**Accessibility Features Not Working**
- Ensure JavaScript is enabled
- Check browser console for errors
- Verify ARIA attributes are present

**Performance Issues**
- Check browser DevTools Performance tab
- Verify resource loading order
- Monitor memory usage

### Debug Mode
Enable debug mode by adding `?debug=true` to the URL for additional logging and performance metrics.

## License

This template is provided under the MIT License. See the LICENSE file for details.

## Changelog

### Version 1.0.0
- Initial release
- Complete template structure
- Full accessibility implementation
- PWA functionality
- Responsive design
- Game engine foundation

## Support

For questions, issues, or contributions, please refer to the project's main repository or create an issue with detailed information about your environment and the problem you're experiencing.