export const STARTER_TEMPLATES = {
  javascript: [
    {
      id: 'js-welcome',
      title: 'JavaScript: Hello World',
      description: 'Introductory function with console logging',
      code: `// SkillNest JavaScript Playground
function greet(name) {
  return \`Welcome to SkillNest, \${name}! Ready to master coding?\`;
}

console.log(greet("Developer"));
console.log("Current execution time:", new Date().toLocaleTimeString());
`
    },
    {
      id: 'js-twosum',
      title: 'JavaScript: Two Sum Algorithm',
      description: 'Hash Map approach with O(n) time complexity',
      code: `// Two Sum: Find indices of two numbers that add up to target
function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}

const numbers = [2, 7, 11, 15];
const target = 9;
const result = twoSum(numbers, target);
console.log("Input Numbers:", numbers);
console.log("Target:", target);
console.log("Found Indices:", result, "-> Values:", numbers[result[0]], "+", numbers[result[1]], "=", target);
`
    },
    {
      id: 'js-fib',
      title: 'JavaScript: Fibonacci Series',
      description: 'Iterative Fibonacci generation with formatted output',
      code: `// Generate first N Fibonacci numbers
function generateFibonacci(n) {
  if (n <= 0) return [];
  if (n === 1) return [0];
  const fib = [0, 1];
  for (let i = 2; i < n; i++) {
    fib.push(fib[i - 1] + fib[i - 2]);
  }
  return fib;
}

const terms = 10;
console.log(\`First \${terms} Fibonacci numbers:\`, generateFibonacci(terms));
`
    }
  ],

  python: [
    {
      id: 'py-welcome',
      title: 'Python: Hello World',
      description: 'Clean Pythonic welcome and arithmetic calculations',
      code: `# SkillNest Python Playground
def main():
    name = "SkillNest Learner"
    print(f"Welcome, {name}!")

    # Arithmetic demo
    a, b = 25, 17
    print(f"Calculations with a={a}, b={b}:")
    print(f"  Addition: {a + b}")
    print(f"  Multiplication: {a * b}")
    print(f"  Power: {a ** 2}")

if __name__ == "__main__":
    main()
`
    },
    {
      id: 'py-binary-search',
      title: 'Python: Binary Search',
      description: 'Classic divide and conquer search with O(log n)',
      code: `# Binary Search Algorithm in Python
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    steps = 0
    while left <= right:
        steps += 1
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid, steps
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1, steps

dataset = [1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23, 25]
target = 17
index, count = binary_search(dataset, target)
print(f"Dataset: {dataset}")
print(f"Searching for: {target}")
if index != -1:
    print(f"Found at index {index} in {count} steps!")
else:
    print("Element not found.")
`
    },
    {
      id: 'py-palindrome',
      title: 'Python: Palindrome & String Ops',
      description: 'String manipulation and palindrome validation',
      code: `# Palindrome string checker
def is_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    return cleaned == cleaned[::-1]

test_phrases = [
    "A man, a plan, a canal: Panama",
    "SkillNest Platform",
    "race a car",
    "Was it a car or a cat I saw?"
]

for phrase in test_phrases:
    result = is_palindrome(phrase)
    status = "PALINDROME" if result else "NOT A PALINDROME"
    print(f"'{phrase}' -> {status}")
`
    }
  ],

  cpp: [
    {
      id: 'cpp-welcome',
      title: 'C++: Hello World & Vector',
      description: 'Standard library vector sorting and printing',
      code: `// SkillNest C++ Playground
#include <iostream>
#include <vector>
#include <algorithm>

int main() {
    std::cout << "=== SkillNest C++ Engine ===" << std::endl;

    std::vector<int> numbers = {64, 34, 25, 12, 22, 11, 90};
    std::cout << "Original array: ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;

    std::sort(numbers.begin(), numbers.end());

    std::cout << "Sorted array:   ";
    for (int n : numbers) std::cout << n << " ";
    std::cout << std::endl;

    return 0;
}
`
    },
    {
      id: 'cpp-primes',
      title: 'C++: Sieve of Eratosthenes',
      description: 'Find all prime numbers up to N',
      code: `// Find primes using Sieve of Eratosthenes
#include <iostream>
#include <vector>

void findPrimes(int limit) {
    std::vector<bool> isPrime(limit + 1, true);
    isPrime[0] = isPrime[1] = false;

    for (int p = 2; p * p <= limit; p++) {
        if (isPrime[p]) {
            for (int i = p * p; i <= limit; i += p) {
                isPrime[i] = false;
            }
        }
    }

    std::cout << "Primes up to " << limit << ": ";
    int count = 0;
    for (int p = 2; p <= limit; p++) {
        if (isPrime[p]) {
            std::cout << p << " ";
            count++;
        }
    }
    std::cout << "\\nTotal primes found: " << count << std::endl;
}

int main() {
    findPrimes(50);
    return 0;
}
`
    }
  ],

  java: [
    {
      id: 'java-welcome',
      title: 'Java: Standard Main',
      description: 'Standard Java class with array operations',
      code: `// SkillNest Java Playground
public class Main {
    public static void main(String[] args) {
        System.out.println("=== SkillNest Java Runner ===");

        int[] scores = {85, 92, 78, 96, 88};
        int sum = 0;
        int max = scores[0];

        for (int score : scores) {
            sum += score;
            if (score > max) max = score;
        }

        double average = (double) sum / scores.length;
        System.out.println("Scores analyzed: " + scores.length);
        System.out.println("Maximum Score:   " + max);
        System.out.println("Average Score:   " + average);
    }
}
`
    },
    {
      id: 'java-sorting',
      title: 'Java: Bubble Sort Demo',
      description: 'Algorithm visualization in Java',
      code: `// Bubble Sort in Java
public class Main {
    static void bubbleSort(int[] arr) {
        int n = arr.length;
        for (int i = 0; i < n - 1; i++) {
            for (int j = 0; j < n - i - 1; j++) {
                if (arr[j] > arr[j + 1]) {
                    int temp = arr[j];
                    arr[j] = arr[j + 1];
                    arr[j + 1] = temp;
                }
            }
        }
    }

    public static void main(String[] args) {
        int[] data = {5, 1, 4, 2, 8};
        System.out.print("Before: ");
        for (int x : data) System.out.print(x + " ");
        System.out.println();

        bubbleSort(data);

        System.out.print("After:  ");
        for (int x : data) System.out.print(x + " ");
        System.out.println();
    }
}
`
    }
  ],

  html: [
    {
      id: 'html-interactive-card',
      title: 'Web: Interactive Counter Card',
      description: 'Modern glassmorphic card with live JavaScript button',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: radial-gradient(circle at top, #1e293b, #0f172a);
      color: #f8fafc;
      padding: 1.5rem;
    }
    .card {
      background: rgba(30, 41, 59, 0.7);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 2.5rem;
      max-width: 420px;
      width: 100%;
      text-align: center;
      box-shadow: 0 20px 40px -15px rgba(0,0,0,0.5);
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.4);
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    h1 { font-size: 1.5rem; margin-bottom: 0.5rem; }
    p { color: #94a3b8; font-size: 0.875rem; margin-bottom: 1.5rem; }
    .counter-display {
      font-size: 3rem;
      font-weight: 800;
      color: #38bdf8;
      margin-bottom: 1.5rem;
      font-variant-numeric: tabular-nums;
    }
    .btn-group {
      display: flex;
      gap: 0.75rem;
      justify-content: center;
    }
    button {
      padding: 0.6rem 1.25rem;
      border-radius: 8px;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-inc { background: #3b82f6; color: white; }
    .btn-inc:hover { background: #2563eb; transform: translateY(-1px); }
    .btn-dec { background: #ef4444; color: white; }
    .btn-dec:hover { background: #dc2626; transform: translateY(-1px); }
    .btn-reset { background: #475569; color: white; }
    .btn-reset:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="card">
    <span class="badge">SANDBOXED PREVIEW</span>
    <h1>SkillNest Live Web</h1>
    <p>Real-time client-side preview with isolated iframe execution.</p>
    <div id="count" class="counter-display">0</div>
    <div class="btn-group">
      <button class="btn-dec" id="decBtn">- Decrement</button>
      <button class="btn-reset" id="resetBtn">Reset</button>
      <button class="btn-inc" id="incBtn">+ Increment</button>
    </div>
  </div>

  <script>
    let value = 0;
    const display = document.getElementById('count');
    document.getElementById('incBtn').onclick = () => { value++; display.textContent = value; };
    document.getElementById('decBtn').onclick = () => { value--; display.textContent = value; };
    document.getElementById('resetBtn').onclick = () => { value = 0; display.textContent = value; };
  </script>
</body>
</html>
`
    }
  ]
};
