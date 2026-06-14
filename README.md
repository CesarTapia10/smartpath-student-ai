# SmartPath Student AI

Orientación vocacional inteligente para estudiantes. Encuesta de 25 preguntas + motor de
recomendación (RIASEC + habilidades) que sugiere la carrera con mayor afinidad, 3 alternativas
y un gráfico radar. **HTML + CSS + JavaScript Vanilla, sin backend.**

## Estructura

```
/index.html      → Landing + app (wizard, análisis, resultados)
/styles.css      → Design system, modo oscuro, responsive, animaciones
/script.js       → 25 preguntas, motor de scoring, gráficos canvas, UI
/assets/
   favicon.svg
   hero.svg      → Imagen Open Graph
```

## Ejecutar localmente

Abre `index.html` en el navegador, o sirve la carpeta:

```bash
python3 -m http.server 8080
# luego visita http://localhost:8080
```

## Desplegar en GitHub Pages

1. Sube estos archivos a un repositorio (en la raíz).
2. Ve a **Settings → Pages**.
3. En *Source* elige la rama `main` y la carpeta `/ (root)`.
4. Guarda. Tu sitio quedará en `https://<usuario>.github.io/<repo>/`.

> Actualiza la URL en las etiquetas `<link rel="canonical">` y `og:url` de `index.html`
> con tu dominio real para un SEO correcto.

## Personalización rápida

- **Carreras y descripciones:** objeto `CAREERS` en `script.js`.
- **Preguntas y puntajes:** arreglo `QUESTIONS` en `script.js`.
- **Paleta:** variables `--primary / --secondary / --accent` al inicio de `styles.css`.
