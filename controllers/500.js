module.exports = function (err, req, res, next) {
  console.log(err);
  logger.fatal('Unhandled application exception.', err);
  res.status(500);
  return res.send({ error: 'Unhandled exception. See logs for details.' });
};