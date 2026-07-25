import type { ReactNode } from "react";
import styles from "./javascriptGotchas.module.css";

interface ExpandableAnswerProps {
  title: string;
  answer?: ReactNode;
  children: ReactNode;
}

export function ExpandableAnswer({
  title,
  answer,
  children,
}: ExpandableAnswerProps) {
  return (
    <details className={styles.expandableAnswer}>
      <summary className={styles.expandableAnswerSummary}>
        <span className={styles.expandableAnswerLabel}>{title}</span>
        <span className={styles.expandableAnswerToggle} aria-hidden="true">
          +
        </span>
      </summary>
      <div className={styles.expandableAnswerBody}>
        {answer ? (
          <div className={styles.expandableAnswerResult}>{answer}</div>
        ) : null}
        {children}
      </div>
    </details>
  );
}
