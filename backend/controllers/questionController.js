const Quiz = require('../models/Quiz');
const QuizQuestion = require('../models/QuizQuestion');

// Helper to recalculate total quiz marks
const recalculateQuizMarks = async (quizId) => {
  const questions = await QuizQuestion.find({ quiz: quizId });
  const total = questions.reduce((sum, q) => sum + (q.marks || 0), 0);
  await Quiz.findByIdAndUpdate(quizId, { totalMarks: total });
  return total;
};

// @desc    Get all questions for a quiz
// @route   GET /api/quizzes/:quizId/questions
// @access  Protected
const getQuizQuestions = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    const isLearner = req.user.role === 'learner';

    // Learners can only see questions for published quizzes
    if (isLearner && !quiz.isPublished) {
      return res.status(403).json({
        success: false,
        message: 'Quiz is not published'
      });
    }

    let query = QuizQuestion.find({ quiz: quiz._id }).sort({ order: 1, createdAt: 1 });

    // CRITICAL SECURITY:
    // For learners, correctOptionId and explanation are NEVER returned!
    // For instructors / admins, we explicitly include correctOptionId and explanation.
    if (!isLearner) {
      query = query.select('+correctOptionId +explanation');
    }

    const questions = await query;

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a question to a quiz
// @route   POST /api/quizzes/:quizId/questions
// @access  Protected (Instructor [owner], Administrator)
const addQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found'
      });
    }

    // Ownership check
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only add questions to your own quiz'
      });
    }

    const { questionText, options, correctOptionIndex, marks, explanation, order } = req.body;

    if (!questionText || !options || !Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide questionText and an array of options'
      });
    }

    if (options.length < 2 || options.length > 6) {
      return res.status(400).json({
        success: false,
        message: 'A question must contain between 2 and 6 options'
      });
    }

    // Validate option texts
    const formattedOptions = options.map((opt) => ({
      text: typeof opt === 'string' ? opt.trim() : (opt.text || '').trim()
    }));

    const emptyOption = formattedOptions.some((opt) => !opt.text);
    if (emptyOption) {
      return res.status(400).json({
        success: false,
        message: 'Option text cannot be empty'
      });
    }

    // Temporary document creation to generate option subdocument _ids
    const questionDoc = new QuizQuestion({
      quiz: quiz._id,
      questionText: questionText.trim(),
      options: formattedOptions,
      marks: marks ? Number(marks) : 1,
      explanation: explanation || '',
      order: order !== undefined ? Number(order) : 0
    });

    // Identify correct option by index or ID
    let selectedOptionId;
    if (correctOptionIndex !== undefined && formattedOptions[correctOptionIndex]) {
      selectedOptionId = questionDoc.options[correctOptionIndex]._id;
    } else if (req.body.correctOptionId) {
      selectedOptionId = req.body.correctOptionId;
    }

    if (!selectedOptionId) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a valid correct option for this question'
      });
    }

    questionDoc.correctOptionId = selectedOptionId;
    await questionDoc.save();

    // Recalculate total marks for the quiz
    const totalMarks = await recalculateQuizMarks(quiz._id);

    // Return question with correctOptionId and explanation visible to creator
    const saved = await QuizQuestion.findById(questionDoc._id).select('+correctOptionId +explanation');

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      quizTotalMarks: totalMarks,
      data: saved
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a question
// @route   PUT /api/quizzes/:quizId/questions/:questionId
// @access  Protected (Instructor [owner], Administrator)
const updateQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Ownership check
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only edit questions in your own quiz'
      });
    }

    const question = await QuizQuestion.findOne({
      _id: req.params.questionId,
      quiz: quiz._id
    }).select('+correctOptionId +explanation');

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found in this quiz'
      });
    }

    const { questionText, options, correctOptionId, correctOptionIndex, marks, explanation, order } = req.body;

    if (questionText) question.questionText = questionText.trim();
    if (marks !== undefined) question.marks = Number(marks);
    if (explanation !== undefined) question.explanation = explanation;
    if (order !== undefined) question.order = Number(order);

    if (options && Array.isArray(options)) {
      if (options.length < 2 || options.length > 6) {
        return res.status(400).json({
          success: false,
          message: 'A question must contain between 2 and 6 options'
        });
      }

      question.options = options.map((opt) => ({
        text: typeof opt === 'string' ? opt.trim() : (opt.text || '').trim()
      }));

      // Update correctOptionId if index provided
      if (correctOptionIndex !== undefined && question.options[correctOptionIndex]) {
        question.correctOptionId = question.options[correctOptionIndex]._id;
      }
    }

    if (correctOptionId) {
      question.correctOptionId = correctOptionId;
    }

    await question.save();
    const totalMarks = await recalculateQuizMarks(quiz._id);

    const updated = await QuizQuestion.findById(question._id).select('+correctOptionId +explanation');

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      quizTotalMarks: totalMarks,
      data: updated
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a question
// @route   DELETE /api/quizzes/:quizId/questions/:questionId
// @access  Protected (Instructor [owner], Administrator)
const deleteQuestion = async (req, res, next) => {
  try {
    const quiz = await Quiz.findById(req.params.quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    // Ownership check
    if (
      req.user.role === 'instructor' &&
      quiz.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You can only delete questions from your own quiz'
      });
    }

    const question = await QuizQuestion.findOne({
      _id: req.params.questionId,
      quiz: quiz._id
    });

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    await question.deleteOne();
    const totalMarks = await recalculateQuizMarks(quiz._id);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
      quizTotalMarks: totalMarks
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getQuizQuestions,
  addQuestion,
  updateQuestion,
  deleteQuestion
};
