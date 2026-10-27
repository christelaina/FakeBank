"use client";

import { useEffect } from "react";

// Inserted before the html element so it sits directly under the doctype in DevTools.
export function LabSecretsNotice({ iv, secretKey }: { iv: string; secretKey: string }) {
  useEffect(() => {
    const text = ` great this is a safe space to hide the raw texts of my iv and keys. they're not ready for all this. iv: ${iv} key: ${secretKey} `;
    const alreadyAdded = Array.from(document.childNodes).some(
      (node) => node.nodeType === Node.COMMENT_NODE && node.nodeValue === text,
    );
    if (!alreadyAdded) {
      document.insertBefore(document.createComment(text), document.documentElement);
    }

    const table = document.querySelector("table");
    const tableNote = " values are base64 of hex ";
    const tableNoteAdded = table?.previousSibling?.nodeValue === tableNote;
    if (table && !tableNoteAdded) {
      table.before(document.createComment(tableNote));
    }

    console.info(`iv: ${iv}\nkey: ${secretKey}\npayload encoding: base64`);
  }, [iv, secretKey]);

  return null;
}
