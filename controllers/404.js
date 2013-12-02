module.exports = function(req, res, next) {
    res.status(404);
    // respond with json
    res.send({ error: 'Resource not found' });
    return;
};