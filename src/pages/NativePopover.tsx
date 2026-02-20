import { BookOpen, Zap, ExternalLink } from "lucide-react";

const NativePopover = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Exercise Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 01
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          Native HTML Popover
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The Popover API lets you build real popups with just HTML and CSS. Menus, tooltips, side panels — all handled natively by the browser. No scripts required.
        </p>
      </div>

      {/* How it works */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-primary" />
          How it works
        </h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              step: "1",
              title: "Add popover",
              desc: 'Add the popover attribute to any element to make it a popover.',
            },
            {
              step: "2",
              title: "Set a target",
              desc: 'Use popovertarget on a button to link it to the popover by ID.',
            },
            {
              step: "3",
              title: "Control action",
              desc: 'Use popovertargetaction to show, hide, or toggle.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="bg-card border border-border rounded-lg p-5"
            >
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold mb-3">
                {item.step}
              </span>
              <h4 className="font-semibold mb-1 text-foreground">{item.title}</h4>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Code Example */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">HTML</h3>
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-3 text-xs text-code-comment font-mono">index.html</span>
          </div>
          <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
            <code>
              <span className="text-code-comment">{'<!-- Trigger button -->'}</span>{'\n'}
              <span className="text-code-tag">{'<button'}</span>
              <span className="text-code-keyword">{' popovertarget'}</span>
              <span className="text-code-foreground">{'='}</span>
              <span className="text-code-string">{'"navigation"'}</span>{'\n'}
              <span className="text-code-keyword">{'        popovertargetaction'}</span>
              <span className="text-code-foreground">{'='}</span>
              <span className="text-code-string">{'"show"'}</span>
              <span className="text-code-tag">{'>'}</span>{'\n'}
              <span className="text-code-foreground">{'  Click me'}</span>{'\n'}
              <span className="text-code-tag">{'</button>'}</span>{'\n\n'}
              <span className="text-code-comment">{'<!-- Popover panel -->'}</span>{'\n'}
              <span className="text-code-tag">{'<nav'}</span>
              <span className="text-code-keyword">{' popover'}</span>
              <span className="text-code-keyword">{' id'}</span>
              <span className="text-code-foreground">{'='}</span>
              <span className="text-code-string">{'"navigation"'}</span>
              <span className="text-code-tag">{'>'}</span>{'\n'}
              <span className="text-code-foreground">{'  '}</span>
              <span className="text-code-tag">{'<button'}</span>
              <span className="text-code-keyword">{' popovertarget'}</span>
              <span className="text-code-foreground">{'='}</span>
              <span className="text-code-string">{'"navigation"'}</span>{'\n'}
              <span className="text-code-keyword">{'          popovertargetaction'}</span>
              <span className="text-code-foreground">{'='}</span>
              <span className="text-code-string">{'"hide"'}</span>
              <span className="text-code-tag">{'>'}</span>{'\n'}
              <span className="text-code-foreground">{'    Close'}</span>{'\n'}
              <span className="text-code-foreground">{'  '}</span>
              <span className="text-code-tag">{'</button>'}</span>{'\n'}
              <span className="text-code-tag">{'</nav>'}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* CSS Example */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">CSS</h3>
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-3 text-xs text-code-comment font-mono">styles.css</span>
          </div>
          <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
            <code>
              <span className="text-code-tag">{'#navigation'}</span>
              <span className="text-code-foreground">{' {'}</span>{'\n'}
              <span className="text-code-keyword">{'  transform'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'translateX(200px)'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-keyword">{'  transition'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'transform 0.2s, opacity 0.2s, display 0.2s'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-keyword">{'  transition-behavior'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'allow-discrete'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-foreground">{'}'}</span>{'\n\n'}
              <span className="text-code-tag">{'#navigation'}</span>
              <span className="text-code-keyword">{':popover-open'}</span>
              <span className="text-code-foreground">{' {'}</span>{'\n'}
              <span className="text-code-keyword">{'  transform'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'translateX(0)'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-keyword">{'  opacity'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'1'}</span>
              <span className="text-code-foreground">{';\n\n'}</span>
              <span className="text-code-foreground">{'  '}</span>
              <span className="text-code-tag">{'@starting-style'}</span>
              <span className="text-code-foreground">{' {\n'}</span>
              <span className="text-code-keyword">{'    transform'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'translateX(200px)'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-keyword">{'    opacity'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'0'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-foreground">{'  }\n'}</span>
              <span className="text-code-foreground">{'}'}</span>{'\n\n'}
              <span className="text-code-tag">{'#navigation'}</span>
              <span className="text-code-keyword">{'::backdrop'}</span>
              <span className="text-code-foreground">{' {'}</span>{'\n'}
              <span className="text-code-keyword">{'  background'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-string">{'rgb(0 0 0 / 0.35)'}</span>
              <span className="text-code-foreground">{';\n'}</span>
              <span className="text-code-foreground">{'}'}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Live Demo callout */}
      <section className="bg-card border border-border rounded-lg p-6 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <ExternalLink className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold mb-1 text-foreground">Try it live</h4>
          <p className="text-sm text-muted-foreground">
            Click the <strong>"Exercises"</strong> button in the top-right corner to see the native popover side panel in action — animated with pure CSS transitions, no JavaScript.
          </p>
        </div>
      </section>
    </div>
  );
};

export default NativePopover;
