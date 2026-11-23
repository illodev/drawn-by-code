// build.mjs - joins morph-math.js and morph-ae.jsx into "Mask Morph Fixer.jsx", the one file
// a designer runs in After Effects (File > Scripts > Run Script File, or docked from a
// ScriptUI Panels folder: the file name is what the Window menu shows).
//
//   node sandbox/2026-11-21-ae-morph-fixer/build.mjs
//
// It lints both sources for what ExtendScript (ES3) cannot parse, since a syntax error there
// only shows up as an alert inside After Effects.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = (f) => fs.readFileSync(path.join(dir, f), 'utf8').replace(/\r\n/g, '\n');
const math = read('morph-math.js');
const ae = read('morph-ae.jsx');

// ES3 reserves these even as property names ({ short: 1 }, x.long): ExtendScript stops with
// "Illegal use of reserved word"
const RESERVED = /(\.|\b)(abstract|boolean|byte|char|debugger|double|enum|export|extends|final|float|goto|implements|import|int|interface|long|native|package|private|protected|public|short|static|super|synchronized|throws|transient|volatile)\b/;

const problems = [];
// make-demo.jsx also runs in After Effects: linted, not joined
for (const [file, src] of [['morph-math.js', math], ['morph-ae.jsx', ae], ['make-demo.jsx', read('make-demo.jsx')], ['art/make-art.jsx', read('art/make-art.jsx')]]) {
    // a caught error joined to a string with + throws again in ExtendScript ("Object of type
    // Error found where a Number, Array, or Property is needed"), as a dialog: use e.message
    const caught = [...new Set([...src.matchAll(/catch\s*\((\w+)\)/g)].map((m) => m[1]))];
    const names = caught.join('|');
    const joined = caught.length ? new RegExp(`['"]\\s*\\+\\s*(${names})\\b(?!\\s*\\.)|\\b(${names})\\s*\\+\\s*['"]`) : null;
    src.split('\n').forEach((line, n) => {
        if (joined && joined.test(line.replace(/\/\/.*$/, ''))) problems.push(`${file}:${n + 1}: a caught error joined with +: ${line.trim()}`);
        // the tool finds everything by AE's internal names, which are the same in every language:
        // never by a display name ("Path 1", "Trim Paths"), which a German or Japanese AE renames
        if (file === 'morph-math.js' || file === 'morph-ae.jsx') {      // the tool; tests name their own groups
            const raw = line.replace(/\/\/.*$/, '');
            if (/\.property\(\s*['"](?!ADBE )/.test(raw)) problems.push(`${file}:${n + 1}: a property looked up by display name (changes with AE's language): ${line.trim()}`);
            if (/\.name\s*[!=]==?/.test(raw)) problems.push(`${file}:${n + 1}: a display name compared (changes with AE's language): ${line.trim()}`);
        }
        const code = line.replace(/\/\/.*$/, '').replace(/'(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"/g, "''");
        const hits = [
            [RESERVED, 'ES3 reserved word'],
            [/\b(let|const|class)\s/, 'let/const/class'],
            [/=>/, 'arrow function'],
            [/`/, 'template literal'],
            [/\.(forEach|map|filter|reduce|some|every|includes|find|findIndex)\(/, 'ES5+ array method'],
            [/\b(JSON|Object\.keys|Array\.isArray|Math\.(sign|hypot|trunc|imul|cbrt|log2|log10))\b/, 'ES5+ global'],
            [/,\s*[}\]]/, 'trailing comma'],
        ];
        for (const [re, what] of hits) if (re.test(code)) problems.push(`${file}:${n + 1}: ${what}: ${line.trim()}`);
        // Array indexOf is ES5; String indexOf is fine, so only flag it in the math
        if (file === 'morph-math.js' && /\.indexOf\(/.test(code)) problems.push(`${file}:${n + 1}: indexOf: ${line.trim()}`);
    });
    const flat = src.replace(/\/\/.*$/gm, '');
    if (/,\s*\n\s*[}\]]/.test(flat)) problems.push(`${file}: trailing comma before a closing bracket on the next line`);
}
if (problems.length) {
    console.error('ES3 problems:\n' + problems.join('\n'));
    process.exit(1);
}

// Two builds of the same code:
// - the release, "Mask Morph Fixer.jsx" next to this file: what designers install. It leaves
//   nothing on $.global (no names to collide with other scripts) and always builds its panel.
// - the test build, out/test-build/Mask Morph Fixer.jsx (not committed): the same plus
//   $.global.MorphFixer / MorphFixerMath for test.mjs, make-demo.jsx and the AE bench, and
//   $.global.MORPH_NO_UI to load it without a panel.
const NAME = 'Mask Morph Fixer.jsx';
const RUN = 'if (!$.global.MORPH_NO_UI) MorphFixer.run(MORPH_HOST);';
const version = (/VERSION = '(\d+\.\d+\.\d+)'/.exec(ae) || [])[1];
if (!version || ae.indexOf(RUN) < 0) {
    console.error('build: no VERSION or no run line in morph-ae.jsx');
    process.exit(1);
}
const wrap = (tail, kind) => [
    `// Mask Morph Fixer ${version}${kind} - gives every keyframe of a path the same points, direction`,
    '// and start, so shapes and masks morph cleanly in After Effects; key times and easing stay as',
    '// they are. Run it from File > Scripts > Run Script File..., then click ? > Install as a panel',
    '// to dock it (Window menu, after a restart).',
    '// Generated by build.mjs from morph-math.js + morph-ae.jsx: edit those, then rebuild.',
    '// Usage: README.md next to this file.',
    '(function (MORPH_HOST) {',
    math,
    ae.replace(RUN, tail),
    '})(this);    // `this` is the dock panel when installed in ScriptUI Panels',
    '',
].join('\n');
const release = wrap('MorphFixer.run(MORPH_HOST);', '');
const test = wrap('$.global.MorphFixer = MorphFixer;\n$.global.MorphFixerMath = MF;\n' + RUN, ' (test build)');
const code = (s) => s.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
if (/\$\.global/.test(code(release))) {
    console.error('build: the release touches $.global');
    process.exit(1);
}
// strings shown in After Effects stay ASCII (ScriptUI and older AE builds mangle the rest)
const wide = release.split('\n').map((l, n) => [n + 1, l]).filter(([, l]) => /[^\x00-\x7f]/.test(l.replace(/\/\/.*$/, '')));
if (wide.length) {
    console.error('non-ASCII outside comments:\n' + wide.map(([n, l]) => `${NAME}:${n}: ${l.trim()}`).join('\n'));
    process.exit(1);
}
new Function(release);                                  // syntax checks only, nothing runs
new Function(test.replace(/\$\.global/g, '({})'));
fs.writeFileSync(path.join(dir, NAME), release);
fs.mkdirSync(path.join(dir, 'out', 'test-build'), { recursive: true });
fs.writeFileSync(path.join(dir, 'out', 'test-build', NAME), test);
console.log(`${NAME} ${version} · ${release.length} bytes (test build: out/test-build/, ${test.length} bytes)`);
