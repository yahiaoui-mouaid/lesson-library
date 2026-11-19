# Lesson Atlas — personal HTML learning library

A static, open-source learning library built with React and Vite. It organizes your existing HTML lesson files into subject collections and displays each original lesson in an embedded viewer.

## What this project does

- Uses the file names you supplied to create an initial catalog of 16 lessons.
- Groups lessons into AI & Machine Learning, Mathematics, Python & Programming, Software Engineering, DevOps & Infrastructure, and Cybersecurity.
- Scans the `lessons/` folder recursively when you run or build the project.
- Generates `public/manifest.json` automatically from file names only. The scanner does **not** open, parse, summarize, or rewrite HTML lesson content.
- Copies the `lessons/` folder into the deployable static assets so lesson files and their relative companion assets are served by Vercel.
- Supports search, subject browsing, bookmarks, completed lessons, and recently opened lessons.
- Saves bookmarks, completion state, and recent lessons in the current browser's LocalStorage.

There is no backend, database, account system, or API server.

## 1. Add your original lesson files

Copy your 16 original `.html` files from `G:\madina\lessons` into this project's root `lessons/` folder.

The resulting structure can be flat:

```text
lesson-atlas/
├── lessons/
│   ├── design-patterns-course.html
│   ├── docker-course.html
│   ├── Endpoint-Security-Course.html
│   ├── MAGIC Python Feature.html
│   └── ... your other HTML files
├── src/
├── scripts/
└── package.json
```

You can also create subfolders inside `lessons/`; the scanner searches recursively. Keep companion images, CSS, JavaScript, fonts, and downloadable files in their original relative locations. Do not rename files unless you also update the seed catalog in `scripts/generate-manifest.mjs`.

**The ZIP supplied with this project does not contain your original lesson HTML files.** Only the file names were supplied in the request, so the catalog is pre-populated but those entries will show `ADD FILE` until you copy the originals into `lessons/`.

## 2. Run locally on Windows

Install Node.js (LTS) if it is not already installed. Then open PowerShell in the extracted project folder and run:

```powershell
npm install
npm run dev
```

Open the local address printed by Vite, normally:

```text
http://localhost:5173
```

The `predev` script scans `lessons/`, updates the catalog, and copies lesson files into `public/lessons/` before the development server starts.

## 3. Build and preview

```powershell
npm run build
npm run preview
```

The generated static website is placed in `dist/`.

## 4. Deploy to GitHub and Vercel

1. Create a GitHub repository and upload the whole project, including `lessons/` and its HTML files.
2. Import that repository into Vercel.
3. Use these settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Deploy.

Whenever you add or replace a lesson in `lessons/` and push the change to GitHub, Vercel rebuilds the site. The generated manifest and static lesson files are updated during that build.

## 5. How classification works

The initial 16 lessons have explicit filename-based category assignments in `scripts/generate-manifest.mjs`. New HTML files are detected recursively and assigned a category using simple filename rules. Files that do not match a rule appear under **Uncategorized**.

To change a lesson's title, category, subcategory, or language, edit its entry in the `seededLessons` array in `scripts/generate-manifest.mjs`. This is metadata only; it does not require editing the HTML lesson itself.

## 6. Important behavior

- Lesson content is not indexed or searched. Search covers lesson names, file names, categories, subcategories, and language metadata.
- Browser progress is local to that browser and device. It does not synchronize between visitors or devices.
- The site is public when deployed publicly, and the lesson files are public static assets.
- The site uses no backend and makes no runtime requests to the GitHub API.

## Initial filename inventory

These are the 16 filenames used to prepare the initial catalog:

1. `design-patterns-course.html`
2. `docker-course.html`
3. `Endpoint-Security-Course.html`
4. `MAGIC Python Feature.html`
5. `Mathematics for ML - Linear Algebra.html`
6. `Mathematics for ML - Multivariate Calculus.html`
7. `Mathematics for ML - PCA.html`
8. `ML-advanced-learning-algorithms.html`
9. `ML-supervised-ml.html`
10. `ML-Unsupervised-Recommenders-RL.html`
11. `oop-python-blueprint-lab.html`
12. `python-course.html`
13. `Python-DSA-Course-AR.html`
14. `Service-Oriented Architecture-course.html`
15. `software-architecture-course.html`
16. `software-design-architecture-course.html`
