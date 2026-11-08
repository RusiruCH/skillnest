import express from 'express';
import {
  getPlaygroundStatus,
  getSupportedLanguages,
  runCode,
  createSnippet,
  getAllSnippets,
  getSnippetById,
  updateSnippet,
  deleteSnippet,
  forkSnippet
} from '../controllers/playgroundController.js';
import { optionalAuth, requireAuth } from '../middleware/playgroundAuth.js';

const router = express.Router();

/**
 * System and Metadata Endpoints
 */
// GET /api/playground/status - Health, provider & DB check
router.get('/status', getPlaygroundStatus);

// GET /api/playground/languages - Supported languages & starter templates
router.get('/languages', getSupportedLanguages);

/**
 * Code Execution Endpoint
 * POST /api/playground/execute
 * Supports guest execution (rate-limited via server limiter)
 */
router.post('/execute', runCode);

/**
 * Code Snippet Management Endpoints
 */
// POST /api/playground/snippets - Save snippet (Guest or Authenticated)
router.post('/snippets', optionalAuth, createSnippet);

// GET /api/playground/snippets - List public snippets or user's own snippets (?mySnippets=true)
router.get('/snippets', optionalAuth, getAllSnippets);

// GET /api/playground/snippets/:id - Fetch single snippet (Private snippets guarded)
router.get('/snippets/:id', optionalAuth, getSnippetById);

// PUT /api/playground/snippets/:id - Update snippet (Strict ownership enforced)
router.put('/snippets/:id', requireAuth, updateSnippet);

// DELETE /api/playground/snippets/:id - Delete snippet (Strict ownership enforced)
router.delete('/snippets/:id', requireAuth, deleteSnippet);

// POST /api/playground/snippets/:id/fork - Fork snippet (Guest or Authenticated)
router.post('/snippets/:id/fork', optionalAuth, forkSnippet);

export default router;
