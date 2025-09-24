# Example: Adding German Language Support

This guide shows how to add German (or any other language) to the Radiograph Viewer.

## Step 1: Update languages.json

Add the German translation object to `js/languages.json`:

```json
"de": {
  "name": "Deutsch",
  "buttons": {
    "openImage": "Bild öffnen",
    "loadServer": "Vom Server laden",
    "invert": "Invertieren",
    "reset": "Zurücksetzen",
    "loadUrl": "Von URL laden",
    "scanImages": "Serverbilder durchsuchen",
    "close": "Schließen"
  },
  "labels": {
    "zoom": "Zoom",
    "brightness": "Helligkeit",
    "contrast": "Kontrast",
    "edge": "Kante",
    "image": "Bild",
    "size": "Größe"
  },
  "instructions": {
    "title": "Röntgenbild laden",
    "subtitle": "Klicken Sie auf \"Bild öffnen\", ziehen Sie eine Datei hierher oder \"Vom Server laden\"",
    "mouseControls": "Maussteuerung",
    "touchControls": "Touch-Steuerung",
    "mouseDetails": "Links ziehen: Verschieben | Rad: Zoom | Mitte ziehen: Anpassen",
    "touchDetails": "1 Finger: Verschieben | Zwicken: Zoom | 2 Finger: Anpassen"
  },
  "serverDialog": {
    "title": "Vom Server laden",
    "placeholder": "Dateinamen eingeben (z.B. chest.jpg) oder vollständige URL",
    "examples": "Beispiele",
    "exampleLocal": "chest.jpg → lädt ./images/chest.jpg",
    "exampleUrl": "https://example.com/image.jpg"
  },
  "hints": {
    "brightness": "Helligkeit (↔) / Kontrast (↕)",
    "zoom": "Zoom (↕)",
    "dropImage": "Bild hier ablegen"
  },
  "messages": {
    "loadFailed": "Bild konnte nicht geladen werden",
    "invalidImage": "Ungültige Bilddatei",
    "noUrl": "Bitte geben Sie eine URL oder einen Dateinamen ein",
    "scanning": "Suche nach Bildern...",
    "scanningButton": "Suche...",
    "foundImages": "{count} Bilder gefunden",
    "scanFailed": "Suche fehlgeschlagen",
    "noImages": "Keine Bilder gefunden",
    "noImagesDetail": "Stellen Sie sicher, dass ./images/file_list.json korrekt ist",
    "serverError": "Serverbilder konnten nicht geladen werden",
    "unsavedChanges": "Sie haben ungespeicherte Bildanpassungen. Möchten Sie wirklich verlassen?"
  },
  "tooltips": {
    "zoomIn": "Vergrößern",
    "zoomOut": "Verkleinern",
    "resetZoom": "Zoom zurücksetzen",
    "openFile": "Lokale Bilddatei öffnen",
    "loadServer": "Bild vom Server laden",
    "invertImage": "Bildfarben invertieren",
    "resetAdjustments": "Alle Anpassungen auf Standard zurücksetzen"
  },
  "keyboard": {
    "title": "Tastaturkürzel",
    "zoomIn": "+ oder = : Vergrößern",
    "zoomOut": "- : Verkleinern",
    "resetZoom": "0 : Zoom zurücksetzen",
    "invert": "I : Invertierung umschalten",
    "reset": "Strg+R : Alles zurücksetzen",
    "pan": "Pfeiltasten : Bild verschieben"
  }
}
```

## Step 2: Update language-manager.js

In `js/language-manager.js`, update the `supportedLanguages` array:

```javascript
// Change from:
this.supportedLanguages = ['en', 'no'];

// To:
this.supportedLanguages = ['en', 'no', 'de'];
```

## Step 3: Test Your Translation

1. Open the application in your browser
2. The language selector (🌐 dropdown) should now show "Deutsch" as an option
3. Select "Deutsch" to see your translations applied
4. Test all UI elements to ensure translations are working correctly

## Tips for Translators

### 1. Maintain Consistency
- Use consistent terminology throughout the translation
- Follow the grammatical conventions of the target language
- Keep technical terms consistent (e.g., always use "Zoom" or always use "Vergrößerung")

### 2. Consider Context
- Button text should be short and action-oriented
- Help text can be more descriptive
- Error messages should be clear and helpful

### 3. Handle Special Characters
- Use proper Unicode characters for the target language
- Test special characters in all browsers
- Ensure the JSON file is saved with UTF-8 encoding

### 4. Test String Length
- Some languages require more space than English
- Test that longer translations don't break the UI layout
- Consider abbreviations for space-constrained areas

### 5. Placeholders and Variables
- Keep placeholders like `{count}` unchanged
- Ensure variable names remain in English
- Position placeholders naturally in the target language

## Common Issues and Solutions

### Issue: Special characters not displaying correctly
**Solution**: Ensure your JSON file is saved with UTF-8 encoding and served with the correct Content-Type header.

### Issue: Language not appearing in selector
**Solution**: Check that you've added the language code to the `supportedLanguages` array in `language-manager.js`.

### Issue: Some text not translating
**Solution**: Check the browser console for missing translation keys and ensure all keys in the English version exist in your translation.

### Issue: Text overflow in buttons
**Solution**: Use shorter translations or abbreviations where appropriate, or adjust CSS to accommodate longer text.

## Adding Right-to-Left (RTL) Languages

For RTL languages like Arabic or Hebrew, additional steps are needed:

1. Add a `direction` property to your language object:
```json
"ar": {
  "name": "العربية",
  "direction": "rtl",
  // ... translations
}
```

2. Update the language manager to apply RTL styles:
```javascript
// In applyTranslations() method
if (this.translations[this.currentLanguage].direction === 'rtl') {
    document.documentElement.dir = 'rtl';
} else {
    document.documentElement.dir = 'ltr';
}
```

3. Add RTL-specific CSS:
```css
[dir="rtl"] .header {
    flex-direction: row-reverse;
}

[dir="rtl"] .controls {
    flex-direction: row-reverse;
}

/* Add more RTL overrides as needed */
```

## Contributing Translations

If you've created a translation for a new language, please consider contributing it back to the project:

1. Fork the repository
2. Add your translation following the guidelines above
3. Test thoroughly in multiple browsers
4. Submit a pull request with:
   - The updated `languages.json` file
   - Updated `supportedLanguages` array
   - A note about which language you've added
   - Any special considerations for your language

Thank you for helping make the Radiograph Viewer accessible to more users worldwide!