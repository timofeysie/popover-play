import { Menu, X, Code2 } from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const exercises = [
  { title: "Native Popover", path: "/", active: true },
  { title: "Dialog Element", path: "/dialog", active: false },
  { title: "CSS Nesting", path: "/css-nesting", active: false },
  { title: "View Transitions", path: "/view-transitions", active: false },
];

const Index = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Code2 className="w-6 h-6 text-primary" />
          <h1 className="text-lg font-bold tracking-tight">
            Code<span className="text-primary">Lab</span>
          </h1>
        </div>
        <button
          popoverTarget="navigation"
          popoverTargetAction="show"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-medium text-sm hover:opacity-90 transition-opacity"
        >
          <Menu className="w-4 h-4" />
          Exercises
        </button>
      </header>

      {/* Native Popover Side Panel */}
      <nav popover="auto" id="navigation" className="z-50">
        <div className="p-6 h-full flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-lg font-bold text-foreground">Exercises</h2>
            <button
              popoverTarget="navigation"
              popoverTargetAction="hide"
              className="p-2 rounded-lg hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>
          <ul className="space-y-2 flex-1">
            {exercises.map((ex) => (
              <li key={ex.title}>
                <button
                  popoverTarget="navigation"
                  popoverTargetAction="hide"
                  onClick={() => ex.active && navigate(ex.path)}
                  className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    location.pathname === ex.path
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  }`}
                >
                  {ex.title}
                  {!ex.active && (
                    <span className="ml-2 text-xs opacity-50">Coming soon</span>
                  )}
                </button>
              </li>
            ))}
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
