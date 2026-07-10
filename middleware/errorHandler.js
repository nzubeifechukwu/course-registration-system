function errorHandler(err, req, res, next) {
  console.error("Error:", err.stack || err.message || err);

  // Handle Prisma-specific request errors
  if (err.code && err.code.startsWith("P20")) {
    return res.status(400).render("error", {
      title: "DatabaseError",
      message: "A database constraint or query rule was violated.",
      error: process.env.NODE_ENV === "development" ? err : {}, // Expose error stack trace only in development
    });
  }

  // Handle generic system/runtime errors
  const statusCode = err.status || 500;
  return res.status(statusCode).render("error", {
    title: err.name || "Server Error",
    message: err.message || "An unexpected error occurred.",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
}

module.exports = errorHandler;
