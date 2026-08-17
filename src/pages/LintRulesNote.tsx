import { NoteDocument } from "@/features/notes";
import content from "../../docs/ml-for-devs/lint-rules.md?raw";

export default function LintRulesNote() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <NoteDocument content={content} />
    </div>
  );
}
