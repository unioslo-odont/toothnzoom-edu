# Tooth ’n’ Zoom - Dental Darkrom - Dental Radiograph Educational Viewer

A pedagogical tool designed specifically for dental education in oral radiology. This viewer allows instructors to provide radiographic examples to students and enables basic image manipulation for educational purposes.

**⚕️ Educational Tool Notice**: This viewer is strictly an educational tool for teaching oral radiology concepts. It is **NOT** intended for clinical diagnosis or patient care. Always use certified medical imaging software for clinical applications.

## 🦷 Purpose & Scope

### What This Tool IS:
- **Educational Platform**: For teaching oral radiology interpretation
- **Student Learning Tool**: Allows hands-on practice with radiographic images
- **Teaching Aid**: Helps instructors demonstrate imaging concepts
- **Interactive Learning**: Students can manipulate images to understand radiographic principles

### What This Tool IS NOT:
- ❌ Not a diagnostic tool
- ❌ Not for clinical decision-making
- ❌ Not a PACS replacement
- ❌ Not for patient treatment planning

## 🎓 Educational Features

### Learning-Focused Design
- **Pure Black Background**: Mimics professional viewing conditions students will encounter in practice
- **Basic Manipulation Tools**: Essential adjustments for understanding radiographic appearance
- **Multi-Language Support**: Accessible to international students (English/Norwegian)
- **Simple Interface**: Focus on learning concepts rather than complex software

### Core Functionality
- **Image Loading Options**:
  - Upload practice radiographs
  - Drag and drop case studies
  - Server browser for course materials
  - URL loading for shared resources
  
### Image Manipulation for Learning

Students can practice with:
- **Brightness Adjustment**: Understanding exposure differences
- **Contrast Control**: Exploring density and contrast principles
- **Edge Enhancement**: Examining anatomical boundaries
- **Image Inversion**: Alternative viewing techniques
- **Zoom & Pan**: Detailed examination of anatomical structures

### Control Methods

#### Mouse Controls
- **Left Click + Drag**: Pan to explore different areas
- **Mouse Wheel**: Zoom for detailed examination
- **Middle Click + Drag**: Adjust brightness/contrast
- **Ctrl + Left Drag**: Controlled zoom

#### Touch Controls (Tablets)
- **Single Finger**: Navigate the image
- **Pinch**: Zoom in/out
- **Two-Finger Drag**: Adjust image parameters

## 🚀 Quick Start for Educators

### Setting Up for Your Class

1. **Clone or Download**:
   ```bash
   git clone https://github.com/yourusername/dental-radiograph-viewer.git
   cd dental-radiograph-viewer
   ```

2. **Add Your Teaching Materials**:
   - Place radiographic examples in `images/` folder
   - Update `images/file_list.json` with filenames
   - Organize by topic (periapical, bitewing, panoramic, etc.)

3. **Deploy for Students**:

   **Local Network (Classroom)**:
   ```bash
   python -m http.server 8000
   ```
   
   **Online (Remote Learning)**:
   - Upload to your institution's web server
   - Or use GitHub Pages for free hosting

## 📁 Project Structure

```
dental-radiograph-viewer/
├── index.html              # Main application
├── css/
│   └── styles.css         # Dark theme optimized for radiographs
├── js/
│   ├── app.js            # Application initialization
│   ├── viewer.js         # Core viewing functionality
│   ├── image-processor.js # Image manipulation algorithms
│   ├── controls.js       # User interaction handling
│   ├── utils.js          # Helper functions
│   ├── language-manager.js # Multi-language support
│   └── languages.json    # Translations (EN/NO)
├── images/               # Radiographic examples
│   └── file_list.json    # Image catalog
├── docs/
│   └── adding-german-example.md # Translation guide
└── README.md            # This documentation
```

## 🖼️ Organizing Educational Materials

### Recommended Image Organization

Create a structured catalog for different topics:

```json
[
  "periapical/maxillary-incisors.jpg",
  "periapical/mandibular-molars.jpg",
  "bitewing/premolar-bitewing.jpg",
  "panoramic/full-panoramic.jpg",
  "pathology/periapical-lesion.jpg",
  "pathology/caries-example.jpg"
]
```

### Image Types for Teaching
- **Periapical Radiographs**: Root and periapical structures
- **Bitewing Radiographs**: Interproximal caries detection
- **Panoramic Radiographs**: Overall jaw anatomy
- **Occlusal Radiographs**: Larger jaw areas
- **CBCT Slices**: 3D imaging examples (as 2D exports)

## 🎨 Design Rationale

