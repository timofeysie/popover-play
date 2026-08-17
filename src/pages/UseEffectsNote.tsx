import { NoteDocument } from "@/features/notes";
import content from "../../docs/react/useEffects.md?raw";

export default function UseEffectsNote() {
  return (
    <div className="px-6 py-8 max-w-3xl mx-auto">
      <NoteDocument content={content} />
    </div>
  );
}
