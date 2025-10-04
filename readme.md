# Tooth 'n' Zoom - Dental Educational Darkroom

A web-based tool for dental education in oral radiology. This viewer allows instructors to provide radiographic examples to students and enables basic image manipulation for educational purposes.

<p>
  <img src="docs/tooth-n-zoom-screenshot.png" alt="Panoramic radiograph example" width="600"><br>
  <em>Screenshot displaying panoramic image from
    <a href="https://en.wikipedia.org/wiki/Panoramic_radiograph">Wikipedia</a>
  </em>
</p>

**Educational Tool Notice**: This viewer is intended for teaching oral radiology concepts. It is **NOT** designed for clinical diagnosis or patient care. Use certified medical imaging software for clinical applications.

## Purpose & Scope

### What This Tool IS:
- Educational platform for teaching oral radiology interpretation
- Student learning tool for hands-on practice with radiographic images
- Teaching aid for demonstrating imaging concepts
- Interactive learning environment for understanding radiographic principles

### What This Tool IS NOT:
- Not a diagnostic tool
- Not for clinical decision-making
- Not a PACS replacement
- Not for patient treatment planning

## Features

### Core Functionality
- **Image Loading**: Upload, drag & drop, server browser, URL loading
- **Image Adjustments**: 
  - Brightness control (-100 to +100)
  - Contrast range with extreme black/white mode
  - Edge enhancement filter
  - Image inversion
- **Interactive Histogram Display**:
  - Luminance distribution visualization
  - Real-time transfer curve overlay showing brightness/contrast mapping
  - Draggable panel for flexible positioning
- **Zoom & Pan**: Detailed examination (10% to 1000% zoom)
- **Multi-language Support**: English and Norwegian

### Image Processing

The viewer includes the following image processing capabilities:
- **Contrast Enhancement**: Dual-mode operation - standard mode (-100 to 50) for traditional adjustment, extreme mode (50 to 100) for threshold-based effects
- **Histogram & Transfer Curve**: Real-time visualization of brightness distribution and transformation mapping, including inversion effects
- **Edge Enhancement**: Laplacian filter for detail enhancement
- **Image Inversion**: Full negative effect with histogram reflection

### Controls

**Mouse**: Left-drag to pan, wheel to zoom, middle-drag to adjust brightness/contrast  
**Touch**: 1-finger pan, pinch zoom, 2-finger drag to adjust  
**Keyboard**: +/- zoom, I for invert, Ctrl+R reset, arrow keys pan

## Quick Start

### For Local Use
1. Open `index.html` in a modern web browser
2. Click "Open Image" to load radiographs
3. Or drag and drop image files directly

### For Classroom Server
1. Place teaching radiographs in `images/` folder
2. Update `images/file_list.json` with filenames
3. Run a local server: `python -m http.server 8000`
4. Access at `http://localhost:8000`

### For LMS Integration (Vortex, Canvas, etc.)
The viewer can be embedded in iframe environments:
1. Upload the entire project folder to your LMS
2. Link to `index.html` in your course materials
3. The interface adapts to available space
4. Tested with University of Oslo's Vortex LMS

## Technical Features

### Web Platform Compatibility
All CSS is inlined for compatibility with various web publishing platforms (tested with UiO Vortex), ensuring consistent styling regardless of server MIME type configuration.

### Responsive Design
- **Desktop**: Full-width horizontal header with side-by-side file loading buttons
- **Tablet (768-1024px)**: Touch targets sized at 48-52px for iPad and similar devices
- **Mobile (<768px)**: Stacked layout with larger touch controls
- **Constrained Environments**: Dynamic header height adjustment for LMS iframes

### Performance Optimizations
- GPU-accelerated rendering for cross-browser performance
- Debounced image processing for responsive controls
- Compatibility fixes for Microsoft Edge browser
- Request animation frame for smooth updates

### UiO Brand Integration
Interface uses University of Oslo's official color palette (UiO Blue #007396), with red reserved for the reset button as a visual indicator for destructive actions.

## Design Rationale

The **pure black background** (#000000) serves several purposes:
- Mimics professional clinical viewing conditions
- Reduces eye fatigue during extended study
- Provides optimal contrast for radiographic details
- Minimizes distractions
- Familiarizes students with professional standards

## System Requirements

### Minimum Requirements
- Modern web browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)
- JavaScript enabled
- Screen resolution: 1024x768 or higher
- 4GB RAM recommended

### Supported Devices
- **Desktop**: Windows, macOS, Linux
- **Tablets**: iPad (iOS 14+), Android tablets (Chrome 90+)
- **Mobile**: iPhone (iOS 14+), Android phones (Chrome 90+)
- **LMS Platforms**: Vortex, Canvas, Blackboard (iframe-compatible)

### Browser Compatibility
Tested on:
- Google Chrome (desktop and mobile)
- Microsoft Edge (with GPU acceleration fixes)
- Mozilla Firefox
- Safari (desktop and iOS)
- Tablet browsers with touch support

## Educational Use Cases

**Classroom**: Group analysis, exposure demonstration, anatomy review, pathology identification, histogram interpretation  
**Self-Study**: Exam preparation, practice sessions, homework assignments, research projects  
**Distance Learning**: Works in LMS iframes, accessible from any device

## Project Structure

```
dental-radiograph-viewer/
├── index.html              # Main application (CSS inlined)
├── js/
│   ├── app.js             # Application initialization
│   ├── viewer.js          # Core viewing functionality
│   ├── image-processor.js # Image manipulation algorithms
│   ├── controls.js        # User interaction handlers
│   ├── utils.js           # Helper functions
│   ├── language-manager.js # i18n support
│   └── languages.json     # Translations
├── images/                # Sample radiographs
│   └── file_list.json     # Image catalog
└── README.md             # Documentation
```

## Recent Updates

### Version 1.1 (Current)
- **UI Improvements**: File loading buttons now displayed side-by-side for space efficiency
- **Tablet Support**: Touch targets sized at 48-52px for iPad and tablet devices
- **LMS Compatibility**: Improved adaptation to constrained iframe environments (Vortex, Canvas)
- **Responsive Breakpoints**: Added specific styling for 768-1024px devices
- **Accessibility**: Minimum touch target sizes for better usability

### Version 1.0
- Initial release with core functionality
- Multi-language support (English/Norwegian)
- Image processing with histogram visualization
- Touch and mouse controls

## Important Disclaimers

1. **Educational Use Only**: Designed for teaching oral radiology
2. **Not for Diagnosis**: Not intended for clinical diagnosis or treatment
3. **Student Practice Tool**: For supervised educational activities
4. **No Patient Data**: Use only teaching materials or properly anonymized images

## Troubleshooting

### Image Not Loading
- Check browser console for errors (F12)
- Verify image file format (JPG, PNG, WebP supported)
- For server loading, ensure `file_list.json` is correct
- Clear browser cache and reload

### Responsive Issues on iPad/Tablet
- Ensure viewport meta tag is present
- Try landscape orientation for more space
- Zoom controls automatically relocate to bottom in portrait mode

### LMS Integration Issues
- Verify iframe allows JavaScript execution
- Check that CORS headers permit image loading
- Ensure sufficient iframe height (minimum 500px recommended)

## License

MIT License - Free for educational use

## Support

For issues or suggestions, please open an issue on GitHub.

## Acknowledgments

Developed for educational purposes at the University of Oslo, Faculty of Dentistry. This tool supports oral radiology education by providing students with an accessible, interactive platform for learning radiographic interpretation.

---

**Remember**: This is a teaching tool for learning radiographic interpretation. For clinical applications, always use certified medical imaging software.