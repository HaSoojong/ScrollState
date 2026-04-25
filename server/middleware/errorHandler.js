// Global Express error handler — catches errors passed via next(err) and
// returns a JSON error response with appropriate HTTP status code
'use strict';

/**
 * Express error-handling middleware (4-argument signature).
 * @param {Error} err
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @param {import('express').NextFunction} next
 */
function errorHandler(err, req, res, next) {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
}

module.exports = errorHandler;
