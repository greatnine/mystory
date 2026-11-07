const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 8042;
const HOST = '127.0.0.1'; // 纯主机名

// 预定义Ren'Py所需的所有MIME类型
const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.wasm': 'application/wasm', // 关键：WASM文件必须用这个类型
  '.data': 'application/octet-stream',
  '.pak': 'application/octet-stream',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  // 处理根路径，默认返回index.html
  let filePath = req.url === '/' ? '/index.html' : req.url;
  filePath = path.join(__dirname, decodeURIComponent(filePath));
  
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('404 Not Found: ' + filePath);
      return;
    }
    res.writeHead(200, { 'Content-Type': contentType });
    res.end(data);
  });
});

server.listen(PORT, HOST, () => {
  const url = `http://${HOST}:${PORT}/index.html`;
  console.log(`✅ Ren'Py 本地服务已启动: ${url}`);
  console.log(`按 Ctrl+C 停止服务`);
  
  // 可选：自动打开默认浏览器（Windows/Mac/Linux通用）
  const start = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'start' : 'xdg-open';
  require('child_process').exec(`${start} ${url}`);
});
