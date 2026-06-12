async function main() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }

  const toolArgs = JSON.parse(Buffer.concat(chunks).toString());

  const filePath =
    toolArgs.tool_input?.file_path || toolArgs.tool_input?.path || "";

  if (filePath.includes(".env") && !filePath.endsWith(".env.example")) {
    console.error("Access to .env* files is blocked for security");
    process.exit(2);
  }
}

main();
