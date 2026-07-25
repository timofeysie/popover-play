import styles from "./javascriptGotchas.module.css";
import { ArraysGotcha } from "./ArraysGotcha";
import { FunctionsGotcha } from "./FunctionsGotcha";

const useToFixed = (0.1 + 0.2).toFixed(2) === "0.30";

function runObjectReferenceExamples() {
  const person = { name: "John" };
  const people = [person];
  person.name = "Jane";
  const viaArray = people[0].name;

  const newPerson = { ...person };
  person.name = "Bob";
  const viaCopy = newPerson.name;

  return { viaArray, viaCopy };
}

const { viaArray, viaCopy } = runObjectReferenceExamples();

export function JavascriptGotchasDemo() {
  return (
    <div className={styles.page}>
      <main className={styles.container}>
        <header className={styles.hero}>
          <h1 className={styles.title}>JavaScript Gotchas</h1>
          <p className={styles.subtitle}>
            Things that surprise even experienced developers.
          </p>
        </header>

        <div className={styles.masonry}>
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>1. Float Rounding Errors</h2>
          <pre className={styles.code}>(0.1 + 0.2 === 0.3) // false</pre>

          <div className={styles.solutionContainer}>
            <h3 className={styles.solutionTitle}>Solution 1</h3>
            <span className={styles.solutionSubtitle}>
              Use <b>toFixed()</b>
            </span>
          </div>
          <div className={styles.result}>
            <span className={styles.label}>Result</span>
            <span className={styles.value}>
              {`(0.1 + 0.2).toFixed(2) === "0.30" = ${useToFixed}`}
            </span>
          </div>

          <div className={styles.solutionContainer}>
            <h3 className={styles.solutionTitle}>Solution 2</h3>
            <span className={styles.solutionSubtitle}>
              Multiply by power of 10 to work with integers
            </span>
          </div>
          <div className={styles.result}>
            <span className={styles.label}>Result</span>
            <span className={styles.value}>
              (0.1 * 10 + 0.2 * 10) / 10 === 0.3
            </span>
          </div>
        </section>

        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>2. Objects</h2>
          <p className={styles.lead}>
            An Object is used to store a collection of data.
          </p>

          <div className={styles.questionBanner}>
            <h3 className={styles.questionLabel}>Interview Question</h3>
            <p className={styles.questionText}>
              Object References — What will be logged and why?
            </p>
          </div>

          <div className={styles.example}>
            <div className={styles.solutionContainer}>
              <h3 className={styles.solutionTitle}>Example 1</h3>
              <span className={styles.solutionSubtitle}>
                Same object, shared reference
              </span>
            </div>
            <pre className={styles.codeBlock}>
              <code>
                <span className={styles.codeKeyword}>const</span>
                {" person = { name: "}
                <span className={styles.codeString}>{"'John'"}</span>
                {" };\n"}
                <span className={styles.codeKeyword}>const</span>
                {" people = [person];\n"}
                {"person.name = "}
                <span className={styles.codeString}>{"'Jane'"}</span>
                {";\n"}
                {"console.log(people[0].name); "}
                <span className={styles.codeComment}>
                  {`// "${viaArray}"`}
                </span>
              </code>
            </pre>
            <div className={styles.result}>
              <span className={styles.label}>Logged</span>
              <span className={styles.value}>{`"${viaArray}"`}</span>
            </div>
            <div className={styles.answer}>
              <h4 className={styles.answerHeader}>
                Answer — Reference behavior
              </h4>
              <div className={styles.answerBody}>
                <ul>
                  <li>
                    The array contains a <b>reference</b> to the same object
                  </li>
                  <li>
                    Modifying the original object affects what we see through
                    the array
                  </li>
                  <li>
                    Therefore <b>people[0].name</b> shows{" "}
                    <b>&quot;Jane&quot;</b>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.example}>
            <div className={styles.solutionContainer}>
              <h3 className={styles.solutionTitle}>Example 2</h3>
              <span className={styles.solutionSubtitle}>
                Spread creates a shallow copy
              </span>
            </div>
            <pre className={styles.codeBlock}>
              <code>
                <span className={styles.codeKeyword}>const</span>
                {" newPerson = { ...person };\n"}
                {"person.name = "}
                <span className={styles.codeString}>{"'Bob'"}</span>
                {";\n"}
                {"console.log(newPerson.name); "}
                <span className={styles.codeComment}>
                  {`// "${viaCopy}"`}
                </span>
              </code>
            </pre>
            <div className={styles.result}>
              <span className={styles.label}>Logged</span>
              <span className={styles.value}>{`"${viaCopy}"`}</span>
            </div>
            <div className={styles.answer}>
              <h4 className={styles.answerHeader}>
                Answer — Shallow copying
              </h4>
              <div className={styles.answerBody}>
                <ul>
                  <li>
                    Spread operator creates a <b>new object</b> with copied
                    values
                  </li>
                  <li>
                    Changes to the original no longer affect the copy
                  </li>
                  <li>
                    Therefore <b>newPerson.name</b> remains{" "}
                    <b>&quot;Jane&quot;</b>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className={styles.keyConcept}>
            <h4 className={styles.keyConceptHeader}>Key concept</h4>
            <p className={styles.keyConceptBody}>
              Objects are passed by reference, but the spread operator creates
              a shallow copy.
            </p>
          </div>
        </section>

        <ArraysGotcha />
        <FunctionsGotcha />
        </div>
      </main>
    </div>
  );
}