### Why Pure Black Background?

The black background (#000000) serves important pedagogical purposes:

1. **Professional Preparation**: Students practice in conditions similar to clinical settings
2. **Reduced Eye Fatigue**: Essential for lengthy study sessions
3. **Optimal Contrast**: Better visualization of subtle radiographic details
4. **Focus Enhancement**: Minimizes distractions from the learning material
5. **Standard Practice**: Familiarizes students with professional viewing standards

## 🌍 Language Support

### Current Languages
- **English** (en) - Default
- **Norwegian** (no) - Norsk

Perfect for international dental programs and exchange students.

## 💻 System Requirements

### Minimum Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- 4GB RAM recommended for smooth performance
- Screen resolution: 1024×768 or higher

### Optimal Setup for Teaching
- Large monitor or projector for demonstrations
- Tablets for individual student practice
- Stable internet connection for server-based images

## 🎯 Pedagogical Use Cases

### Classroom Activities
- **Image Interpretation Sessions**: Group analysis of radiographs
- **Technique Comparison**: Showing effects of different exposures
- **Anatomy Review**: Interactive exploration of dental structures
- **Pathology Identification**: Practice recognizing abnormalities
- **Case Presentations**: Student-led discussions using the viewer

### Self-Study Applications
- **Exam Preparation**: Review course materials
- **Practice Sessions**: Repeated exposure to various cases
- **Homework Assignments**: Analyze provided radiographs
- **Research Projects**: Examine and document findings

## 📝 For Instructors

### Creating Assignments

Example assignment structure:
1. Provide students with specific radiographs
2. Ask them to identify anatomical landmarks
3. Have them adjust brightness/contrast for optimal viewing
4. Request written observations about their findings

### Assessment Ideas
- Timed identification exercises
- Comparison of normal vs. pathological cases
- Image quality assessment practice
- Documentation of optimal viewing parameters

## 🔧 Customization for Your Course

### Adjust Control Sensitivity

Edit `js/controls.js` to match your teaching needs:

```javascript
export const CONFIG = {
    ZOOM_WHEEL_FACTOR: 1.1,      // Zoom speed
    BRIGHTNESS_SENSITIVITY: 0.5,  // Brightness adjustment rate
    CONTRAST_SENSITIVITY: 0.5,    // Contrast adjustment rate
    MAX_ZOOM: 10,                 // Maximum magnification
    MIN_ZOOM: 0.1                 // Minimum zoom level
};
```

### Add Course-Specific Features
The modular structure allows easy additions:
- Measurement tools for tooth dimensions
- Annotation capabilities for marking pathology
- Quiz mode for student assessment
- Image comparison for before/after cases

## 🐛 Troubleshooting

### Common Issues in Educational Settings

**Images not loading from server**:
- Check firewall settings in classroom
- Ensure CORS headers are configured
- Verify file permissions on server

**Touch controls not working on tablets**:
- Update browser to latest version
- Check tablet touch settings
- Try different browser if issues persist

## 📚 Student Resources

### Keyboard Shortcuts for Efficient Study

| Key | Action | Learning Application |
|-----|--------|---------------------|
| `+` / `=` | Zoom In | Examine details |
| `-` | Zoom Out | View overall structure |
| `0` | Reset Zoom | Return to default view |
| `I` | Invert | Alternative visualization |
| `Arrow Keys` | Pan | Navigate large images |

## 🤝 Contributing

We welcome contributions from dental educators! Areas of interest:

- Additional language translations
- Educational feature suggestions
- Sample radiograph collections (anonymized)
- Teaching guides and tutorials
- Student exercise templates

## 📄 License

MIT License - Free for educational use

## ⚠️ Important Disclaimers

1. **Educational Use Only**: This tool is designed exclusively for teaching oral radiology concepts
2. **Not for Diagnosis**: Never use for clinical diagnosis or treatment planning
3. **Student Practice Tool**: Intended for supervised educational activities
4. **No Patient Data**: Should only be used with teaching materials, never actual patient radiographs unless properly anonymized

## 🙏 Acknowledgments

- Developed for dental education programs
- Inspired by the needs of oral radiology instructors
- Designed with student learning outcomes in mind
- Community-driven improvements and translations

## 📧 Support & Feedback

For educational support or feature requests:
- Open an issue on GitHub
- Share your teaching experiences
- Suggest improvements for student learning
- Contribute teaching materials (with permission)

---

**Remember**: This is a teaching tool to help students learn radiographic interpretation principles. For any clinical applications, always use properly certified medical imaging software.