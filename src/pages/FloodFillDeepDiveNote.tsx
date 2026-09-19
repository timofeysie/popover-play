import { NoteDocument } from "@/features/notes";
import content from "../../docs/land-grab/flood-fill-implementation.md?raw";

export default function FloodFillDeepDiveNote() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <NoteDocument content={content} />
    </div>
  );
}
