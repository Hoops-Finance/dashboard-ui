import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Function to extract error details: file path, line, and column
function extractErrorDetails(output) {
  const lines = output.split('\n');
  const errorDetails = [];
  let currentFile = null;

  const filePathRegex = /^\.\/([\w/[\]\-.]+\.tsx?)$/;
  const errorLineRegex = /^(\d+):(\d+)\s+(Error|Warning):/;

  lines.forEach((line) => {
    const fileMatch = line.match(filePathRegex);
    if (fileMatch) {
      currentFile = fileMatch[1];
      return;
    }

    const errorMatch = line.match(errorLineRegex);
    if (errorMatch && currentFile) {
      const lineNumber = parseInt(errorMatch[1], 10);
      const columnNumber = parseInt(errorMatch[2], 10);
      const severity = errorMatch[3];
      errorDetails.push({
        filePath: currentFile,
        line: lineNumber,
        column: columnNumber,
        severity,
        message: line.trim(),
      });
    }
  });

  return errorDetails;
}

// Function to read a snippet of code around the specified line
function getCodeSnippet(file, line, context = 15) {
  try {
    const filePath = path.resolve(__dirname, file);
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');

    // Calculate the range of lines to extract
    const startLine = Math.max(0, line - context - 1);
    const endLine = Math.min(lines.length, line + context);

    // Extract the snippet
    const snippet = lines.slice(startLine, endLine).join('\n');
    return `\n${file} (around line ${line}):\n"""\n${snippet}\n"""\n`;
  } catch (error) {
    return `\n${file}:\n"""\nError reading file: ${error.message}\n"""\n`;
  }
}

// Run the build command
exec('npm run build', { maxBuffer: 1024 * 1024 * 20 }, (error, stdout, stderr) => {
  const logFilePath = path.join(__dirname, 'log.txt');
  let logContent = '';

  if (error) {
    console.log('Build failed. Collecting error details...');

    // Append build logs
    logContent += '### Build Logs ###\n\n';
    logContent += `${stdout}\n`;
    logContent += `${stderr}\n`;

    // Combine stdout and stderr for error parsing
    const combinedOutput = `${stdout}\n${stderr}`;

    // Extract error details
    const errorDetails = extractErrorDetails(combinedOutput);

    if (errorDetails.length > 0) {
      logContent += '\n### Relevant Files and Code ###\n';
      // To avoid duplicate snippets for the same file and line
      const uniqueErrors = new Set();
      errorDetails.forEach(({ filePath, line }) => {
        const uniqueKey = `${filePath}:${line}`;
        if (!uniqueErrors.has(uniqueKey)) {
          uniqueErrors.add(uniqueKey);
          logContent += getCodeSnippet(filePath, line);
        }
      });
    } else {
      logContent += '\n### No Relevant Code Found ###\n';
    }

    // Write the collected logs and code snippets to log.txt
    fs.writeFileSync(logFilePath, logContent, 'utf-8');
    console.log(`Logs and code snippets saved to ${logFilePath}`);
  } else {
    console.log('Build succeeded.');
  }
});
