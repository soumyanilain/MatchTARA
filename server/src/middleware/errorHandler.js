const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.message);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File size exceeds 5 MB limit.' });
  }

  if (err.message === 'Only PDF files are allowed') {
    return res.status(400).json({ error: err.message });
  }

  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'development'
      ? err.message
      : 'An unexpected error occurred.',
  });
};

module.exports = { errorHandler };
