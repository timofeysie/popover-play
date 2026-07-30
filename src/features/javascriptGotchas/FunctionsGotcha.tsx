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

      <ExpandableAnswer title="Show answer">
        The main difference between the two implementations is how this is handled inside the event handler:
        <ul>
          <li>Arrow functions: this is lexically inherited from the surrounding scope (where the arrow function is defined).</li>
          <li>Function expressions: this is dynamically set based on how the function is called (in event handlers, it refers to the element the event is bound to).</li>
        </ul>
      </ExpandableAnswer>

    <p>&nbsp;</p>
      <div className={styles.questionBanner}>
        <h3 className={styles.questionLabel}>Interview Question</h3>
        <p className={styles.questionText}>
          What hidden issues might appear in a real-world application?
        </p>
      </div>





      <ExpandableAnswer title="Show answer">
      <h4><b>Hidden Issue</b></h4>
        <p>If you need to access the button element via this inside the event handler, Implementation A (arrow function) will not work as expected.</p>
        <ul>
          <li>In Implementation A (arrow function), this inside the handler does NOT refer to the button element. It refers to the outer scope (likely window or whatever the surrounding context is).</li>
          <li>In Implementation B (function expression), this inside the handler refers to the button element, as expected for DOM event handlers.</li>
        </ul>
      </ExpandableAnswer>
    </section>
  );
}
