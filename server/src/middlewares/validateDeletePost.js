// Validation middleware
import { param, validationResult } from 'express-validator';
const validateDeletePost = [
  param("id").isMongoId().withMessage("Invalid post ID"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export { validateDeletePost };
