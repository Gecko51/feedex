const fs = require('fs');
const path = require('path');

const jsPath = path.join(__dirname, 'popup', 'popup.js');
let js = fs.readFileSync(jsPath, 'utf8');

// The backslashes were lost again when patching! Let's use a very direct replace
js = js.replace(/match\(\/\[ds,\.\]\+\[kK\+M\]\?\/\)/g, 'match(/[\\d\\s,.]+[kK+M]?/)');
js = js.replace(/replace\(\/s\+\/g, ' '\)/g, "replace(/\\s+/g, ' ')");
js = js.replace(/match\(\/"score":s\*\(d\{1,3\}\)\/\)/g, 'match(/"score":\\s*(\\d{1,3})/)');

fs.writeFileSync(jsPath, js);
console.log('Regex fixed manually');
