import {readFileSync,writeFileSync} from 'node:fs';
const source=['src/research/rules.mjs','src/research/engine.mjs','src/research/collector.mjs'].map(p=>readFileSync(p,'utf8').replace(/^import[^\n]+;\s*$/gm,''));writeFileSync('browser-extension/core.mjs',source.join('\n'));
console.log('Extension core generated');
