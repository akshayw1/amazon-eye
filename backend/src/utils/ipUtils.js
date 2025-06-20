/**
 * Extract client IP address from request object
 * Handles various proxy configurations and headers
 */
const getClientIpAddress = (req) => {
  // Check for IP from shared internet
  let ip = req.headers['x-forwarded-for'] || 
           req.headers['x-real-ip'] ||
           req.headers['x-client-ip'] ||
           req.connection?.remoteAddress ||
           req.socket?.remoteAddress ||
           (req.connection?.socket ? req.connection.socket.remoteAddress : null) ||
           req.ip ||
           'unknown';

  // x-forwarded-for can contain multiple IPs, get the first one
  if (ip && ip.includes(',')) {
    ip = ip.split(',')[0];
  }

  // Clean up IPv6 mapped IPv4 addresses
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  return ip.trim();
};

module.exports = {
  getClientIpAddress
}; 