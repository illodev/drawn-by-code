// Loaded (in the cover's `uses`) before the styles' templates: each template's
// Motion.scene({...}) is collected in TEMPLATES instead of replacing the cover. The player
// has already read the cover's own definition, so this only catches the templates.
var TEMPLATES = TEMPLATES || [];
Motion.scene = (d) => TEMPLATES.push(d);
