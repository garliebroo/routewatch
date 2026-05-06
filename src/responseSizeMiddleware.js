const { record } = require('./responseStats');
const { resolveRoutePath } = require('./middleware');

/**
 * Express middleware that intercepts response write/end to measure
 * the size of each response body in bytes.
 */
function responseSizeMiddleware(req, res, next) {
  let size = 0;

  const originalWrite = res.write.bind(res);
  const originalEnd = res.end.bind(res);

  res.write = function (chunk, ...args) {
    if (chunk) {
      size += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
    }
    return originalWrite(chunk, ...args);
  };

  res.end = function (chunk, ...args) {
    if (chunk) {
      size += Buffer.isBuffer(chunk) ? chunk.length : Buffer.byteLength(chunk);
    }
    const route = resolveRoutePath(req);
    const method = req.method || 'UNKNOWN';
    record(route, method, size);
    return originalEnd(chunk, ...args);
  };

  next();
}

module.exports = { responseSizeMiddleware };
