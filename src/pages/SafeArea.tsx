import { BookOpen, Zap, ExternalLink, Smartphone } from "lucide-react";

const SafeArea = () => {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Exercise Header */}
      <div className="mb-10">
        <div className="flex items-center gap-2 text-sm text-primary font-medium mb-3">
          <Zap className="w-4 h-4" />
          Exercise 02
        </div>
        <h2 className="text-4xl font-bold tracking-tight mb-4 text-foreground">
          CSS env() Function & Safe Area Insets
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
          The <code className="text-foreground bg-muted px-1.5 py-0.5 rounded text-sm font-mono">env()</code> CSS function lets you use environment variables in CSS, similar to what you'd use in Node.js. The most practical use case is safe-area-inset variables that ensure your content isn't obscured by device-specific UI elements.
        </p>
        <br />
        <ul className="list-disc list-inside text-muted-foreground">
          <li>Display notches (iPhone)</li>
          <li>Rounded corners</li>
          <li>System navigation bars</li>
        </ul>
      </div>

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
              title: "Syntax",
              desc: "env(<environment-variable>, <fallback>)",
            },
            {
              step: "2",
              title: "Safe Area Variables",
              desc: "safe-area-inset-top, -right, -bottom, and -left",
            },
            {
              step: "3",
              title: "Fallback Value",
              desc: "In regular browsers, these variables equal zero, so fallbacks are important.",
            },
            {
              step: "4",
              title: "Use Cases",
              desc: "Perfect for PWAs and mobile-first designs with various device shapes.",
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

      {/* CSS Example */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">CSS Example</h3>
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-3 text-xs text-code-comment font-mono">styles.css</span>
          </div>
          <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
            <code>
              <span className="text-code-comment">{'/* Using env() with safe-area-inset variables */'}</span>{'\n'}
              <span className="text-code-tag">{'.container'}</span>
              <span className="text-code-foreground">{' {'}</span>{'\n'}
              <span className="text-code-keyword">{'  padding-top'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-foreground">{'env'}</span>
              <span className="text-code-foreground">{'('}</span>
              <span className="text-code-string">{'safe-area-inset-top'}</span>
              <span className="text-code-foreground">{', '}</span>
              <span className="text-code-string">{'20px'}</span>
              <span className="text-code-foreground">{');\n'}</span>
              <span className="text-code-keyword">{'  padding-right'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-foreground">{'env'}</span>
              <span className="text-code-foreground">{'('}</span>
              <span className="text-code-string">{'safe-area-inset-right'}</span>
              <span className="text-code-foreground">{', '}</span>
              <span className="text-code-string">{'20px'}</span>
              <span className="text-code-foreground">{');\n'}</span>
              <span className="text-code-keyword">{'  padding-bottom'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-foreground">{'env'}</span>
              <span className="text-code-foreground">{'('}</span>
              <span className="text-code-string">{'safe-area-inset-bottom'}</span>
              <span className="text-code-foreground">{', '}</span>
              <span className="text-code-string">{'20px'}</span>
              <span className="text-code-foreground">{');\n'}</span>
              <span className="text-code-keyword">{'  padding-left'}</span>
              <span className="text-code-foreground">{': '}</span>
              <span className="text-code-foreground">{'env'}</span>
              <span className="text-code-foreground">{'('}</span>
              <span className="text-code-string">{'safe-area-inset-left'}</span>
              <span className="text-code-foreground">{', '}</span>
              <span className="text-code-string">{'20px'}</span>
              <span className="text-code-foreground">{');\n'}</span>
              <span className="text-code-foreground">{'}'}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Tailwind Example */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 text-foreground">Tailwind CSS Example</h3>
        <div className="rounded-lg overflow-hidden border border-border">
          <div className="bg-code px-4 py-2 flex items-center gap-2 border-b border-border">
            <span className="w-3 h-3 rounded-full bg-destructive/60" />
            <span className="w-3 h-3 rounded-full bg-accent/60" />
            <span className="w-3 h-3 rounded-full bg-primary/60" />
            <span className="ml-3 text-xs text-code-comment font-mono">component.tsx</span>
          </div>
          <pre className="bg-code p-6 overflow-x-auto text-sm leading-relaxed font-mono">
            <code>
              <span className="text-code-comment">{'// Using env() in Tailwind classes'}</span>{'\n'}
              <span className="text-code-tag">{'<div'}</span>{'\n'}
              <span className="text-code-keyword">{'  className'}</span>
              <span className="text-code-foreground">{'='}</span>
              <span className="text-code-string">{'"pt-[env(safe-area-inset-top,20px)] '}</span>{'\n'}
              <span className="text-code-string">{'         pr-[env(safe-area-inset-right,20px)] '}</span>{'\n'}
              <span className="text-code-string">{'         pb-[env(safe-area-inset-bottom,20px)] '}</span>{'\n'}
              <span className="text-code-string">{'         pl-[env(safe-area-inset-left,20px)]"'}</span>{'\n'}
              <span className="text-code-tag">{'>'}</span>{'\n'}
              <span className="text-code-foreground">{'  Content here'}</span>{'\n'}
              <span className="text-code-tag">{'</div>'}</span>
            </code>
          </pre>
        </div>
      </section>

      {/* Live Demo */}
      <section className="mb-10">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-foreground">
          <Smartphone className="w-5 h-5 text-primary" />
          Live Demo
        </h3>
        <div className="bg-card border border-border rounded-lg p-6">
          <p className="text-sm text-muted-foreground mb-4">
            The demo below shows a container using safe-area-inset variables. On devices with notches or system UI, the padding will automatically adjust. In regular browsers, it falls back to the default value.
          </p>
          <div 
            className="bg-primary/10 border-2 border-primary/20 rounded-lg p-6"
            style={{
              paddingTop: 'env(safe-area-inset-top, 20px)',
              paddingRight: 'env(safe-area-inset-right, 20px)',
              paddingBottom: 'env(safe-area-inset-bottom, 20px)',
              paddingLeft: 'env(safe-area-inset-left, 20px)',
            }}
          >
            <div className="bg-card border border-border rounded p-4">
              <h4 className="font-semibold mb-2 text-foreground">Safe Area Container</h4>
              <p className="text-sm text-muted-foreground">
                This content respects safe area insets. On devices with notches or system UI, the padding adjusts automatically. In regular browsers, it uses the fallback value (20px).
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
                <div className="bg-muted rounded p-2 text-center">
                  <div className="font-mono text-muted-foreground">Top</div>
                  <div className="font-semibold text-foreground">env(safe-area-inset-top, 20px)</div>
                </div>
                <div className="bg-muted rounded p-2 text-center">
                  <div className="font-mono text-muted-foreground">Right</div>
                  <div className="font-semibold text-foreground">env(safe-area-inset-right, 20px)</div>
                </div>
                <div className="bg-muted rounded p-2 text-center">
                  <div className="font-mono text-muted-foreground">Bottom</div>
                  <div className="font-semibold text-foreground">env(safe-area-inset-bottom, 20px)</div>
                </div>
                <div className="bg-muted rounded p-2 text-center">
                  <div className="font-mono text-muted-foreground">Left</div>
                  <div className="font-semibold text-foreground">env(safe-area-inset-left, 20px)</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Use Cases callout */}
      <section className="bg-card border border-border rounded-lg p-6 flex items-start gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <ExternalLink className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h4 className="font-semibold mb-1 text-foreground">Perfect for PWAs</h4>
          <p className="text-sm text-muted-foreground">
            This is especially useful for Progressive Web Apps (PWAs) or mobile-first designs where you need to account for various device shapes and system UI elements like notches, rounded corners, and navigation bars.
          </p>
        </div>
      </section>
    </div>
  );
};

export default SafeArea;
