import { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowUpRight,
  BookOpen,
  Bookmark,
  Brain,
  Calculator,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Compass,
  ExternalLink,
  FileCode2,
  FileText,
  FolderOpen,
  GraduationCap,
  Layers,
  LayoutDashboard,
  Library,
  Menu,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Tag,
  X,
} from 'lucide-react';
import {
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom';

const ICONS = {
  'brain-circuit': Brain,
  'function-square': Calculator,
  'code-2': Code2,
  blocks: Layers,
  container: FolderOpen,
  'shield-check': ShieldCheck,
  'folder-open': FolderOpen,
};

const STORAGE_KEYS = {
  completed: 'lesson-atlas:completed',
  bookmarks: 'lesson-atlas:bookmarks',
  recent: 'lesson-atlas:recent',
  theme: 'lesson-atlas:theme',
};

function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
}

function usePersistentState(key, initialValue) {
  const [value, setValue] = useState(() => readStorage(key, initialValue));
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Progress remains usable for this session if browser storage is unavailable.
    }
  }, [key, value]);
  return [value, setValue];
}

function App() {
  const [manifest, setManifest] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [query, setQuery] = useState('');
  const [completed, setCompleted] = usePersistentState(STORAGE_KEYS.completed, []);
  const [bookmarks, setBookmarks] = usePersistentState(STORAGE_KEYS.bookmarks, []);
  const [recent, setRecent] = usePersistentState(STORAGE_KEYS.recent, []);
  const [theme, setTheme] = usePersistentState(STORAGE_KEYS.theme, 'dark');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    fetch('/manifest.json')
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load lesson manifest (${response.status}).`);
        return response.json();
      })
      .then((data) => {
        if (!cancelled) setManifest(data);
      })
      .catch((error) => {
        if (!cancelled) setLoadError(error.message || 'Could not load the lesson catalog.');
      });
    return () => { cancelled = true; };
  }, []);

  const categories = manifest?.categories || [];
  const lessons = manifest?.lessons || [];
  const availableCount = lessons.filter((lesson) => lesson.available).length;

  const toggleBookmark = (id) => {
    setBookmarks((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]);
  };

  const toggleCompleted = (id) => {
    setCompleted((current) => current.includes(id) ? current.filter((item) => item !== id) : [id, ...current]);
  };

  const recordRecent = (id) => {
    setRecent((current) => [id, ...current.filter((item) => item !== id)].slice(0, 6));
  };

  const handleSearch = (value) => {
    setQuery(value);
    if (value.trim() && location.pathname !== '/all') navigate('/all');
  };

  const shellProps = {
    categories,
    lessons,
    completed,
    bookmarks,
    recent,
    query,
    theme,
    toggleBookmark,
    toggleCompleted,
    recordRecent,
  };

  if (loadError) {
    return (
      <div className="fatal-screen">
        <div className="fatal-card">
          <div className="brand-mark"><Library size={22} /></div>
          <h1>Couldn't open your library</h1>
          <p>{loadError}</p>
          <span className="code-pill">Expected file: public/manifest.json</span>
          <p className="muted">Run <code>npm run dev</code> from the project folder so the catalog is generated first.</p>
        </div>
      </div>
    );
  }

  if (!manifest) {
    return (
      <div className="loading-screen">
        <div className="loading-logo"><Library size={24} /></div>
        <div className="loading-pulse" />
        <span>Preparing your library</span>
      </div>
    );
  }

  return (
    <div className={`app-shell theme-${theme}`}>
      {mobileNavOpen && <button className="mobile-scrim" aria-label="Close navigation" onClick={() => setMobileNavOpen(false)} />}
      <Sidebar
        categories={categories}
        mobileOpen={mobileNavOpen}
        onNavigate={() => setMobileNavOpen(false)}
      />
      <main className="main-panel">
        <Topbar
          query={query}
          onSearch={handleSearch}
          theme={theme}
          onToggleTheme={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          onOpenMenu={() => setMobileNavOpen(true)}
        />
        <div className="page-content">
          <Routes>
            <Route path="/" element={<Dashboard {...shellProps} availableCount={availableCount} />} />
            <Route path="/all" element={<LibraryPage {...shellProps} title="All lessons" description="Your complete collection, ready to explore." />} />
            <Route path="/category/:categoryId" element={<CategoryPage {...shellProps} />} />
            <Route path="/bookmarks" element={<CollectionPage {...shellProps} kind="bookmarks" />} />
            <Route path="/completed" element={<CollectionPage {...shellProps} kind="completed" />} />
            <Route path="/lesson/:lessonId" element={<LessonViewer {...shellProps} />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
        <footer className="app-footer">
          <span>LESSON ATLAS</span>
          <span>Independent learning, organized.</span>
        </footer>
      </main>
    </div>
  );
}

function Sidebar({ categories, mobileOpen, onNavigate }) {
  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
      <Link to="/" className="brand" onClick={onNavigate}>
        <span className="brand-mark"><Library size={21} strokeWidth={2.2} /></span>
        <span className="brand-copy"><strong>lesson atlas</strong><small>PERSONAL LEARNING LIBRARY</small></span>
      </Link>

      <div className="sidebar-label">WORKSPACE</div>
      <nav className="primary-nav" aria-label="Main navigation">
        <SideLink to="/" icon={LayoutDashboard} label="Overview" end onClick={onNavigate} />
        <SideLink to="/all" icon={BookOpen} label="All lessons" onClick={onNavigate} />
        <SideLink to="/bookmarks" icon={Bookmark} label="Bookmarks" onClick={onNavigate} />
        <SideLink to="/completed" icon={CheckCircle2} label="Completed" onClick={onNavigate} />
      </nav>

      <div className="sidebar-section-heading">
        <span className="sidebar-label">SUBJECTS</span>
        <span className="subject-count">{categories.length.toString().padStart(2, '0')}</span>
      </div>
      <nav className="subject-nav" aria-label="Subject categories">
        {categories.map((category) => {
          const Icon = ICONS[category.icon] || FolderOpen;
          return (
            <NavLink
              key={category.id}
              to={`/category/${category.id}`}
              onClick={onNavigate}
              className={({ isActive }) => `subject-link ${isActive ? 'active' : ''}`}
            >
              <span className={`subject-icon accent-${category.accent}`}><Icon size={16} /></span>
              <span>{category.title}</span>
              <ChevronRight className="subject-chevron" size={14} />
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="sidebar-note">
          <div className="note-icon"><Sparkles size={16} /></div>
          <strong>Small steps add up.</strong>
          <p>Keep exploring. Your next idea could be one lesson away.</p>
        </div>
        <div className="sidebar-version"><span className="status-dot" /> YOUR PRIVATE STUDY SPACE</div>
      </div>
    </aside>
  );
}

function SideLink({ to, icon: Icon, label, end = false, onClick }) {
  return (
    <NavLink to={to} end={end} onClick={onClick} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}>
      <Icon size={17} strokeWidth={1.9} />
      <span>{label}</span>
    </NavLink>
  );
}

function Topbar({ query, onSearch, theme, onToggleTheme, onOpenMenu }) {
  return (
    <header className="topbar">
      <button className="mobile-menu-button icon-button" onClick={onOpenMenu} aria-label="Open navigation"><Menu size={20} /></button>
      <div className="breadcrumb"><span>LIBRARY</span><ChevronRight size={13} /><strong>MY LEARNING SPACE</strong></div>
      <div className="topbar-actions">
        <label className="global-search">
          <Search size={17} />
          <input value={query} onChange={(event) => onSearch(event.target.value)} placeholder="Search lessons..." aria-label="Search lessons" />
          <kbd>/</kbd>
          {query && <button className="search-clear" onClick={() => onSearch('')} aria-label="Clear search"><X size={14} /></button>}
        </label>
        <button className="icon-button theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <div className="avatar-mark" title="Your learning space">L</div>
      </div>
    </header>
  );
}

function Dashboard({ categories, lessons, completed, bookmarks, recent, availableCount }) {
  const completionRate = lessons.length ? Math.round((completed.length / lessons.length) * 100) : 0;
  const recentLessons = recent.map((id) => lessons.find((lesson) => lesson.id === id)).filter(Boolean).slice(0, 3);
  const featured = lessons.filter((lesson) => lesson.available).slice(0, 3);

  return (
    <>
      <div className="page-heading dashboard-heading">
        <div>
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR PERSONAL LEARNING SPACE</div>
          <h1>Make room for <span>curiosity.</span></h1>
          <p>A focused home for the courses, concepts, and skills you're building.</p>
        </div>
        <div className="heading-date"><span className="date-orb"><Compass size={17} /></span><span>YOUR KNOWLEDGE, YOUR PACE</span></div>
      </div>

      <MissingFilesNotice lessons={lessons} availableCount={availableCount} />

      <section className="hero-panel">
        <div className="hero-grid-lines" />
        <div className="hero-content">
          <div className="hero-kicker"><Sparkles size={14} /> A LIBRARY THAT GROWS WITH YOU</div>
          <h2>Learn a little.<br /><span>Understand a lot.</span></h2>
          <p>Bring your lessons together in one calm, searchable space. Pick a subject and keep moving forward.</p>
          <Link to="/all" className="button button-light">Explore all lessons <ArrowUpRight size={16} /></Link>
        </div>
        <div className="hero-art" aria-hidden="true">
          <div className="orbit orbit-one" /><div className="orbit orbit-two" />
          <div className="hero-book hero-book-back"><BookOpen size={37} /></div>
          <div className="hero-book hero-book-front"><GraduationCap size={43} /></div>
          <div className="hero-float float-one"><span className="float-dot" /> IDEA TO INSIGHT</div>
          <div className="hero-float float-two"><Sparkles size={14} /> KEEP EXPLORING</div>
        </div>
        <div className="hero-index">01 <span>/ 04</span></div>
      </section>

      <section className="stats-grid" aria-label="Library statistics">
        <StatCard label="TOTAL LESSONS" value={lessons.length} detail="Across your library" icon={BookOpen} tone="violet" />
        <StatCard label="SUBJECT AREAS" value={categories.length} detail="Topics to explore" icon={Layers} tone="blue" />
        <StatCard label="BOOKMARKED" value={bookmarks.length} detail="Saved for later" icon={Bookmark} tone="orange" />
        <StatCard label="COMPLETED" value={completed.length} detail={`${completionRate}% of your collection`} icon={CheckCircle2} tone="green" />
      </section>

      <section className="section-block">
        <SectionHeading eyebrow="BROWSE YOUR LIBRARY" title="Explore by subject" action={<Link to="/all" className="text-link">View all lessons <ArrowUpRight size={15} /></Link>} />
        <div className="category-grid">
          {categories.map((category, index) => (
            <CategoryCard key={category.id} category={category} lessons={lessons.filter((lesson) => lesson.categoryId === category.id)} index={index} />
          ))}
        </div>
      </section>

      <section className="section-block lower-section">
        <div className="section-column">
          <SectionHeading eyebrow="PICK UP WHERE YOU LEFT OFF" title="Recently opened" />
          {recentLessons.length ? (
            <div className="compact-list">{recentLessons.map((lesson) => <CompactLesson key={lesson.id} lesson={lesson} completed={completed.includes(lesson.id)} />)}</div>
          ) : (
            <EmptyState icon={Clock3} title="Your recent lessons will appear here" text="Open any available lesson and it will be easy to find next time." compact />
          )}
        </div>
        <div className="section-column focus-column">
          <SectionHeading eyebrow="YOUR LEARNING RHYTHM" title="Progress snapshot" />
          <div className="progress-card">
            <div className="progress-top"><div className="progress-emblem"><GraduationCap size={20} /></div><span className="progress-caption">COLLECTION PROGRESS</span><span className="progress-percent">{completionRate}%</span></div>
            <div className="progress-track"><span style={{ width: `${completionRate}%` }} /></div>
            <div className="progress-bottom"><span>{completed.length} completed</span><span>{Math.max(lessons.length - completed.length, 0)} to explore</span></div>
            <Link to="/completed" className="progress-link">See completed lessons <ArrowUpRight size={14} /></Link>
          </div>
        </div>
      </section>

      {featured.length > 0 && <section className="section-block"><SectionHeading eyebrow="READY TO OPEN" title="Available now" action={<Link to="/all" className="text-link">Browse library <ArrowUpRight size={15} /></Link>} /><div className="lesson-grid">{featured.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} completed={completed.includes(lesson.id)} bookmarked={bookmarks.includes(lesson.id)} />)}</div></section>}
    </>
  );
}

function MissingFilesNotice({ lessons, availableCount }) {
  const missing = lessons.length - availableCount;
  if (!missing) return null;
  return (
    <div className="setup-notice">
      <div className="setup-icon"><FileCode2 size={18} /></div>
      <div><strong>{availableCount ? `${availableCount} lessons ready · ${missing} still need their files` : 'Your lesson catalog is ready'}</strong><p>Copy your original HTML files into the project's <code>lessons/</code> folder, then run the app or push to GitHub.</p></div>
      <span className="setup-count">{missing} <small>missing</small></span>
    </div>
  );
}

function StatCard({ label, value, detail, icon: Icon, tone }) {
  return <div className="stat-card"><div className={`stat-icon stat-${tone}`}><Icon size={18} /></div><div className="stat-label">{label}</div><div className="stat-value">{value.toString().padStart(2, '0')}</div><div className="stat-detail">{detail}</div></div>;
}

function SectionHeading({ eyebrow, title, action }) {
  return <div className="section-heading"><div><div className="eyebrow small-eyebrow">{eyebrow}</div><h2>{title}</h2></div>{action}</div>;
}

function CategoryCard({ category, lessons, index = 0 }) {
  const Icon = ICONS[category.icon] || FolderOpen;
  const ready = lessons.filter((lesson) => lesson.available).length;
  return (
    <Link to={`/category/${category.id}`} className={`category-card accent-border-${category.accent}`}>
      <div className="category-card-top"><span className={`category-symbol accent-${category.accent}`}><Icon size={19} /></span><span className="category-index">{String(index + 1).padStart(2, '0')}</span></div>
      <h3>{category.title}</h3>
      <p>{category.description}</p>
      <div className="category-card-bottom"><span>{lessons.length} {lessons.length === 1 ? 'lesson' : 'lessons'}</span><span className="category-ready">{ready} ready</span><ArrowUpRight size={16} /></div>
    </Link>
  );
}

function LibraryPage({ lessons, categories, completed, bookmarks, query, title, description }) {
  const filtered = useMemo(() => filterLessons(lessons, query), [lessons, query]);
  return (
    <>
      <PageTitle eyebrow="THE COMPLETE COLLECTION" title={title} description={description} count={`${filtered.length} LESSONS`} />
      <MissingFilesNotice lessons={lessons} availableCount={lessons.filter((lesson) => lesson.available).length} />
      {query && <div className="result-note">Showing results for <strong>“{query}”</strong> <span>{filtered.length} found</span></div>}
      {filtered.length ? <div className="lesson-grid">{filtered.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} completed={completed.includes(lesson.id)} bookmarked={bookmarks.includes(lesson.id)} />)}</div> : <EmptyState icon={Search} title="No lessons found" text="Try another title, subject, or keyword." />}
      <div className="collection-footnote"><Tag size={14} /> Lessons are grouped using their file names and folder locations. You can refine this catalog as it grows.</div>
    </>
  );
}

function CategoryPage({ categories, lessons, completed, bookmarks, query }) {
  const { categoryId } = useParams();
  const category = categories.find((item) => item.id === categoryId);
  const filtered = useMemo(() => filterLessons(lessons.filter((lesson) => lesson.categoryId === categoryId), query), [lessons, categoryId, query]);
  if (!category) return <NotFound />;
  const Icon = ICONS[category.icon] || FolderOpen;
  const grouped = Object.entries(filtered.reduce((groups, lesson) => {
    const key = lesson.subcategory || 'Other';
    groups[key] ||= [];
    groups[key].push(lesson);
    return groups;
  }, {}));
  return (
    <>
      <div className="category-hero">
        <Link to="/all" className="back-link"><ArrowLeft size={14} /> ALL LESSONS</Link>
        <div className={`category-hero-icon accent-${category.accent}`}><Icon size={25} /></div>
        <div className="eyebrow small-eyebrow">SUBJECT COLLECTION</div>
        <h1>{category.title}</h1>
        <p>{category.description}</p>
        <div className="category-hero-meta"><span>{filtered.length} lessons</span><span>·</span><span>{filtered.filter((lesson) => lesson.available).length} available</span></div>
      </div>
      {grouped.length ? grouped.map(([group, groupLessons]) => (
        <section className="section-block category-group" key={group}>
          <SectionHeading eyebrow="TOPIC" title={group} />
          <div className="lesson-grid">{groupLessons.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} completed={completed.includes(lesson.id)} bookmarked={bookmarks.includes(lesson.id)} />)}</div>
        </section>
      )) : <EmptyState icon={Search} title="No matching lessons" text="Try clearing your search to see every lesson in this subject." />}
    </>
  );
}

function CollectionPage({ lessons, completed, bookmarks, kind }) {
  const isBookmarks = kind === 'bookmarks';
  const selectedIds = isBookmarks ? bookmarks : completed;
  const items = selectedIds.map((id) => lessons.find((lesson) => lesson.id === id)).filter(Boolean);
  return (
    <>
      <PageTitle eyebrow={isBookmarks ? 'SAVED FOR LATER' : 'YOUR LEARNING HISTORY'} title={isBookmarks ? 'Bookmarks' : 'Completed lessons'} description={isBookmarks ? 'A shortlist of lessons you want to return to.' : 'A record of the lessons you have marked as complete.'} count={`${items.length} SAVED`} />
      {items.length ? <div className="lesson-grid">{items.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} completed={completed.includes(lesson.id)} bookmarked={bookmarks.includes(lesson.id)} />)}</div> : <EmptyState icon={isBookmarks ? Bookmark : CheckCircle2} title={isBookmarks ? 'Nothing bookmarked yet' : 'No completed lessons yet'} text={isBookmarks ? 'Save a lesson with the bookmark icon and it will appear here.' : 'Mark a lesson as complete from its lesson page to track your progress.'} />}
    </>
  );
}

function PageTitle({ eyebrow, title, description, count }) {
  return <div className="page-title-row"><div><div className="eyebrow"><span className="eyebrow-line" />{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{count && <div className="page-count">{count}</div>}</div>;
}

function filterLessons(lessons, query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return lessons;
  return lessons.filter((lesson) => [lesson.title, lesson.filename, lesson.categoryId, lesson.subcategory, lesson.language].join(' ').toLowerCase().includes(normalized));
}

function LessonCard({ lesson, completed, bookmarked }) {
  const categoryIcon = (lesson.categoryId || '').includes('math') ? Calculator : (lesson.categoryId || '').includes('python') ? Code2 : (lesson.categoryId || '').includes('cyber') ? ShieldCheck : (lesson.categoryId || '').includes('ai') ? Brain : FileText;
  const Icon = categoryIcon;
  return (
    <Link to={`/lesson/${lesson.id}`} className={`lesson-card ${!lesson.available ? 'lesson-unavailable' : ''}`}>
      <div className="lesson-card-top"><span className="file-type"><Icon size={17} /></span><span className={`availability ${lesson.available ? 'available' : 'missing'}`}><i />{lesson.available ? 'READY' : 'ADD FILE'}</span></div>
      <div className="lesson-card-body"><div className="lesson-category">{lesson.subcategory || 'LESSON'}</div><h3>{lesson.title}</h3><div className="lesson-filename">{lesson.filename}</div></div>
      <div className="lesson-card-bottom"><span className="lesson-language">{lesson.language || 'English'}</span><span className="lesson-card-status">{completed && <span className="mini-status complete"><Check size={11} /> DONE</span>}{bookmarked && <span className="mini-status saved"><Bookmark size={10} /> SAVED</span>}</span><span className="card-arrow"><ArrowUpRight size={16} /></span></div>
    </Link>
  );
}

function CompactLesson({ lesson, completed }) {
  return <Link to={`/lesson/${lesson.id}`} className="compact-lesson"><div className="compact-file"><FileText size={17} /></div><div className="compact-copy"><strong>{lesson.title}</strong><span>{lesson.subcategory}</span></div>{completed ? <CheckCircle2 size={17} className="compact-done" /> : <ChevronRight size={17} className="compact-chevron" />}</Link>;
}

function EmptyState({ icon: Icon, title, text, compact = false }) {
  return <div className={`empty-state ${compact ? 'empty-compact' : ''}`}><div className="empty-icon"><Icon size={21} /></div><strong>{title}</strong><p>{text}</p></div>;
}

function LessonViewer({ lessons, completed, bookmarks, toggleBookmark, toggleCompleted, recordRecent }) {
  const { lessonId } = useParams();
  const lesson = lessons.find((item) => item.id === lessonId);
  const isCompleted = lesson ? completed.includes(lesson.id) : false;
  const isBookmarked = lesson ? bookmarks.includes(lesson.id) : false;

  useEffect(() => {
    if (lesson?.available) recordRecent(lesson.id);
  }, [lesson?.id, lesson?.available]);

  if (!lesson) return <NotFound />;
  return (
    <div className="viewer-page">
      <Link to={lesson.categoryId ? `/category/${lesson.categoryId}` : '/all'} className="back-link"><ArrowLeft size={14} /> BACK TO LIBRARY</Link>
      <div className="viewer-heading">
        <div className="viewer-heading-copy"><div className="eyebrow small-eyebrow">{lesson.subcategory || 'LESSON'} · {lesson.language || 'ENGLISH'}</div><h1>{lesson.title}</h1><p>{lesson.filename}</p></div>
        <div className="viewer-actions">
          <button className={`button button-secondary ${isBookmarked ? 'button-selected' : ''}`} onClick={() => toggleBookmark(lesson.id)}><Bookmark size={15} fill={isBookmarked ? 'currentColor' : 'none'} />{isBookmarked ? 'Saved' : 'Save'}</button>
          <button className={`button ${isCompleted ? 'button-completed' : 'button-primary'}`} onClick={() => toggleCompleted(lesson.id)}>{isCompleted ? <CheckCircle2 size={15} /> : <Check size={15} />}{isCompleted ? 'Completed' : 'Mark complete'}</button>
        </div>
      </div>
      {lesson.available ? (
        <div className="lesson-frame-wrap">
          <div className="frame-toolbar"><span><i className="frame-live-dot" /> ORIGINAL HTML LESSON</span><a href={lesson.path} target="_blank" rel="noreferrer">Open in new tab <ExternalLink size={13} /></a></div>
          <iframe className="lesson-frame" src={lesson.path} title={lesson.title} />
        </div>
      ) : (
        <div className="missing-lesson-panel">
          <div className="missing-lesson-icon"><FileCode2 size={27} /></div>
          <div className="eyebrow small-eyebrow">LESSON FILE NOT FOUND</div>
          <h2>This lesson is in your catalog, but its HTML file isn't in the project yet.</h2>
          <p>Copy the original file into the root <code>lessons/</code> folder. Keep the file name unchanged:</p>
          <div className="missing-path"><FileText size={16} /><code>{lesson.filename}</code></div>
          <Link to="/all" className="button button-primary">Back to all lessons <ArrowUpRight size={15} /></Link>
        </div>
      )}
    </div>
  );
}

function NotFound() {
  return <div className="not-found"><div className="empty-icon"><Search size={22} /></div><div className="eyebrow small-eyebrow">PAGE NOT FOUND</div><h1>This page wandered off.</h1><p>The page you're looking for doesn't exist in this library.</p><Link to="/" className="button button-primary">Return to overview <ArrowUpRight size={15} /></Link></div>;
}

export default App;
