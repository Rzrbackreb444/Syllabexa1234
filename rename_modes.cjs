const fs = require('fs');
let code = fs.readFileSync('src/components/SyllabexaMultiModelPipeline.tsx', 'utf8');

code = code.replace(/<Eye size=\{14\} \/> Author Mode/g, '<Eye size={14} /> Manuscript Workspace');
code = code.replace(/<Code size=\{14\} \/> Telemetry/g, '<Code size={14} /> Developer Logs');
code = code.replace(/DISTRACTION-FREE WORKSPACE/g, 'PRISTINE MANUSCRIPT WORKSPACE');

fs.writeFileSync('src/components/SyllabexaMultiModelPipeline.tsx', code);
