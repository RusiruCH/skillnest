const CodeExecution = require('../models/CodeExecution');
const { executeCode, SUPPORTED_LANGUAGES } = require('../services/executionService');

/**
 * Module 3: Code Playground Controller
 * Contributor: Member 3 (B.S.D.P. Wickramasingha - SEU/IS/22/ICT/013)
 */

// @desc    Get playground configuration and supported languages
// @route   GET /api/playground/config
// @access  Protected (Learner, Instructor, Admin)
const getPlaygroundConfig = async (req, res) => {
  try {
    const languages = Object.values(SUPPORTED_LANGUAGES).map((l) => ({
      id: l.id,
      label: l.label,
      version: l.version,
      extension: l.extension,
      defaultCode: l.defaultCode,
    }));

    return res.status(200).json({
      success: true,
      languages,
      serviceConfig: {
        provider: process.env.EXECUTION_SERVICE_TYPE || 'judge0',
        hasCustomService: Boolean(process.env.EXECUTION_SERVICE_URL || process.env.PISTON_API_URL),
        timeoutMs: parseInt(process.env.EXECUTION_TIMEOUT_MS, 10) || 10000,
      },
    });
  } catch (err) {
    console.error('Error fetching playground config:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to load playground configuration.',
    });
  }
};

// @desc    Execute submitted source code in an isolated sandbox
// @route   POST /api/playground/execute
// @access  Protected
const executeSourceCode = async (req, res) => {
  try {
    const { language, sourceCode, stdin = '' } = req.body;

    // Validate inputs
    if (!language || !SUPPORTED_LANGUAGES[language]) {
      return res.status(400).json({
        success: false,
        message: `Invalid or unsupported programming language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`,
      });
    }

    if (typeof sourceCode !== 'string' || !sourceCode.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Source code is required and cannot be empty.',
      });
    }

    if (sourceCode.length > 60000) {
      return res.status(400).json({
        success: false,
        message: 'Source code exceeds maximum allowed size (60 KB).',
      });
    }

    if (typeof stdin !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Standard input must be a string.',
      });
    }

    // Securely execute using isolated execution service
    const execResult = await executeCode({ language, sourceCode, stdin });

    // Store record in MongoDB under the authenticated user
    const record = await CodeExecution.create({
      user: req.user._id,
      language,
      sourceCode,
      stdin,
      output: execResult.output || '',
      errorMessage: execResult.errorMessage || '',
      status: execResult.status || 'success',
      executionTimeMs: execResult.executionTimeMs || 0,
      isDemo: Boolean(execResult.isDemo),
      executionDate: new Date(),
    });

    return res.status(200).json({
      success: true,
      execution: record,
      isDemo: execResult.isDemo,
      demoNotice: execResult.demoNotice,
      provider: execResult.provider,
    });
  } catch (err) {
    console.error('Code execution error:', err);
    return res.status(500).json({
      success: false,
      message: err.message || 'An error occurred during code execution.',
    });
  }
};

// @desc    Retrieve authenticated learner's execution history
// @route   GET /api/playground/history
// @access  Protected
const getExecutionHistory = async (req, res) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const skip = (page - 1) * limit;

    // Strict user isolation
    const filter = { user: req.user._id };
    if (req.query.language && SUPPORTED_LANGUAGES[req.query.language]) {
      filter.language = req.query.language;
    }

    const [items, total] = await Promise.all([
      CodeExecution.find(filter)
        .sort({ executionDate: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      CodeExecution.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      items,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit) || 1,
      },
    });
  } catch (err) {
    console.error('Error fetching execution history:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve execution history.',
    });
  }
};

// @desc    Retrieve individual execution record
// @route   GET /api/playground/history/:id
// @access  Protected
const getExecutionRecord = async (req, res) => {
  try {
    const record = await CodeExecution.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Execution record not found.',
      });
    }

    // Verify ownership
    if (!record.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to access this execution record.',
      });
    }

    return res.status(200).json({
      success: true,
      execution: record,
    });
  } catch (err) {
    console.error('Error fetching record:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve execution record.',
    });
  }
};

// @desc    Delete single execution record
// @route   DELETE /api/playground/history/:id
// @access  Protected
const deleteExecutionRecord = async (req, res) => {
  try {
    const record = await CodeExecution.findById(req.params.id);
    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'Execution record not found.',
      });
    }

    // Verify ownership
    if (!record.user.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this execution record.',
      });
    }

    await record.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Execution record deleted successfully.',
    });
  } catch (err) {
    console.error('Error deleting record:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete execution record.',
    });
  }
};

// @desc    Clear all execution history for authenticated learner
// @route   DELETE /api/playground/history
// @access  Protected
const clearExecutionHistory = async (req, res) => {
  try {
    const result = await CodeExecution.deleteMany({ user: req.user._id });
    return res.status(200).json({
      success: true,
      message: `Cleared ${result.deletedCount} execution records successfully.`,
    });
  } catch (err) {
    console.error('Error clearing history:', err);
    return res.status(500).json({
      success: false,
      message: 'Failed to clear execution history.',
    });
  }
};

module.exports = {
  getPlaygroundConfig,
  executeSourceCode,
  getExecutionHistory,
  getExecutionRecord,
  deleteExecutionRecord,
  clearExecutionHistory,
};

