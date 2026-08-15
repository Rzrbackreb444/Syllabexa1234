// Helper functions to interact with Google Drive and Google Docs APIs using the OAuth access token

export interface GoogleDocItem {
  id: string;
  name: string;
  modifiedTime: string;
}

/**
 * Lists Google Docs files in the user's Google Drive.
 */
export async function listGoogleDocs(accessToken: string): Promise<GoogleDocItem[]> {
  const query = encodeURIComponent("mimeType='application/vnd.google-apps.document' and trashed = false");
  const url = `https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name,modifiedTime)&orderBy=modifiedTime desc&pageSize=50`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to list Google Docs from Drive');
  }

  const data = await res.json();
  return data.files || [];
}

/**
 * Helper to parse a Google Doc content structure and convert it to plain text.
 */
function parseDocStructure(doc: any): string {
  let text = '';
  if (!doc.body || !doc.body.content) return '';

  for (const element of doc.body.content) {
    if (element.paragraph) {
      for (const el of element.paragraph.elements) {
        if (el.textRun && el.textRun.content) {
          text += el.textRun.content;
        }
      }
    } else if (element.table) {
      for (const row of element.table.tableRows) {
        for (const cell of row.tableCells) {
          text += parseDocStructure({ body: { content: cell.content } }) + '\t';
        }
        text += '\n';
      }
    } else if (element.sectionBreak) {
      text += '\n';
    }
  }
  return text;
}

/**
 * Imports content from a specific Google Doc.
 */
export async function importGoogleDoc(
  accessToken: string,
  documentId: string
): Promise<{ title: string; content: string }> {
  const url = `https://docs.googleapis.com/v1/documents/${documentId}`;

  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to load document content');
  }

  const doc = await res.json();
  const plainText = parseDocStructure(doc);

  return {
    title: doc.title || 'Untitled Document',
    content: plainText,
  };
}

/**
 * Creates a brand new Google Doc with the specified title and content.
 */
export async function createGoogleDoc(
  accessToken: string,
  title: string,
  content: string
): Promise<{ documentId: string; url: string }> {
  // 1. Create the empty document
  const createUrl = 'https://docs.googleapis.com/v1/documents';
  const createRes = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      title: title,
    }),
  });

  if (!createRes.ok) {
    const errorData = await createRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to create Google Doc');
  }

  const newDoc = await createRes.json();
  const documentId = newDoc.documentId;

  // 2. Insert the actual text content using batchUpdate
  if (content && content.trim()) {
    const updateUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;
    const updateRes = await fetch(updateUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        requests: [
          {
            insertText: {
              text: content,
              location: {
                index: 1,
              },
            },
          },
        ],
      }),
    });

    if (!updateRes.ok) {
      const errorData = await updateRes.json().catch(() => ({}));
      console.warn('Document created but content insertion failed:', errorData.error?.message);
    }
  }

  return {
    documentId,
    url: `https://docs.google.com/document/d/${documentId}/edit`,
  };
}

/**
 * Overwrites an existing Google Doc with new text.
 * Note: To overwrite, we delete the existing content from range 1 to end, then insert new text.
 * We first need to get the document's end index.
 */
export async function overwriteGoogleDoc(
  accessToken: string,
  documentId: string,
  content: string
): Promise<void> {
  // 1. Get the current document to find the endIndex
  const getUrl = `https://docs.googleapis.com/v1/documents/${documentId}`;
  const getRes = await fetch(getUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!getRes.ok) {
    const errorData = await getRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to retrieve doc before overwrite');
  }

  const doc = await getRes.json();
  
  // Find the exact length/end index of the body.
  // The very last element's end index of the body content represents the end.
  const contentArray = doc.body?.content || [];
  let endIndex = 1;
  if (contentArray.length > 0) {
    const lastElement = contentArray[contentArray.length - 1];
    endIndex = lastElement.endIndex || 1;
  }

  const requests: any[] = [];

  // 2. If the document has content, add a delete request.
  // Note: We can only delete up to endIndex - 1 because index 0 is start and the final paragraph mark at endIndex cannot be deleted.
  if (endIndex > 2) {
    requests.push({
      deleteContentRange: {
        range: {
          startIndex: 1,
          endIndex: endIndex - 1,
        },
      },
    });
  }

  // 3. Add the insert text request
  requests.push({
    insertText: {
      text: content || '',
      location: {
        index: 1,
      },
    },
  });

  const updateUrl = `https://docs.googleapis.com/v1/documents/${documentId}:batchUpdate`;
  const updateRes = await fetch(updateUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ requests }),
  });

  if (!updateRes.ok) {
    const errorData = await updateRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to update Google Doc content');
  }
}