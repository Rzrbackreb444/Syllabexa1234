const fs = require('fs');

let file = fs.readFileSync('src/AppLayout.tsx', 'utf8');

const oldPdfFunc = `    const handleExportPDF = () => {
      const rawStore = localStorage.getItem('syllabexa-manuscript-storage');
      if (!rawStore) return;
      
      const parsed = JSON.parse(rawStore);
      const state = parsed.state;
      
      const htmlContent = generatePrintHTML({
        projectMeta: state.projectMeta,
        prepressRules: state.prepressRules,
        frontmatter: state.frontmatter || [],
        chapters: state.chapters || [],
        backmatter: state.backmatter || []
      });

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        setTimeout(() => {
          printWindow.print();
        }, 500);
      }
    };`;

const newExportFuncs = `    const handleExportPDF = async () => {
      const rawStore = localStorage.getItem('syllabexa-manuscript-storage');
      if (!rawStore) return;
      const parsed = JSON.parse(rawStore);
      const state = parsed.state;
      
      showToast('Generating server-side KDP-compliant PDF...', 'success');
      
      try {
        const response = await fetch('/api/export/pdf', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: state.projectMeta.title, chapters: state.chapters })
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.projectMeta.title + '_Master.pdf';
        a.click();
      } catch (err) {
        showToast('Export failed', 'error');
      }
    };
    
    const handleExportDOCX = async () => {
      const rawStore = localStorage.getItem('syllabexa-manuscript-storage');
      if (!rawStore) return;
      const parsed = JSON.parse(rawStore);
      const state = parsed.state;
      
      showToast('Generating server-side DOCX...', 'success');
      
      try {
        const response = await fetch('/api/export/docx', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: state.projectMeta.title, chapters: state.chapters })
        });
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = state.projectMeta.title + '_Master.docx';
        a.click();
      } catch (err) {
        showToast('Export failed', 'error');
      }
    };`;

file = file.replace(oldPdfFunc, newExportFuncs);

const oldListeners = `    window.addEventListener('syllabexa-export-pdf', handleExportPDF);
    window.addEventListener('syllabexa-export-epub', handleExportEPUB);
    window.addEventListener('syllabexa-import-draft', handleGlobalImport);
    window.addEventListener('keydown', handleGlobalShortcuts);
    window.addEventListener('storage-quota-warning', handleStorageQuotaWarning);

    return () => {
      window.removeEventListener('syllabexa-export-pdf', handleExportPDF);
      window.removeEventListener('syllabexa-export-epub', handleExportEPUB);
      window.removeEventListener('syllabexa-import-draft', handleGlobalImport);
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('storage-quota-warning', handleStorageQuotaWarning);
    };`;

const newListeners = `    window.addEventListener('syllabexa-export-pdf', handleExportPDF);
    window.addEventListener('syllabexa-export-docx', handleExportDOCX);
    window.addEventListener('syllabexa-export-epub', handleExportEPUB);
    window.addEventListener('syllabexa-import-draft', handleGlobalImport);
    window.addEventListener('keydown', handleGlobalShortcuts);
    window.addEventListener('storage-quota-warning', handleStorageQuotaWarning);

    return () => {
      window.removeEventListener('syllabexa-export-pdf', handleExportPDF);
      window.removeEventListener('syllabexa-export-docx', handleExportDOCX);
      window.removeEventListener('syllabexa-export-epub', handleExportEPUB);
      window.removeEventListener('syllabexa-import-draft', handleGlobalImport);
      window.removeEventListener('keydown', handleGlobalShortcuts);
      window.removeEventListener('storage-quota-warning', handleStorageQuotaWarning);
    };`;

file = file.replace(oldListeners, newListeners);

fs.writeFileSync('src/AppLayout.tsx', file);
