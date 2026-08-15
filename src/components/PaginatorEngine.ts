export async function paginateContent(
  html: string,
  width: string,
  height: string,
  styles: {
    fontFamily: string;
    fontSize: string;
    lineHeight: string;
    paddingTop: string;
    paddingBottom: string;
    paddingLeft: string;
    paddingRight: string;
    textAlign: string;
  }
): Promise<string[]> {
  await document.fonts.ready;
  return new Promise((resolve) => {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'absolute';
    iframe.style.top = '-9999px';
    iframe.style.width = width;
    iframe.style.height = height;
    iframe.style.visibility = 'hidden';
    document.body.appendChild(iframe);

    const doc = iframe.contentDocument || iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return resolve([html]);
    }

    const numericHeight = parseInt(height, 10);
    const totalVerticalPadding =
      parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom);
    const contentHeightLimit =
      isNaN(numericHeight) || numericHeight <= 0
        ? iframe.clientHeight - totalVerticalPadding
        : numericHeight - totalVerticalPadding;

    doc.body.innerHTML = `<div id="measure-container" style="
      font-family: ${styles.fontFamily};
      font-size: ${styles.fontSize};
      line-height: ${styles.lineHeight};
      padding-top: ${styles.paddingTop};
      padding-bottom: ${styles.paddingBottom};
      padding-left: ${styles.paddingLeft};
      padding-right: ${styles.paddingRight};
      text-align: ${styles.textAlign};
      width: 100%;
      box-sizing: border-box;
    "></div>`;

    const container = doc.getElementById('measure-container')!;

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const pages: string[] = [];
    const children = Array.from(tempDiv.children);

    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      const childHtml = child.outerHTML;

      const previousHtml = container.innerHTML;
      container.innerHTML += childHtml;

      if (container.scrollHeight > contentHeightLimit) {
        if (previousHtml) {
          pages.push(previousHtml);
        }
        container.innerHTML = childHtml;
      }
    }

    if (container.innerHTML) {
      pages.push(container.innerHTML);
    }

    document.body.removeChild(iframe);
    resolve(pages.length > 0 ? pages : [html]);
  });
}