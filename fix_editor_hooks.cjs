const fs = require('fs');
const file = './src/components/ManuscriptEditor.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { useManuscriptStore }")) {
  content = content.replace(
    `import { useToast } from '../lib/ToastContext';`,
    `import { useToast } from '../lib/ToastContext';\nimport { useManuscriptStore } from '../store/manuscriptStore';`
  );
}

const hooksToInsert = `
  const stateLedger = useManuscriptStore(state => state.stateLedger);
  const updateStateLedger = useManuscriptStore(state => state.updateStateLedger);
  const tokenUsage = useManuscriptStore(state => state.tokenUsage);
  const snapshots = useManuscriptStore(state => state.snapshots);
  const restoreSnapshot = useManuscriptStore(state => state.restoreSnapshot);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
`;

content = content.replace(
  `export default function ManuscriptEditor({ initialContent = '' }) {\n  const navigate = useNavigate();\n  const { addToast } = useToast();`,
  `export default function ManuscriptEditor({ initialContent = '' }) {\n  const navigate = useNavigate();\n  const { addToast } = useToast();\n${hooksToInsert}`
);

// We need to fix the TS error where I passed 2 arguments to showToast but it expects 1.
// Let's check how showToast is defined.
const searchShowToast = `const showToast = (msg: string) => {`;
const replaceShowToast = `const showToast = (msg: string, type?: string) => {`;
content = content.replace(searchShowToast, replaceShowToast);

fs.writeFileSync(file, content);
