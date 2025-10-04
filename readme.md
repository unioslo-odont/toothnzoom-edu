# Tooth 'n' Zoom - Dental Educational Darkroom

A pedagogical tool designed specifically for dental education in oral radiology. This viewer allows instructors to provide radiographic examples to students and enables basic image manipulation for educational purposes.

**Educational Tool Notice**: This viewer is strictly an educational tool for teaching oral radiology concepts. It is **NOT** intended for clinical diagnosis or patient care. Always use certified medical imaging software for clinical applications.

## Purpose & Scope

### What This Tool IS:
- **Educational Platform**: For teaching oral radiology interpretation
- **Student Learning Tool**: Allows hands-on practice with radiographic images
- **Teaching Aid**: Helps instructors demonstrate imaging concepts
- **Interactive Learning**: Students can manipulate images to understand radiographic principles

### What This Tool IS NOT:
- Not a diagnostic tool
- Not for clinical decision-making
- Not a PACS replacement
- Not for patient treatment planning

## Features

### Core Functionality
- **Image Loading**: Upload, drag & drop, server browser, URL loading
- **Advanced Image Adjustments**: 
  - Brightness control (-100 to +100)
  - Enhanced contrast range with extreme black/white mode
  - Edge enhancement filter
  - Image inversion
- **Interactive Histogram Display**:
  - Luminance distribution visualization
  - Real-time transfer curve overlay showing brightness/contrast mapping
  - Draggable panel for flexible positioning
- **Zoom & Pan**: Detailed examination (10% to 1000% zoom)
- **Multi-language Support**: English and Norwegian

### Image Processing

The viewer features sophisticated image processing capabilities:
- **Contrast Enhancement**: Two modes - standard (-100 to 50) for traditional adjustment, and extreme (50 to 100) for threshold-based dramatic effects
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

## Technical Features

### Web Platform Compatibility
All CSS is inlined for compatibility with various web publishing platforms (tested with UiO Vortex), ensuring consistent styling regardless of server MIME type configuration.

### Performance Optimizations
- GPU-accelerated rendering for smooth performance across browsers
- Debounced image processing for responsive controls
- Optimized for Microsoft Edge browser compatibility
- Request animation frame for flicker-free updates

### UiO Brand Integration
Interface uses University of Oslo's official color palette (UiO Blue #007396) for professional appearance aligned with institutional branding, with red reserved for the reset button as a clear warning for destructive actions.

## Design Rationale

The **pure black background** (#000000) serves important pedagogical purposes:
- Mimics professional clinical viewing conditions
- Reduces eye fatigue during extended study
- Provides optimal contrast for radiographic details
- Minimizes distractions
- Familiarizes students with professional standards

## System Requirements

- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Screen resolution: 1024x768 or higher
- 4GB RAM recommended

## Educational Use Cases

**Classroom**: Group analysis, exposure demonstration, anatomy review, pathology identification, histogram interpretation  
**Self-Study**: Exam preparation, practice sessions, homework assignments, research projects

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

## Important Disclaimers

1. **Educational Use Only**: Designed exclusively for teaching oral radiology
2. **Not for Diagnosis**: Never use for clinical diagnosis or treatment
3. **Student Practice Tool**: For supervised educational activities only
4. **No Patient Data**: Use only teaching materials or properly anonymized images

## License

MIT License - Free for educational use

## Support

For issues or suggestions, please open an issue on GitHub.

---

**Remember**: This is a teaching tool for learning radiographic interpretation. For clinical applications, always use certified medical imaging software.