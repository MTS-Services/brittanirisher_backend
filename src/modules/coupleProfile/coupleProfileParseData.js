const CoupleParseMiddleware = () => {
  return (req, res, next) => {
    try {
      if (req.body && req.body.budget && typeof req.body.budget === 'string') {
        req.body.budget = Number(req.body.budget);
      }

      next();
    } catch (error) {
      return res.status(400).json({
        error: "Invalid JSON format inside 'package' field.",
      });
    }
  };
};

module.exports = CoupleParseMiddleware;
