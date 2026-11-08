import Snippet from '../models/Snippet.js';
import { executeCode, LANGUAGE_RUNTIME_MAP } from '../services/codeExecutionService.js';
import mongoose from 'mongoose';

/**
 * Complete Language Definitions with starter templates
 */
export const SUPPORTED_LANGUAGES = [
  {
    id: 'javascript',
    name: 'JavaScript',
    version: '18.15.0',
    extension: 'js',
    monacoLang: 'javascript',
    isCompiled: false,
    runtime: 'Node.js',
    defaultCode: `// Welcome to SkillNest Code Playground (JavaScript)
function solve() {
  const message = "Hello, SkillNest Developer!";
  console.log(message);
}

solve();
`
  },
  {
    id: 'python',
    name: 'Python',
    version: '3.10.0',
    extension: 'py',
    monacoLang: 'python',
    isCompiled: false,
    runtime: 'CPython',
    defaultCode: `# Welcome to SkillNest Code Playground (Python)
def solve():
    message = "Hello, SkillNest Developer!"
    print(message)

if __name__ == "__main__":
    solve()
`
  },
  {
    id: 'cpp',
    name: 'C++',
    version: '10.2.0',
    extension: 'cpp',
    monacoLang: 'cpp',
    isCompiled: true,
    runtime: 'GCC / G++',
    defaultCode: `// Welcome to SkillNest Code Playground (C++)
#include <iostream>

int main() {
    std::cout << "Hello, SkillNest Developer!" << std::endl;
    return 0;
}
`
  },
  {
    id: 'java',
    name: 'Java',
    version: '15.0.2',
    extension: 'java',
    monacoLang: 'java',
    isCompiled: true,
    runtime: 'OpenJDK',
    defaultCode: `// Welcome to SkillNest Code Playground (Java)
public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, SkillNest Developer!");
    }
}
`
  },
  {
    id: 'html',
    name: 'HTML / CSS / JS (Web)',
    version: 'Browser Standard',
    extension: 'html',
    monacoLang: 'html',
    isCompiled: false,
    isWebPreview: true,
    runtime: 'Client Sandboxed Iframe',
    defaultCode: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: system-ui, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 90vh;
      background: #0f172a;
      color: #f8fafc;
      margin: 0;
    }
    .card {
      background: #1e293b;
      padding: 2rem;
      border-radius: 12px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
      text-align: center;
      border: 1px solid #334155;
    }
    button {
      background: #3b82f6;
      color: white;
      border: none;
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      transition: background 0.2s;
    }
    button:hover {
      background: #2563eb;
    }
  </style>
</head>
<body>
  <div class="card">
    <h2>SkillNest Live Web Playground</h2>
    <p>Edit HTML, CSS, and JS with instant sandboxed live preview!</p>
    <button id="counterBtn">Clicks: 0</button>
  </div>

  <script>
    let count = 0;
    document.getElementById('counterBtn').addEventListener('click', () => {
      count++;
      document.getElementById('counterBtn').innerText = 'Clicks: ' + count;
    });
  </script>
</body>
</html>
`
  }
];

/**
 * Health & Operational Status Check
 * GET /api/playground/status
 */
export const getPlaygroundStatus = (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.json({
    success: true,
    module: 'Member 03 - Code Playground',
    status: 'operational',
    version: '2.0.0',
    database: {
      status: dbConnected ? 'connected' : 'disconnected',
      readyState: mongoose.connection.readyState
    },
    supportedLanguagesCount: SUPPORTED_LANGUAGES.length,
    rateLimit: '30 requests per minute',
    executionProvider: 'External Sandboxed Container Runner (Piston API)',
    timestamp: new Date().toISOString()
  });
};

/**
 * Get Supported Languages List
 * GET /api/playground/languages
 */
export const getSupportedLanguages = (req, res) => {
  res.json({
    success: true,
    languages: SUPPORTED_LANGUAGES
  });
};

/**
 * Execute Code Safely (Guest or Authenticated)
 * POST /api/playground/execute
 */
export const runCode = async (req, res) => {
  try {
    const { language, code, stdin } = req.body;

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Language is required.'
      });
    }

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Code cannot be empty.'
      });
    }

    const result = await executeCode({ language, code, stdin });

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    if (error.status === 400) {
      return res.status(400).json({
        success: false,
        isWeb: error.isWeb || false,
        error: error.message
      });
    }

    console.error('[Playground Execution Error]:', error);
    return res.status(500).json({
      success: false,
      error: 'An internal error occurred during code execution.',
      details: error.message
    });
  }
};

/**
 * Create a new code snippet
 * POST /api/playground/snippets
 */
export const createSnippet = async (req, res) => {
  try {
    const { title, description, code, language, stdin, output, isPublic, tags } = req.body;

    if (!code || typeof code !== 'string' || !code.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Code content is required.'
      });
    }

    if (!language || typeof language !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Language is required.'
      });
    }

    const validLangs = ['javascript', 'python', 'cpp', 'java', 'html'];
    if (!validLangs.includes(language.toLowerCase().trim())) {
      return res.status(400).json({
        success: false,
        error: `Language '${language}' is not supported. Supported: ${validLangs.join(', ')}`
      });
    }

    // Guest users cannot create private snippets (they would have no login to retrieve them)
    const isPublicValue = isPublic !== undefined ? Boolean(isPublic) : true;
    if (!isPublicValue && (!req.user || !req.user.id)) {
      return res.status(400).json({
        success: false,
        error: 'Guest users can only create public snippets. Please sign in to create private snippets.'
      });
    }

    const snippetData = {
      title: title && title.trim() ? title.trim() : 'Untitled Snippet',
      description: description ? description.trim() : '',
      code,
      language: language.toLowerCase().trim(),
      stdin: stdin || '',
      output: output || '',
      isPublic: isPublicValue,
      tags: Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [],
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'Guest'
    };

    const snippet = await Snippet.create(snippetData);

    res.status(201).json({
      success: true,
      message: 'Snippet created successfully.',
      data: snippet
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map((e) => e.message).join(', ')
      });
    }

    console.error('[Create Snippet Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create snippet.'
    });
  }
};

/**
 * Get all public snippets (or user's own snippets)
 * GET /api/playground/snippets
 */
export const getAllSnippets = async (req, res) => {
  try {
    const { page = 1, limit = 12, language, search, tag, mySnippets } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
    const skip = (pageNum - 1) * limitNum;

    const query = {};

    // Filter by own snippets vs public snippets
    if (mySnippets === 'true') {
      if (!req.user || !req.user.id) {
        return res.status(401).json({
          success: false,
          error: 'Authentication required to view your personal snippets.'
        });
      }
      query.userId = req.user.id;
    } else {
      // General feed only shows public snippets
      query.isPublic = true;
    }

    // Filter by language
    if (language && language !== 'all') {
      query.language = language.toLowerCase().trim();
    }

    // Filter by tag
    if (tag) {
      query.tags = tag.toLowerCase().trim();
    }

    // Text search (safely escaping regex special characters such as 'c++' or brackets)
    if (search && search.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tags: { $in: [new RegExp(safeSearch, 'i')] } }
      ];
    }

    const [snippets, total] = await Promise.all([
      Snippet.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .select('-code -stdin -output') // Exclude heavy code from feed summary
        .lean(),
      Snippet.countDocuments(query)
    ]);

    res.json({
      success: true,
      data: snippets,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    console.error('[Get All Snippets Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch snippets.'
    });
  }
};

/**
 * Get Snippet by ID
 * GET /api/playground/snippets/:id
 */
export const getSnippetById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid snippet ID format.'
      });
    }

    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found.'
      });
    }

    // Access control: If snippet is private, only owner can view it
    if (!snippet.isPublic) {
      const currentUserId = req.user?.id ? String(req.user.id) : null;
      const snippetAuthorId = snippet.userId ? String(snippet.userId) : null;

      if (!currentUserId || currentUserId !== snippetAuthorId) {
        return res.status(403).json({
          success: false,
          error: 'This snippet is private. Only the author has permission to access it.'
        });
      }
    }

    res.json({
      success: true,
      data: snippet
    });
  } catch (error) {
    console.error('[Get Snippet By ID Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve snippet.'
    });
  }
};

/**
 * Update Snippet
 * PUT /api/playground/snippets/:id
 */
export const updateSnippet = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, code, language, stdin, output, isPublic, tags } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid snippet ID format.'
      });
    }

    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found.'
      });
    }

    // Ownership Enforcement
    const currentUserId = req.user?.id ? String(req.user.id) : null;
    const snippetAuthorId = snippet.userId ? String(snippet.userId) : null;

    if (!snippetAuthorId) {
      // Snippet was created by guest
      return res.status(403).json({
        success: false,
        error: 'Guest snippets cannot be updated in-place. Please use the Fork feature to create your own copy.'
      });
    }

    if (!currentUserId || currentUserId !== snippetAuthorId) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. You can only update your own snippets.'
      });
    }

    // Apply updates
    if (title !== undefined) snippet.title = title.trim();
    if (description !== undefined) snippet.description = description.trim();
    if (code !== undefined) snippet.code = code;
    if (language !== undefined) snippet.language = language.toLowerCase().trim();
    if (stdin !== undefined) snippet.stdin = stdin;
    if (output !== undefined) snippet.output = output;
    if (isPublic !== undefined) snippet.isPublic = Boolean(isPublic);
    if (tags !== undefined && Array.isArray(tags)) snippet.tags = tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean);

    await snippet.save();

    res.json({
      success: true,
      message: 'Snippet updated successfully.',
      data: snippet
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        error: Object.values(error.errors).map((e) => e.message).join(', ')
      });
    }

    console.error('[Update Snippet Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update snippet.'
    });
  }
};

/**
 * Delete Snippet
 * DELETE /api/playground/snippets/:id
 */
export const deleteSnippet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid snippet ID format.'
      });
    }

    const snippet = await Snippet.findById(id);
    if (!snippet) {
      return res.status(404).json({
        success: false,
        error: 'Snippet not found.'
      });
    }

    // Ownership Enforcement
    const currentUserId = req.user?.id ? String(req.user.id) : null;
    const snippetAuthorId = snippet.userId ? String(snippet.userId) : null;

    if (!currentUserId || currentUserId !== snippetAuthorId) {
      return res.status(403).json({
        success: false,
        error: 'Permission denied. You can only delete your own snippets.'
      });
    }

    await Snippet.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Snippet deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Snippet Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete snippet.'
    });
  }
};

/**
 * Fork an existing snippet
 * POST /api/playground/snippets/:id/fork
 */
export const forkSnippet = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid snippet ID format.'
      });
    }

    const original = await Snippet.findById(id);
    if (!original) {
      return res.status(404).json({
        success: false,
        error: 'Original snippet not found.'
      });
    }

    // Can only fork public snippets, or own private snippets
    if (!original.isPublic) {
      const currentUserId = req.user?.id ? String(req.user.id) : null;
      const snippetAuthorId = original.userId ? String(original.userId) : null;

      if (!currentUserId || currentUserId !== snippetAuthorId) {
        return res.status(403).json({
          success: false,
          error: 'Cannot fork a private snippet belonging to another user.'
        });
      }
    }

    const forkedSnippet = await Snippet.create({
      title: `Fork of ${original.title}`,
      description: original.description,
      code: original.code,
      language: original.language,
      stdin: original.stdin,
      output: original.output,
      isPublic: true,
      tags: original.tags,
      userId: req.user ? req.user.id : null,
      userName: req.user ? req.user.name : 'Guest',
      forkedFrom: original._id
    });

    // Increment fork count on parent snippet
    await Snippet.findByIdAndUpdate(original._id, { $inc: { forkCount: 1 } });

    res.status(201).json({
      success: true,
      message: 'Snippet forked successfully.',
      data: forkedSnippet
    });
  } catch (error) {
    console.error('[Fork Snippet Error]:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fork snippet.'
    });
  }
};
