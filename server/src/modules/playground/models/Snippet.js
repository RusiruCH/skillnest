import mongoose from 'mongoose';

const SnippetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Snippet title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
      default: 'Untitled Snippet'
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: ''
    },
    code: {
      type: String,
      required: [true, 'Code content is required']
    },
    language: {
      type: String,
      required: [true, 'Programming language is required'],
      enum: {
        values: ['javascript', 'python', 'cpp', 'java', 'html'],
        message: '{VALUE} is not a supported language'
      },
      lowercase: true,
      trim: true
    },
    stdin: {
      type: String,
      default: '',
      maxlength: [10000, 'Input (stdin) cannot exceed 10,000 characters']
    },
    output: {
      type: String,
      default: '',
      maxlength: [50000, 'Output cannot exceed 50,000 characters']
    },
    userId: {
      type: mongoose.Schema.Types.Mixed, // Supports ObjectId from User model or string identifier
      default: null,
      index: true
    },
    userName: {
      type: String,
      default: 'Guest',
      trim: true
    },
    isPublic: {
      type: Boolean,
      default: true,
      index: true
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: (v) => Array.isArray(v) && v.length <= 10,
        message: 'Cannot have more than 10 tags'
      }
    },
    forkedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Snippet',
      default: null
    },
    forkCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Text index for searching snippets by title, description, and tags
// default_language: 'none' and language_override: 'none' disable natural language stemming
// so programming languages (e.g. 'python', 'javascript', 'cpp', 'java', 'html') are not mistaken for spoken language stemmers
SnippetSchema.index(
  { title: 'text', description: 'text', tags: 'text' },
  { default_language: 'none', language_override: 'none' }
);

const Snippet = mongoose.models.Snippet || mongoose.model('Snippet', SnippetSchema);

export default Snippet;
