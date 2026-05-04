# Portfolio — Youssef Dawod

React + Vite Single-Page-Portfolio. Live: [yellowdeveloper.de](https://yellowdeveloper.de)

## Stack

| Bereich      | Technologie                        |
|--------------|------------------------------------|
| Framework    | React 18 + Vite                    |
| Styling      | CSS (kein Framework)               |
| Icons        | react-icons                        |
| Formular     | Web3Forms                          |
| Toast        | react-hot-toast                    |
| Deployment   | Render (Static Site)               |

## Sections

| Section  | Beschreibung                                                  |
|----------|---------------------------------------------------------------|
| Home     | Hero mit animiertem Orbit, Typewriter, Maus-Parallax          |
| About    | 3-Slide-Carousel (Desktop) / Scroll-Layout (Mobile)           |
| Projects | 4-Quadranten-Grid mit Browser-Vorschau (iframe)               |
| Contact  | Kontaktformular (Web3Forms) + Info-Spalte, Ghost-Scroll-System|

## Entwicklung

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # Production Build → dist/
npm run preview  # Build lokal vorschauen
```

## Umgebungsvariablen

| Variable             | Beschreibung                                           |
|----------------------|--------------------------------------------------------|
| `VITE_WEB3FORMS_KEY` | Web3Forms API-Key — lokal in `.env.local`, nie committen |

Für Render: Variable im Dashboard unter „Environment" eintragen.

## Deployment

Konfiguriert via `render.yaml` für Render Static Site.  
Build-Command: `npm run build` · Publish-Dir: `dist`
