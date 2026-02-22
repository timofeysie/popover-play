import { BookOpen, Zap, AlertCircle, CheckCircle2 } from "lucide-react";

const IsolationProperty = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Exercise Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 03
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          CSS isolation: isolate
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          Have you ever added a <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">::before</code> background, set <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">z-index: -1</code>, and suddenly it vanishes behind the whole page? That happens when your element does not create its own stacking context.
        </p>
        <br />
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The fix is simple: <strong className="text-foreground">force a new stacking context</strong> with <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">isolation: isolate</code>.
        </p>
      </div>

      {/* The Problem */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
          <AlertCircle className="w-5 h-5 text-destructive" />
          The Problem
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 mb-4">
          <p className="text-muted-foreground mb-4">
            When you use <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">z-index: -1</code> on a pseudo-element, it can fall behind more than you expected if the parent element doesn't create its own stacking context. The pseudo-element gets pushed behind the entire page instead of just behind the card content.
          </p>
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="w-3 h-3 rounded-full bg-accent/60" />
              <span className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-3 text-xs text-code-comment font-mono">problem.css</span>
            </div>
            <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
              <code>
                <span className="text-code-comment">{'/* Without isolation - pseudo-element disappears */'}</span>{'\n'}
                <span className="text-code-tag">{'.card'}</span>
                <span className="text-code-foreground">{' {'}</span>{'\n'}
                <span className="text-code-keyword">{'  position'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'relative'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-foreground">{'}\n\n'}</span>
                <span className="text-code-tag">{'.card::before'}</span>
                <span className="text-code-foreground">{' {'}</span>{'\n'}
                <span className="text-code-keyword">{'  content'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'""'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-keyword">{'  position'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'absolute'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-keyword">{'  z-index'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'-1'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-foreground">{'}'}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
          <CheckCircle2 className="w-5 h-5 text-primary" />
          The Solution
        </h3>
        <div className="bg-card border border-border rounded-lg p-6 mb-4">
          <p className="text-muted-foreground mb-4">
            <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">isolation: isolate</code> tells the browser to treat the element as its own little world. So the <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">::before</code> layer stays behind the card content, but it does not fall behind the entire page.
          </p>
          <div className="rounded-lg overflow-hidden border border-border">
            <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
              <span className="w-3 h-3 rounded-full bg-destructive/60" />
              <span className="w-3 h-3 rounded-full bg-accent/60" />
              <span className="w-3 h-3 rounded-full bg-primary/60" />
              <span className="ml-3 text-xs text-code-comment font-mono">solution.css</span>
            </div>
            <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
              <code>
                <span className="text-code-comment">{'/* With isolation - creates new stacking context */'}</span>{'\n'}
                <span className="text-code-tag">{'.card'}</span>
                <span className="text-code-foreground">{' {'}</span>{'\n'}
                <span className="text-code-keyword">{'  position'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'relative'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-keyword">{'  isolation'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'isolate'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-foreground">{'}\n\n'}</span>
                <span className="text-code-tag">{'.card::before'}</span>
                <span className="text-code-foreground">{' {'}</span>{'\n'}
                <span className="text-code-keyword">{'  content'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'""'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-keyword">{'  position'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'absolute'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-keyword">{'  z-index'}</span>
                <span className="text-code-foreground">{': '}</span>
                <span className="text-code-string">{'-1'}</span>
                <span className="text-code-foreground">{';\n'}</span>
                <span className="text-code-foreground">{'}'}</span>
              </code>
            </pre>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
          <BookOpen className="w-5 h-5 text-primary" />
          How it works
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              step: "1",
              title: "Without isolation",
              desc: "Pseudo-element with z-index: -1 falls behind the entire page, not just the card.",
            },
            {
              step: "2",
              title: "With isolation: isolate",
              desc: "Creates a new stacking context, so the pseudo-element stays behind card content only.",
            },
            {
              step: "3",
              title: "No extra wrappers",
              desc: "No need for additional HTML elements or complex z-index ladders.",
            },
            {
              step: "4",
              title: "Clean solution",
              desc: "Just one property to fix the stacking context issue elegantly.",
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

      {/* Live Demo */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Live Demo</h3>
        <div className="space-y-6">
          {/* Problem Demo */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-destructive" />
              Without isolation (problem)
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              Without <code className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono">isolation: isolate</code>, a pseudo-element with <code className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono">z-index: -1</code> can fall behind the entire page. This demo simulates that behavior.
            </p>
            <div className="relative p-6 rounded-lg bg-background border-2 border-destructive/30">
              {/* Simulated pseudo-element background */}
              <div 
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20"
                style={{
                  position: 'absolute',
                  zIndex: -1,
                }}
              />
              <div className="relative">
                <h5 className="font-semibold mb-2 text-foreground">Card Content</h5>
                <p className="text-sm text-muted-foreground">
                  This card doesn't use <code className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono">isolation: isolate</code>. The background layer (simulating ::before) may not be properly contained.
                </p>
              </div>
            </div>
          </div>

          {/* Solution Demo */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h4 className="font-semibold mb-2 text-foreground flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              With isolation: isolate (solution)
            </h4>
            <p className="text-sm text-muted-foreground mb-4">
              With <code className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono">isolation: isolate</code>, the background stays behind the card content but doesn't fall behind the page. The stacking context is properly contained.
            </p>
            <div 
              className="relative p-6 rounded-lg bg-background border-2 border-primary/30"
              style={{
                isolation: 'isolate',
              }}
            >
              {/* Simulated pseudo-element background */}
              <div 
                className="absolute inset-0 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20"
                style={{
                  position: 'absolute',
                  zIndex: -1,
                }}
              />
              <div className="relative">
                <h5 className="font-semibold mb-2 text-foreground">Card Content</h5>
                <p className="text-sm text-muted-foreground">
                  This card uses <code className="text-foreground bg-muted px-1 py-0.5 rounded text-xs font-mono">isolation: isolate</code>. The background layer (simulating ::before) is properly contained within the card's stacking context.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Key Takeaway */}
      <section className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h4 className="font-semibold mb-1 text-foreground">Key Takeaway</h4>
            <p className="text-sm text-muted-foreground">
              <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">isolation: isolate</code> creates a new stacking context without any side effects. No extra wrappers, no weird z-index ladder—just one clean property that tells the browser to treat your element as its own little world.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default IsolationProperty;
