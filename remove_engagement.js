const fs = require('fs');
const path = require('path');

// 1. HTML: Remove engagement-card
const htmlPath = path.join(__dirname, 'popup', 'popup.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const engagementHtmlRegex = /\s*<div class="engagement-card">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/;
html = html.replace(engagementHtmlRegex, '\n    </section>');
fs.writeFileSync(htmlPath, html);

// 2. JS: Remove engagement logic
const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

// Remove from stats initialization
js = js.replace(/\s*reactions: null,\s*comments: null,\s*reposts: null/g, '');

// Remove from UI update
js = js.replace(/\s*if \(stats\.reactions !== undefined\).*?\s*if \(stats\.comments !== undefined\).*?\s*if \(stats\.reposts !== undefined\).*?;/g, '');

// Remove the extraction logic
const engagementExtractionRegex = /\s*\/\/ 4\. Engagement[\s\S]*?if \(!stats\.reposts\) stats\.reposts = extractNumberFromText\(\['partage', 'repost', 'share'\]\);/g;
js = js.replace(engagementExtractionRegex, '');

fs.writeFileSync(jsPath, js);
console.log('Engagement section removed');
