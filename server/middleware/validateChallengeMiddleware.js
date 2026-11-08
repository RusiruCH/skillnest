// Validation middleware for Hackathon Challenges (Module 4)
const validateChallengeInput = (req, res, next) => {
  const isUpdate = req.method === 'PUT' || req.method === 'PATCH';
  const { title, description, constraints, difficulty, deadline } = req.body;
  const errors = [];

  // For POST, required fields must be present
  if (!isUpdate) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Challenge title is required.');
    }
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Detailed problem description is required.');
    }
    if (!constraints || typeof constraints !== 'string' || constraints.trim().length === 0) {
      errors.push('Problem constraints are required.');
    }
    if (!difficulty || !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      errors.push("Difficulty must be one of 'Easy', 'Medium', or 'Hard'.");
    }
    if (!deadline) {
      errors.push('Submission deadline date is required.');
    } else {
      const parsedDate = new Date(deadline);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Deadline must be a valid date.');
      }
    }
  } else {
    // For PUT/PATCH, only validate fields that are provided
    if (title !== undefined && (typeof title !== 'string' || title.trim().length === 0)) {
      errors.push('Challenge title cannot be empty.');
    }
    if (title && title.trim().length > 120) {
      errors.push('Challenge title cannot exceed 120 characters.');
    }
    if (difficulty !== undefined && !['Easy', 'Medium', 'Hard'].includes(difficulty)) {
      errors.push("Difficulty must be one of 'Easy', 'Medium', or 'Hard'.");
    }
    if (deadline !== undefined) {
      const parsedDate = new Date(deadline);
      if (isNaN(parsedDate.getTime())) {
        errors.push('Deadline must be a valid date.');
      }
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for challenge data.',
      errors,
    });
  }

  next();
};

// Validation middleware for Submissions
const validateSubmissionInput = (req, res, next) => {
  const { sourceCode } = req.body;
  const errors = [];

  if (!sourceCode || typeof sourceCode !== 'string' || sourceCode.trim().length === 0) {
    errors.push('Source code or solution content is required.');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed for solution submission.',
      errors,
    });
  }

  next();
};

module.exports = {
  validateChallengeInput,
  validateSubmissionInput,
};
