import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const lessonsDir = path.join(root, 'lessons');
const publicDir = path.join(root, 'public');
const publicLessonsDir = path.join(publicDir, 'lessons');
const manifestPath = path.join(publicDir, 'manifest.json');

// The catalog below was created exclusively from the file names supplied by the project owner.
// No lesson HTML content is opened or parsed by this script.
const categories = [
  {
    id: 'ai-machine-learning',
    title: 'AI & Machine Learning',
    description: 'Machine learning courses, algorithms, and learning paradigms.',
    icon: 'brain-circuit',
    accent: 'violet',
  },
  {
    id: 'mathematics',
    title: 'Mathematics',
    description: 'Mathematical foundations used in machine learning.',
    icon: 'function-square',
    accent: 'blue',
  },
  {
    id: 'python-programming',
    title: 'Python & Programming',
    description: 'Python foundations, object-oriented programming, and algorithms.',
    icon: 'code-2',
    accent: 'cyan',
  },
  {
    id: 'software-engineering',
    title: 'Software Engineering',
    description: 'Software design, architecture, and reusable engineering practices.',
    icon: 'blocks',
    accent: 'orange',
  },
  {
    id: 'devops-infrastructure',
    title: 'DevOps & Infrastructure',
    description: 'Tools and practices for building and running software systems.',
    icon: 'container',
    accent: 'green',
  },
  {
    id: 'cybersecurity',
    title: 'Cybersecurity',
    description: 'Security concepts and endpoint protection.',
    icon: 'shield-check',
    accent: 'rose',
  },
];

const seededLessons = [
  { filename: 'design-patterns-course.html', id: 'design-patterns', title: 'Design Patterns', categoryId: 'software-engineering', subcategory: 'Software Design', language: 'English' },
  { filename: 'docker-course.html', id: 'docker-course', title: 'Docker', categoryId: 'devops-infrastructure', subcategory: 'Containers', language: 'English' },
  { filename: 'Endpoint-Security-Course.html', id: 'endpoint-security', title: 'Endpoint Security', categoryId: 'cybersecurity', subcategory: 'Endpoint Protection', language: 'English' },
  { filename: 'MAGIC Python Feature.html', id: 'magic-python-features', title: 'Magic Python Features', categoryId: 'python-programming', subcategory: 'Python Language Features', language: 'English' },
  { filename: 'Mathematics for ML - Linear Algebra.html', id: 'ml-linear-algebra', title: 'Linear Algebra for Machine Learning', categoryId: 'mathematics', subcategory: 'Mathematics for Machine Learning', language: 'English' },
  { filename: 'Mathematics for ML - Multivariate Calculus.html', id: 'ml-multivariate-calculus', title: 'Multivariate Calculus for Machine Learning', categoryId: 'mathematics', subcategory: 'Mathematics for Machine Learning', language: 'English' },
  { filename: 'Mathematics for ML - PCA.html', id: 'ml-pca', title: 'Principal Component Analysis (PCA)', categoryId: 'mathematics', subcategory: 'Mathematics for Machine Learning', language: 'English' },
  { filename: 'ML-advanced-learning-algorithms.html', id: 'advanced-learning-algorithms', title: 'Advanced Learning Algorithms', categoryId: 'ai-machine-learning', subcategory: 'Machine Learning', language: 'English' },
  { filename: 'ML-supervised-ml.html', id: 'supervised-machine-learning', title: 'Supervised Machine Learning', categoryId: 'ai-machine-learning', subcategory: 'Machine Learning', language: 'English' },
  { filename: 'ML-Unsupervised-Recommenders-RL.html', id: 'unsupervised-recommenders-rl', title: 'Unsupervised Learning, Recommenders & Reinforcement Learning', categoryId: 'ai-machine-learning', subcategory: 'Machine Learning', language: 'English' },
  { filename: 'oop-python-blueprint-lab.html', id: 'python-oop-blueprint-lab', title: 'Object-Oriented Programming in Python', categoryId: 'python-programming', subcategory: 'Python', language: 'English' },
  { filename: 'python-course.html', id: 'python-course', title: 'Python Course', categoryId: 'python-programming', subcategory: 'Python Fundamentals', language: 'English' },
  { filename: 'Python-DSA-Course-AR.html', id: 'python-dsa-arabic', title: 'Data Structures & Algorithms with Python', categoryId: 'python-programming', subcategory: 'Data Structures & Algorithms', language: 'Arabic' },
  { filename: 'Service-Oriented Architecture-course.html', id: 'service-oriented-architecture', title: 'Service-Oriented Architecture', categoryId: 'software-engineering', subcategory: 'Software Architecture', language: 'English' },
  { filename: 'software-architecture-course.html', id: 'software-architecture', title: 'Software Architecture', categoryId: 'software-engineering', subcategory: 'Software Architecture', language: 'English' },
  { filename: 'software-design-architecture-course.html', id: 'software-design-architecture', title: 'Software Design & Architecture', categoryId: 'software-engineering', subcategory: 'Software Design', language: 'English' },
];

