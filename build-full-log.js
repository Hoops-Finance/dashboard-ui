import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

// Function to extract unique file paths from build output
function extractFilePaths(output) {
  const lines = output.split('\n');
  const filePathRegex = /^\.\/.*\.(tsx?)$/; // Matches lines starting with ./ and ending with .ts or .tsx
  const filePaths = new Set();

  lines.forEach(line => {
    const trimmedLine = line.trim();
    if (filePathRegex.test(trimmedLine)) {
      // Remove the leading './' to get the relative path
      const relativePath = trimmedLine.slice(2);
      filePaths.add(relativePath);
    }
  });

  return Array.from(filePaths);
}

// Function to read file content safely
function getFileContent(file) {
  try {
    const filePath = path.resolve(__dirname, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    return `\n${file}:\n"""\n${content}\n"""\n`;
  } catch (error) {
    return `\n${file}:\n"""\nError reading file: ${error.message}\n"""\n`;
  }
}

// Run the build command
exec('npm run build', { maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
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

    // Extract file paths with errors or warnings
    const relevantFiles = extractFilePaths(combinedOutput);

    if (relevantFiles.length > 0) {
      logContent += '\n### Relevant Files and Code ###\n';
      relevantFiles.forEach(file => {
        logContent += getFileContent(file);
      });
    } else {
      logContent += '\n### No Relevant Files Found ###\n';
    }

    // Write the collected logs and code to log.txt
    fs.writeFileSync(logFilePath, logContent, 'utf-8');
    console.log(`Logs and code snippets saved to ${logFilePath}`);
  } else {
    console.log('Build succeeded.');
  }
});
