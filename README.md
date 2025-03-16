# Ocean Hunter Game

An educational web-based game where players control a sea creature that grows by consuming smaller prey while avoiding larger predators.

## Game Features

- Beautiful underwater environment with animated seaweed and ambient bubbles
- Dynamic particle effects and sound effects
- Progressive difficulty with multiple levels
- Educational aspects teaching about marine life food chains
- Responsive controls and smooth animations
- Background music and sound effects with mute option

## Directory Structure

```
ocean_hunter/
├── index.html
├── css/
│   └── styles.css
├── js/
│   ├── game.js
│   ├── player.js
│   ├── creature.js
│   ├── particles.js
│   └── sound.js
├── sounds/
│   ├── eat.mp3
│   ├── hurt.mp3
│   ├── level_up.mp3
│   ├── bubble.mp3
│   └── background.mp3
└── images/
    ├── creatures/
    │   └── [sprite images]
    └── player/
        └── [player sprites]
```

## Publishing Instructions

### Option 1: GitHub Pages (Free)

1. Create a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin your-repository-url
   git push -u origin main
   ```

2. Enable GitHub Pages:
   - Go to your repository settings
   - Scroll to "GitHub Pages" section
   - Select the main branch as source
   - Your game will be available at `https://your-username.github.io/repository-name`

### Option 2: Traditional Web Hosting

1. Choose a web hosting provider (e.g., DigitalOcean, AWS, Netlify)
2. Upload the entire `ocean_hunter` directory to your web server
3. Ensure all file permissions are set correctly (usually 644 for files, 755 for directories)
4. The game will be available at your domain/subdomain

### Option 3: Local Testing Server

For testing locally:

1. Using Python:
   ```bash
   # Python 3
   python -m http.server 8000
   # Python 2
   python -m SimpleHTTPServer 8000
   ```
   Then visit `http://localhost:8000`

2. Using Node.js:
   ```bash
   # Install http-server globally
   npm install -g http-server
   # Run server
   http-server
   ```
   Then visit `http://localhost:8080`

## Requirements

- Modern web browser with HTML5 and JavaScript enabled
- Audio support for sound effects
- Minimum screen resolution: 800x600
- Recommended browsers: Chrome, Firefox, Safari, Edge (latest versions)

## Browser Support

- Chrome/Chromium (version 49+)
- Firefox (version 52+)
- Safari (version 10+)
- Edge (version 14+)

## Performance Optimization Tips

1. Compress all image assets using tools like TinyPNG
2. Minify JavaScript files for production
3. Convert audio files to .ogg format as well for better browser compatibility
4. Enable GZIP compression on your web server
5. Use a CDN for better global performance

## Troubleshooting

Common issues and solutions:

1. No sound?
   - Check if browser allows autoplay
   - Verify sound files are properly loaded
   - Check mute button status

2. Performance issues?
   - Reduce particle effect count
   - Optimize sprite sizes
   - Check browser console for errors

3. Display issues?
   - Verify browser compatibility
   - Check screen resolution settings
   - Clear browser cache

## License

[Add your chosen license here]

## Credits

- Game developed by [Your Name]
- Sound effects: [Source]
- Sprite artwork: [Source]

## Support

For issues or questions, please [create an issue](your-repository-url/issues) on the GitHub repository. 