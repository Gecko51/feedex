const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'popup', 'popup.css');
let css = fs.readFileSync(cssPath, 'utf8');

// Update :root variables
css = css.replace(/:root\s*{[^}]*}/, `:root {
  --bg-primary: #09090b;
  --bg-secondary: #18181b;
  --bg-hover: #27272a;
  --accent: #C2E476;
  --accent-hover: #d4ed8e;
  --text-primary: #f4f4f5;
  --text-secondary: #a1a1aa;
  --border-color: #27272a;
  --border-hover: #3f3f46;
  --radius: 10px;
  --radius-lg: 14px;
}`);

// Update body
css = css.replace(/body\s*{[^}]*}/, `body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
  background-color: var(--bg-primary);
  background-image: radial-gradient(circle at 50% 0%, rgba(194, 228, 118, 0.08) 0%, transparent 60%);
  color: var(--text-primary);
  min-height: 100vh;
}`);

// Update labels and h2/h3
css = css.replace(/\.form-group label\s*{[^}]*}/, `.form-group label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-secondary);
}`);

css = css.replace(/\.lists-section h2\s*{[^}]*}/, `.lists-section h2 {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 16px;
}`);

css = css.replace(/\.chatbot-header h3\s*{[^}]*}/, `.chatbot-header h3 {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-primary);
}`);

css = css.replace(/\.chatbot-settings label\s*{[^}]*}/, `.chatbot-settings label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 600;
  color: var(--text-secondary);
}`);

// Update inputs focus glow
css = css.replace(/box-shadow:\s*0 0 0 2px rgba\(194, 228, 118, 0\.15\);/g, 'box-shadow: 0 0 0 1px var(--accent);');

// Update .btn-primary text color and shadow
css = css.replace(/\.btn-primary\s*{([^}]*)}/, (match, p1) => {
  let updated = p1.replace(/color:\s*var\(--bg-secondary\);/, 'color: #09090b;');
  if (!updated.includes('box-shadow')) {
    updated += '  box-shadow: 0 4px 14px rgba(194, 228, 118, 0.15);\n';
  }
  return `.btn-primary {${updated}}`;
});

css = css.replace(/\.btn-primary:hover\s*{([^}]*)}/, (match, p1) => {
  let updated = p1;
  if (!updated.includes('box-shadow')) {
    updated += '  box-shadow: 0 4px 20px rgba(194, 228, 118, 0.25);\n';
  }
  return `.btn-primary:hover {${updated}}`;
});

// Update .btn-save text color
css = css.replace(/\.btn-save\s*{([^}]*)}/, (match, p1) => {
  let updated = p1.replace(/color:\s*var\(--bg-secondary\);/, 'color: #09090b;');
  return `.btn-save {${updated}}`;
});

// Update list-item hover and instruction-item hover
css = css.replace(/\.list-item:hover\s*{[^}]*}/, `.list-item:hover {
  border-color: var(--border-hover);
  background-color: var(--bg-hover);
}`);

css = css.replace(/\.btn-secondary:hover\s*{[^}]*}/, `.btn-secondary:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}`);

fs.writeFileSync(cssPath, css);
console.log('CSS updated successfully.');
