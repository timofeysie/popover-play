import { NoteDocument } from "@/features/notes";
import content from "../../docs/react/ai-flaws/Security and Usability.md?raw";

export default function SecurityUsabilityNote() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <NoteDocument content={content} />
    </div>
  );
}
