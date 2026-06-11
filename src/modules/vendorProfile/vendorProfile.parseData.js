const packageParseMiddleware = () => {
  return (req, res, next) => {
    try {
      if (
        req.body &&
        req.body.package &&
        typeof req.body.package === 'string'
      ) {
        req.body.package = JSON.parse(req.body.package);
      }

      if (
        req.body &&
        req.body.highlightedServices &&
        typeof req.body.highlightedServices === 'string'
      ) {
        req.body.highlightedServices = JSON.parse(req.body.highlightedServices);
      }

      if (
        req.body &&
        req.body.socialLinks &&
        typeof req.body.socialLinks === 'string'
      ) {
        req.body.socialLinks = JSON.parse(req.body.socialLinks);
      }

      if (
        req.body &&
        req.body.contactLinks &&
        typeof req.body.contactLinks === 'string'
      ) {
        req.body.contactLinks = JSON.parse(req.body.contactLinks);
      }

      next();
    } catch (error) {
      return res.status(400).json({
        error: "Invalid JSON format inside 'package' field.",
      });
    }
  };
};

module.exports = packageParseMiddleware;
