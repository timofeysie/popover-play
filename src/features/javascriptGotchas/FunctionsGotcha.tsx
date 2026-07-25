import styles from "./javascriptGotchas.module.css";
import { ExpandableAnswer } from "./ExpandableAnswer";

function regularOuterHandler(this: unknown) {
  return this;
}

// Simulate what addEventListener does: call the handler with `this` bound
// to the element it's attached to.
const simulatedButton = { tagName: "BUTTON" };
const outerThisB = regularOuterHandler.call(simulatedButton);

function regularInnerCallback(this: unknown) {
  return this;
}

// forEach invokes its callback as a plain function call (no thisArg),
// same as calling it with no receiver at all.
const innerThisB = regularInnerCallback();

export function FunctionsGotcha() {
  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>4. Functions</h2>
      <p className={styles.lead}>
        Arrow functions and <b>function</b> expressions aren&apos;t just two
        spellings of the same thing — they bind <b>this</b> differently.
      </p>

      <div className={styles.questionBanner}>
        <h3 className={styles.questionLabel}>Interview Question</h3>
        <p className={styles.questionText}>
          What&apos;s the difference between Implementation A and
          Implementation B?
        </p>
      </div>

      <pre className={styles.codeBlock}>
        <code>
          <span className={styles.codeKeyword}>const</span>
          {" button = document.querySelector("}
          <span className={styles.codeString}>{"'button'"}</span>
          {");\n"}
          <span className={styles.codeKeyword}>const</span>
          {" items = ["}
          <span className={styles.codeString}>{"'item1'"}</span>
          {", "}
          <span className={styles.codeString}>{"'item2'"}</span>
          {", "}
          <span className={styles.codeString}>{"'item3'"}</span>
          {"];\n\n"}
          <span className={styles.codeComment}>{"// Implementation A"}</span>
          {"\n"}
          {"button.addEventListener("}
          <span className={styles.codeString}>{"'click'"}</span>
          {", () => {\n"}
          {"  items.forEach(item => {\n"}
          {"    console.log(item);\n"}
          {"  });\n"}
          {"});\n\n"}
          <span className={styles.codeComment}>{"// Implementation B"}</span>
          {"\n"}
          {"button.addEventListener("}
          <span className={styles.codeString}>{"'click'"}</span>
          {", "}
          <span className={styles.codeKeyword}>function</span>
          {"() {\n"}
          {"  items.forEach("}
          <span className={styles.codeKeyword}>function</span>
          {"(item) {\n"}
          {"    console.log(item);\n"}
          {"  });\n"}
          {"});"}
        </code>
      </pre>

      <div className={styles.result}>
        <span className={styles.label}>
          Do A and B behave the same way?
        </span>
      </div>

      <ExpandableAnswer title="Show answer">
        <ul>
          <li>
            As written, yes — both log <b>&quot;item1&quot;</b>,{" "}
            <b>&quot;item2&quot;</b>, <b>&quot;item3&quot;</b> when clicked.
            Neither implementation reads <code className={styles.inlineCode}>this</code>,
            so the outputs are identical.
          </li>
          <li>
            The real difference is what <code className={styles.inlineCode}>this</code>{" "}
            would resolve to inside each callback, and it&apos;s a common
            source of bugs the moment either implementation starts using{" "}
            <code className={styles.inlineCode}>this</code>.
          </li>
          <li>
            <b>Implementation A</b> uses arrow functions everywhere. Arrow
            functions have no <code className={styles.inlineCode}>this</code>{" "}
            of their own — both the outer handler and the nested{" "}
            <code className={styles.inlineCode}>forEach</code> callback
            inherit <code className={styles.inlineCode}>this</code> from the
            surrounding lexical scope, no matter how they&apos;re invoked.
          </li>
          <li>
            <b>Implementation B</b> uses <code className={styles.inlineCode}>function</code>{" "}
            expressions. Each one gets its own{" "}
            <code className={styles.inlineCode}>this</code>, determined by
            how it&apos;s called — not where it&apos;s written.
          </li>
        </ul>

        <div className={styles.example}>
          <div className={styles.solutionContainer}>
            <h3 className={styles.solutionTitle}>Implementation B, outer</h3>
            <span className={styles.solutionSubtitle}>
              addEventListener calls the handler with this = the element
            </span>
          </div>
          <div className={styles.result}>
            <span className={styles.label}>this</span>
            <span className={styles.value}>{JSON.stringify(outerThisB)}</span>
          </div>
        </div>

        <div className={styles.example}>
          <div className={styles.solutionContainer}>
            <h3 className={styles.solutionTitle}>Implementation B, inner</h3>
            <span className={styles.solutionSubtitle}>
              forEach calls its callback with no thisArg
            </span>
          </div>
          <div className={styles.result}>
            <span className={styles.label}>this</span>
            <span className={styles.value}>{String(innerThisB)}</span>
          </div>
        </div>

        <div className={styles.infoBox}>
          <h4 className={styles.infoBoxHeader}>The nested-callback gotcha</h4>
          <p className={styles.infoBoxBody}>
            In Implementation B, the outer handler&apos;s{" "}
            <code className={styles.inlineCode}>this</code> is the button —
            but that binding does <b>not</b> carry into the nested{" "}
            <code className={styles.inlineCode}>forEach</code> callback,
            because <code className={styles.inlineCode}>forEach</code> invokes
            it as a plain function call. In Implementation A, the arrow
            function&apos;s lexical <code className={styles.inlineCode}>this</code>{" "}
            carries through every level of nesting automatically, which is
            exactly why arrow functions are the default choice for callbacks
            today.
          </p>
        </div>
      </ExpandableAnswer>
    </section>
  );
}
