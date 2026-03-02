/**
 * Wraps async functions to automatically catch errors and pass them to the Express Next function.
 * Eliminates the need for try...catch blocks in controllers.
 */
module.exports = fn => {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
};