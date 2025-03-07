#!/usr/bin/env node
process.env.FORCE_COLOR = "1";

const { spawn } = require("child_process");
const fs = require("fs");

// Get a log filename from command line if you like:
//   npm run build:map:withlog -- buildlog-other.log
const logFileName = process.argv[2] || "buildlog.log";

// OPTIONAL: Force fancy output even if not in a TTY. Some CLIs need this
// process.env.FORCE_COLOR = "1";

const child = spawn("npm", ["run", "build:map"], {
  shell: true,
  stdio: ["pipe", "pipe", "pipe"], // We want to capture stdout/stderr
});

// Create a write stream in UTF-8
const logStream = fs.createWriteStream(logFileName, { encoding: "utf8" });

// Pipe build output into the file
child.stdout.pipe(logStream);
child.stderr.pipe(logStream);

// Also echo the same output to the console
child.stdout.pipe(process.stdout);
child.stderr.pipe(process.stderr);

// Exit with the same code as the child process
child.on("close", (code) => {
  process.exit(code);
});
