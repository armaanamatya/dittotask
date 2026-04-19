import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const repoDir = __dirname;
const publicDir = path.join(__dirname, "public");

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
};

function resolveRequest(urlPath) {
  if (urlPath === "/" || !urlPath) {
    return path.join(publicDir, "index.html");
  }

  const cleanPath = decodeURIComponent(urlPath.split("?")[0]);
  const relativePath = path.normalize(cleanPath).replace(/^[/\\]+/, "").replace(/^(\.\.[/\\])+/, "");
  return path.join(repoDir, relativePath);
}

const server = http.createServer(async (request, response) => {
  const filePath = resolveRequest(request.url ?? "/");

  if (!filePath.startsWith(repoDir) || !existsSync(filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }

  const fileStat = await stat(filePath);
  if (fileStat.isDirectory()) {
    response.writeHead(403, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Directory listing disabled");
    return;
  }

  const extension = path.extname(filePath);
  response.writeHead(200, {
    "Content-Type": mimeTypes[extension] ?? "application/octet-stream",
    "Cache-Control": "no-cache",
  });

  createReadStream(filePath).pipe(response);
});

const port = Number(process.env.PORT || 3000);
server.listen(port, () => {
  console.log(`Intent Profile Builder running on http://localhost:${port}`);
});
