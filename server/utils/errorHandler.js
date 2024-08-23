const handleError = (res, error, statusCode = 500) => {
    console.error(error);
    res.status(statusCode).json({ message: error.message || 'Server Error' });
  };

module.exports = { handleError };