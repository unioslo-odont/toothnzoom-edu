# Dental Radiograph Educational Viewer

A pedagogical tool designed specifically for dental education in oral radiology. This viewer allows instructors to provide radiographic examples to students and enables basic image manipulation for educational purposes.

<img src="docs/tooth-n-zoom-screenshot.png" alt="Screenshot" width="600">

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
- **Image Adjustments**: Brightness, contrast, edge enhancement, inversion
- **Histogram Display**: Luminance distribution analysis
- **Zoom & Pan**: Detailed examination (10% to 1000% zoom)
- **Multi-language Support**: English and Norwegian

### Controls

**Mouse**:
- Left-drag: Pan
- Wheel: Zoom
- Middle-drag: Adjust brightness/contrast
- Ctrl + Left-drag: Zoom

**Touch** (tablets):
- 1-finger: Pan
- Pinch: Zoom
- 2-finger drag: Adjust brightness/contrast

**Keyboard**:
- `+`/`=`: Zoom in
- `-`: Zoom out
- `0`: Reset zoom
- `I`: Toggle invert
- `Ctrl+R`: Reset all adjustments
- Arrow keys: Pan

## Quick Start

### For Local Use
1. Open `index.html` in a modern web browser
2. Click "Open Image" to load radiographs
3. Or drag and drop image files directly

### For Classroom Server
1. Place teaching radiographs in `images/` folder
2. Update `images/file_list.json` with filenames:
```json
[
  "periapical-1.jpg",
  "bitewing-1.jpg",
  "panoramic-1.jpg"
]
```
3. Run a local server:
```bash
python -m http.server 8000
```
4. Access at `http://localhost:8000`

## Project Structure

```
dental-radiograph-viewer/
├── index.html              # Main application
├── js/
│   ├── app.js             # Application initialization
│   ├── viewer.js          # Core viewing functionality
│   ├── image-processor.js # Image manipulation
│   ├── controls.js        # User interaction
│   ├── utils.js           # Helper functions
│   ├── language-manager.js # i18n support
│   └── languages.json     # Translations
├── images/                # Sample radiographs
│   └── file_list.json     # Image catalog
└── README.md             # Documentation
```

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

### Classroom Activities
- Group analysis of radiographs
- Demonstration of exposure effects
- Interactive anatomy review
- Pathology identification practice
- Student case presentations

### Self-Study
- Exam preparation
- Practice sessions
- Homework assignments
- Research projects

## Customization

Adjust sensitivity in `js/controls.js`:

```javascript
export const CONFIG = {
    ZOOM_WHEEL_FACTOR: 1.1,      // Zoom speed
    BRIGHTNESS_SENSITIVITY: 0.5,  // Brightness rate
    CONTRAST_SENSITIVITY: 0.5,    // Contrast rate
    MAX_ZOOM: 10,                // Maximum zoom (1000%)
    MIN_ZOOM: 0.1                // Minimum zoom (10%)
};
```

## Troubleshooting

**Images not loading from server**:
- Check that you're running a web server (not `file://`)
- Verify `images/file_list.json` exists and is correct
- Check browser console for errors

**Server browsing on UiO network**:
- Authentication may block JSON file loading
- Use local file upload instead ("Open Image" button)

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
