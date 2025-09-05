"use client";

import { useState } from "react";
import { MonacoEditor } from "@/components/editors/MonocaEditor";

export default function Test() {
  const [files, setFiles] = useState({
    "example.js": `// Welcome to Monaco Editor!
console.log('Hello, World!');

function greet(name) {
  return \`Hello, \${name}!\`;
}

// Try editing this file or add new ones!
greet('Developer');`,
    "styles.css": `/* Add your styles here */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.button {
  background: #007acc;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;
}

.button:hover {
  background: #005a9e;
}`,
    "README.md": `# Monaco Editor Demo

This is a consolidated Monaco Editor component that includes:

- File sidebar with add/delete functionality
- Syntax highlighting for multiple languages
- Clean, modern UI with proper theming
- Easy to integrate and extend

## Features

- **Modular Design**: Single component with all functionality
- **File Management**: Add, delete, and switch between files
- **Syntax Support**: JavaScript, TypeScript, CSS, HTML, JSON, and more
- **Callbacks**: onChange, onSave, onFileAdd, onFileDelete
- **Customizable**: Theme, height, and styling options
`,
  });

  const handleFilesChange = (filename: string, content: string) => {
    setFiles((prev) => ({ ...prev, [filename]: content }));
  };

  const handleSave = (filename: string, content: string) => {
    console.log(`Saving ${filename}:`, content);
  };

  const handleFileAdd = (filename: string) => {
    setFiles((prev) => ({ ...prev, [filename]: "" }));
    console.log(`Added new file: ${filename}`);
  };

  const handleFileDelete = (filename: string) => {
    setFiles((prev) => {
      const newFiles = { ...prev };
      delete newFiles[filename];
      return newFiles;
    });
    console.log(`Deleted file: ${filename}`);
  };

  return (
    <MonacoEditor
      files={files}
      onChange={handleFilesChange}
      onSave={handleSave}
      onFileAdd={handleFileAdd}
      onFileDelete={handleFileDelete}
      height="800px"
      theme="vs-dark"
      className="shadow-lg"
    />
  );
}
