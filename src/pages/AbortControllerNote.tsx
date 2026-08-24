import { NoteDocument } from "@/features/notes";
import content from "../../docs/AbortController.md?raw";

export default function AbortControllerNote() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <NoteDocument content={content} />
    </div>
  );
}
