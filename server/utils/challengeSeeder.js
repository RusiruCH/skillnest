const mongoose = require('mongoose');
const User = require('../models/User');
const HackathonChallenge = require('../models/HackathonChallenge');
const ChallengeSubmission = require('../models/ChallengeSubmission');

const seedChallenges = async () => {
  try {
    console.log('[Module 04 Seeder] Seeding Hackathon Challenges...');

    // Find or create an instructor
    let instructor = await User.findOne({ role: 'instructor' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Dr. Alan Turing',
        email: 'instructor.challenges@skillnest.edu',
        password: 'password123',
        role: 'instructor',
        instructorStatus: 'approved',
      });
    }

    // Find or create a learner
    let learner = await User.findOne({ role: 'learner' });
    if (!learner) {
      learner = await User.create({
        name: 'Kavishka Madushan',
        email: 'learner.challenges@skillnest.edu',
        password: 'password123',
        role: 'learner',
      });
    }

    // Clean existing challenges and submissions
    await HackathonChallenge.deleteMany({});
    await ChallengeSubmission.deleteMany({});

    const in3Days = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const in5Days = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    const in7Days = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const in10Days = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    const past2Days = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);

    const challenges = await HackathonChallenge.create([
      {
        title: 'Profile Card',
        dayNumber: 1,
        difficulty: 'Easy',
        status: 'Active',
        instructorId: instructor._id,
        deadline: in3Days,
        coverImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=500&auto=format&fit=crop&q=80',
        tags: ['Frontend', 'CSS', 'UI/UX', 'Flexbox'],
        description: 'Design and implement a responsive user profile card that includes an avatar, user name, social media link pills, bio description, and interactive action buttons (Follow / Message). Must be mobile-friendly and accessible.',
        inputRequirements: 'User profile JSON object containing: name (string), bio (string), avatarUrl (string), and socials (array of { platform, url }).',
        outputRequirements: 'Rendered responsive HTML/CSS/React component with hover states and keyboard navigation focus rings.',
        constraints: '• Max container width: 360px on mobile, responsive on tablet/desktop.\n• Pure CSS or Tailwind CSS.\n• WCAG AA contrast compliant color scheme.',
        sampleTestCase: {
          input: '{ name: "Johnny Rogers", role: "Product Designer", followers: 4200 }',
          output: 'Rendered interactive card with dynamic stats and functional toggle buttons.',
          explanation: 'Displays Johnny Rogers with 4.2k followers badge and active status.'
        },
      },
      {
        title: 'Add To Bag',
        dayNumber: 2,
        difficulty: 'Medium',
        status: 'Active',
        instructorId: instructor._id,
        deadline: in5Days,
        coverImage: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500&auto=format&fit=crop&q=80',
        tags: ['E-Commerce', 'State Management', 'React Hooks', 'Cart'],
        description: 'Implement an e-commerce product detail interaction where customers can select item sizes (S, M, L, XL), quantity counters with min/max bounds, dynamic total price calculation, and an animated "Add To Bag" confirmation notification with stock decrement.',
        inputRequirements: 'Product object with: id, title, basePrice, sizesAvailable (array), maxStock (number).',
        outputRequirements: 'Updated shopping cart state containing item id, selected size, quantity, subtotal, and toast trigger.',
        constraints: '• Quantity cannot be less than 1 or exceed maxStock.\n• Size selection is required before adding to bag.\n• Disables button if stock reaches 0.',
        sampleTestCase: {
          input: 'selectedSize = "L", quantity = 2, basePrice = 99.00',
          output: 'cartItem = { id: 101, size: "L", qty: 2, subtotal: 198.00 }',
          explanation: 'Calculates 2 * 99 = 198.00 with size L.'
        },
      },
      {
        title: 'Mobile Navigation',
        dayNumber: 3,
        difficulty: 'Easy',
        status: 'Active',
        instructorId: instructor._id,
        deadline: in7Days,
        coverImage: 'https://images.unsplash.com/photo-1555774698-0b77e0d5fac6?w=500&auto=format&fit=crop&q=80',
        tags: ['Mobile UX', 'Navigation', 'Accessibility', 'Transitions'],
        description: 'Build a smooth, touch-friendly mobile off-canvas navigation menu drawer. Features include hamburger trigger button, backdrop overlay blur, gesture swipe-to-close or click outside detection, and smooth slide-in transition animation.',
        inputRequirements: 'Array of navigation links: { label: string, path: string, icon: string, badge?: string }.',
        outputRequirements: 'Animated drawer component with trap focus, Esc key listener, and body scroll lock when open.',
        constraints: '• Smooth 60fps CSS transitions (transform & opacity).\n• Must trap focus inside modal drawer for screen reader accessibility.\n• Escape key must trigger close.',
        sampleTestCase: {
          input: 'isOpen = true, trigger = "click"',
          output: 'drawer translated to 0%, body style overflow="hidden"',
          explanation: 'Opens full height sidebar drawer without page jumping.'
        }
      },
      {
        title: 'Contact Us Form & Validation',
        dayNumber: 4,
        difficulty: 'Medium',
        status: 'Active',
        instructorId: instructor._id,
        deadline: in10Days,
        coverImage: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?w=500&auto=format&fit=crop&q=80',
        tags: ['Forms', 'Validation', 'Async', 'Regex'],
        description: 'Create a high-conversion Contact Us form with real-time field validation, error indicators, debounced email validity check, character counter for inquiry message (max 500 chars), and asynchronous submission handling with feedback alert states.',
        inputRequirements: 'Form inputs: name, email, subject, message body.',
        outputRequirements: 'JSON payload sent via Axios with validation error array if invalid or 200 OK success feedback.',
        constraints: '• Valid email regex verification.\n• Message length between 20 and 500 characters.\n• Prevent duplicate submission while pending request.',
      },
      {
        title: 'Recipe Nutrition Calculator',
        dayNumber: 5,
        difficulty: 'Medium',
        status: 'Active',
        instructorId: instructor._id,
        deadline: in10Days,
        coverImage: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=80',
        tags: ['Algorithms', 'Data Processing', 'Math'],
        description: 'Build a nutrition aggregator engine. Given an array of ingredients with unit measurements (grams, ml, cups, tablespoons) and a master database of nutrient density per 100g, compute the total calories, protein, carbs, fats, and daily recommended percentage.',
        inputRequirements: 'Array of { ingredientId: string, amount: number, unit: string } and servingSize (number).',
        outputRequirements: 'Computed object: { totalCalories: number, macros: { protein, carbs, fat }, perServing: {...} }.',
        constraints: '• Support conversions between standard imperial and metric units.\n• Round all macro numbers to 1 decimal place.\n• Handle unknown ingredient gracefully with warning flag.',
      },
      {
        title: 'Closed Sprint Challenge (Expired Deadline Demo)',
        dayNumber: 6,
        difficulty: 'Hard',
        status: 'Closed',
        instructorId: instructor._id,
        deadline: past2Days,
        coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=500&auto=format&fit=crop&q=80',
        tags: ['Security', 'Cryptography', 'Closed'],
        description: 'Competitive programming sprint: Implement AES-256-GCM symmetric encryption and decryption helper. (Note: Deadline has passed; demonstrates business rule preventing submissions after deadlines).',
        inputRequirements: 'Plaintext string, 32-byte secret key, optional AAD.',
        outputRequirements: 'Encrypted ciphertext bundle: { cipher, iv, tag } in hexadecimal format.',
        constraints: '• IV must be cryptographically randomly generated 12-byte buffer.\n• Tag must be verified during decryption; throws authentication error if manipulated.',
      }
    ]);

    // Create a sample submission
    await ChallengeSubmission.create({
      challengeId: challenges[0]._id,
      learnerId: learner._id,
      sourceCode: `// Profile Card Component Submission\nexport default function ProfileCard({ user }) {\n  return (\n    <div className="bg-slate-800 rounded-xl p-6 text-center">\n      <img src={user.avatar} className="w-24 h-24 rounded-full mx-auto" alt={user.name} />\n      <h2 className="text-xl font-bold mt-4 text-white">{user.name}</h2>\n    </div>\n  );\n}`,
      language: 'javascript',
      submissionDate: new Date(Date.now() - 3600000),
      status: 'Accepted',
      result: {
        score: 95,
        passed: true,
        feedback: 'Excellent work! Clean React code and responsive layout.',
        gradedBy: instructor._id,
        gradedAt: new Date(),
      },
      runtimeMs: 18,
      memoryMb: 16.4,
    });

    console.log(`[Module 04 Seeder] Successfully seeded ${challenges.length} challenges.`);
  } catch (err) {
    console.error('[Module 04 Seeder] Error:', err.message);
  }
};

module.exports = seedChallenges;
