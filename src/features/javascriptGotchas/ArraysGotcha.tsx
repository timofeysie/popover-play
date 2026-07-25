import styles from "./javascriptGotchas.module.css";
import { ExpandableAnswer } from "./ExpandableAnswer";

function runArrayShallowCopyExample() {
  const arr1 = [1, 2, [3, 4]];
  const arr2 = [...arr1];
  arr1[2][0] = "x";
  return arr2[2][0];
}

const loggedValue = runArrayShallowCopyExample();

export function ArraysGotcha() {
  return (
    <section className={styles.card}>
      <h2 className={styles.sectionTitle}>3. Arrays</h2>
      <p className={styles.lead}>
        An Array is used to store an ordered list of values.
      </p>

      <div className={styles.questionBanner}>
        <h3 className={styles.questionLabel}>Interview Question</h3>
        <p className={styles.questionText}>Arrays</p>
      </div>

      <pre className={styles.codeBlock}>
        <code>
          <span className={styles.codeKeyword}>const</span>
          {" arr1 = [1, 2, [3, 4]];\n"}
          <span className={styles.codeKeyword}>const</span>
          {" arr2 = [...arr1];\n"}
          {"arr1[2][0] = "}
          <span className={styles.codeString}>{"'x'"}</span>
          {";\n"}
          {"console.log(arr2[2][0]);"}
        </code>
      </pre>

      <div className={styles.result}>
        <span className={styles.label}>
          What&apos;s the output and why?
        </span>
      </div>

      <ExpandableAnswer
        title="Show answer"
        answer={
          <>
            <span className={styles.label}>Logged</span>
            <span className={styles.value}>{`"${loggedValue}"`}</span>
          </>
        }
      >
        <ul>
          <li>Spread operator performs a <b>shallow copy</b></li>
          <li>Nested arrays are still referenced, not copied</li>
          <li>Modifying the nested array in the original affects the copy</li>
          <li>
            For deep copying, use{" "}
            <code className={styles.inlineCode}>
              JSON.parse(JSON.stringify())
            </code>{" "}
            or <code className={styles.inlineCode}>structuredClone()</code>
          </li>
        </ul>

        <div className={styles.infoBox}>
          <h4 className={styles.infoBoxHeader}>structuredClone()</h4>
          <p className={styles.infoBoxBody}>
            Standardized in <b>2021</b> as a global Web API in the HTML Living
            Standard — not part of core ECMAScript. It deep-copies values using
            the structured clone algorithm and landed in browsers and Node.js
            17+ from late 2021 onward.
          </p>
        </div>
      </ExpandableAnswer>
    </section>
  );
}
