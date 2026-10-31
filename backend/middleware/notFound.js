const { sendError } = require('../utils/response');

const notFound = (req, res, next) => {
  return sendError(res, 404, `Route ${req.originalUrl} not found`, []);
};

module.exports = notFound;
