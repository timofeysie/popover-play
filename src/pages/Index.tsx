import { useState, useRef, useEffect } from "react";
import { Menu, X, Code2, NotebookText } from "lucide-react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";

const notes = [
  { title: "Code Quality and Maintainability", path: "/notes/code-quality-and-maintainability", active: true },
  { title: "Performance and Reliability", path: "/notes/performance-and-reliability", active: true },
  { title: "Security and Usability", path: "/notes/security-and-usability", active: true },
  { title: "Lint Rules as Guardrails", path: "/notes/lint-rules", active: true },
  { title: "Advanced useEffect", path: "/notes/use-effects", active: true },
  { title: "The App Version Error", path: "/notes/app-version", active: true },
  { title: "Working with Markdown", path: "/notes/working-with-markdown", active: true },
  { title: "Context Management", path: "/notes/context-management", active: true },
];

const exercises = [
  { title: "Native Popover", path: "/popover", active: true },
  { title: "Safe Area", path: "/safe-area", active: true },
  { title: "Isolation Property", path: "/isolation", active: true },
  { title: "Depth-First Search (DFS)", path: "/dfs", active: true },
  { title: "Breadth-First Search (BFS)", path: "/bfs", active: true },
  { title: "The Fish Stack Problem", path: "/fish-stack", active: true },
  { title: "Kth Smallest Element in a BST", path: "/kth-smallest-bst", active: true },
  { title: "Two Sum", path: "/two-sum", active: true },
  { title: "Sliding Window Maximum", path: "/sliding-window-maximum", active: true },
  { title: "JavaScript Gotchas", path: "/javascript-gotchas", active: true },
  { title: "Math Refresher: Quadratic Polynomials", path: "/math-refresher", active: true },
  { title: "Threshold Decay & Attention Limits", path: "/attention-limits", active: true },
  { title: "Mission Control Cargo Manifest (MCCM)", path: "/mccm", active: true },
  { title: "Queue Implementation", path: "/queue-implementation", active: false },
];

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const [notesOpen, setNotesOpen] = useState(false);
  const notesNavRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    const handler = () => setNavOpen(el.matches(":popover-open"));
    el.addEventListener("toggle", handler);
    return () => el.removeEventListener("toggle", handler);
  }, []);

  useEffect(() => {
    const el = notesNavRef.current;
    if (!el) return;
    const handler = () => setNotesOpen(el.matches(":popover-open"));
    el.addEventListener("toggle", handler);
    return () => el.removeEventListener("toggle", handler);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 className="hidden sm:block w-6 h-6 text-primary" aria-hidden="true" />
          <h1 className="text-lg font-bold tracking-tight flex items-baseline gap-1.5">
            <span>Code<span className="text-primary">Lab</span></span>
            <span className="text-xs font-normal text-muted-foreground">
              v{__APP_VERSION__}
            </span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
          </Link>
          <button
            popoverTarget="notes-navigation"
            popoverTargetAction="show"
            aria-controls="notes-navigation"
            aria-expanded={notesOpen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <NotebookText className="w-4 h-4" aria-hidden="true" />
            Notes
          </button>
          <button
            popoverTarget="navigation"
            popoverTargetAction="show"
            aria-controls="navigation"
            aria-expanded={navOpen}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
          >
            <Menu className="w-4 h-4" aria-hidden="true" />
            Exercises
          </button>
        </div>
      </header>

      {/* Notes Popover Side Panel */}
      <nav
        ref={notesNavRef}
        popover="auto"
        id="notes-navigation"
        aria-label="Notes"
        className="z-50"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground">Notes</h2>
            <button
              popoverTarget="notes-navigation"
              popoverTargetAction="hide"
              aria-label="Close notes panel"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
          <ul className="space-y-2 flex-1">
            {notes.map((note) => {
              const isCurrent =
                location.pathname === note.path || location.pathname.startsWith(`${note.path}/`);
              return (
                <li key={note.title}>
                  <button
                    popoverTarget="notes-navigation"
                    popoverTargetAction="hide"
                    onClick={() => note.active && navigate(note.path)}
                    aria-disabled={!note.active}
                    aria-current={isCurrent ? "page" : undefined}
                    className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      isCurrent
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {note.title}
                    {!note.active && (
                      <span className="ml-2 text-xs opacity-50" aria-hidden="true">Coming soon</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      {/* Native Popover Side Panel */}
      <nav
        ref={navRef}
        popover="auto"
        id="navigation"
        aria-label="Exercises"
        className="z-50"
      >
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground">Exercises</h2>
            <button
              popoverTarget="navigation"
              popoverTargetAction="hide"
              aria-label="Close navigation panel"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" aria-hidden="true" />
            </button>
          </div>
          <ul className="space-y-2 flex-1">
            {exercises.map((ex) => {
              const isCurrent =
                location.pathname === ex.path || location.pathname.startsWith(`${ex.path}/`);
              return (
              <li key={ex.title}>
                <button
                  popoverTarget="navigation"
                  popoverTargetAction="hide"
                  onClick={() => ex.active && navigate(ex.path)}
                  aria-disabled={!ex.active}
                  aria-current={isCurrent ? "page" : undefined}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isCurrent
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {ex.title}
                  {!ex.active && (
                    <span className="ml-2 text-xs opacity-50" aria-hidden="true">Coming soon</span>
                  )}
                </button>
              </li>
              );
            })}
          </ul>
          <p className="text-xs text-muted-foreground mt-auto pt-6 border-t border-border">
            This panel uses the native HTML Popover API — no JavaScript needed.
          </p>
        </div>
      </nav>

      {/* Page Content */}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Index;