function walk(dir, base = dir) {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    if (entry.name.startsWith('.')) return [];
    const absolute = path.join(dir, entry.name);
    if (entry.isDirectory()) return walk(absolute, base);
    if (!entry.isFile() || path.extname(entry.name).toLowerCase() !== '.html') return [];
    return [{ absolute, relative: path.relative(base, absolute).split(path.sep).join('/') }];
  });
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/\.html$/i, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'lesson';
}

function inferTitle(filename) {
  return path.basename(filename, path.extname(filename))
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function inferCategory(filename) {
  const name = filename.toLowerCase();
  if (name.includes('docker')) return { categoryId: 'devops-infrastructure', subcategory: 'Containers' };
  if (name.includes('endpoint') || name.includes('security')) return { categoryId: 'cybersecurity', subcategory: 'Security' };
  if (name.includes('mathematics') || name.includes('linear-algebra') || name.includes('calculus') || name.includes('pca')) return { categoryId: 'mathematics', subcategory: 'Mathematics' };
  if (name.startsWith('ml-') || name.includes('machine-learning')) return { categoryId: 'ai-machine-learning', subcategory: 'Machine Learning' };
  if (name.includes('python') || name.includes('oop') || name.includes('dsa')) return { categoryId: 'python-programming', subcategory: 'Python' };
  if (name.includes('architecture') || name.includes('design-pattern') || name.includes('soa')) return { categoryId: 'software-engineering', subcategory: 'Software Design & Architecture' };
  return { categoryId: 'uncategorized', subcategory: 'Uncategorized' };
}

function publicUrl(relative) {
  return `/lessons/${relative.split('/').map(encodeURIComponent).join('/')}`;
}

const discoveredFiles = walk(lessonsDir);
const discoveredByName = new Map(discoveredFiles.map((file) => [path.basename(file.relative).toLowerCase(), file]));
const knownNames = new Set(seededLessons.map((lesson) => lesson.filename.toLowerCase()));

const lessons = seededLessons.map((seed) => {
  const actual = discoveredByName.get(seed.filename.toLowerCase());
  return {
    ...seed,
    filename: actual ? path.basename(actual.relative) : seed.filename,
    path: actual ? publicUrl(actual.relative) : publicUrl(seed.filename),
    available: Boolean(actual),
  };
});

for (const file of discoveredFiles) {
  const filename = path.basename(file.relative);
  if (knownNames.has(filename.toLowerCase())) continue;
  const inferred = inferCategory(filename);
  const id = slugify(file.relative);
  lessons.push({
    id,
    title: inferTitle(filename),
    filename,
    categoryId: inferred.categoryId,
    subcategory: inferred.subcategory,
    language: /(^|[-_ ])ar(\.|[-_ ])/i.test(filename) ? 'Arabic' : 'English',
    path: publicUrl(file.relative),
    available: true,
  });
}

const allCategories = [...categories];
if (lessons.some((lesson) => lesson.categoryId === 'uncategorized')) {
  allCategories.push({
    id: 'uncategorized',
    title: 'Uncategorized',
    description: 'New lessons that have not been assigned to a category yet.',
    icon: 'folder-open',
    accent: 'slate',
  });
}

fs.mkdirSync(publicDir, { recursive: true });
fs.writeFileSync(manifestPath, JSON.stringify({
  generatedAt: new Date().toISOString(),
  categories: allCategories,
  lessons,
}, null, 2));

// Copy lesson files and their companion assets without reading or modifying their contents.
if (fs.existsSync(publicLessonsDir)) fs.rmSync(publicLessonsDir, { recursive: true, force: true });
fs.mkdirSync(publicLessonsDir, { recursive: true });
for (const entry of fs.readdirSync(lessonsDir, { withFileTypes: true })) {
  if (entry.name.startsWith('.')) continue;
  fs.cpSync(path.join(lessonsDir, entry.name), path.join(publicLessonsDir, entry.name), { recursive: true });
}

const availableCount = lessons.filter((lesson) => lesson.available).length;
const missingCount = lessons.length - availableCount;
console.log(`Lesson catalog generated: ${lessons.length} listed, ${availableCount} HTML file(s) found, ${missingCount} awaiting files.`);
