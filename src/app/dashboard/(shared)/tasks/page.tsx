import { Button } from "@/components/ui/button";
import TaskPostingEditor from "@/features/tasks/components/Tiptap";

export default function page() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col ">
      <h1>Task/Job posting Page</h1>

      <TaskPostingEditor />
    <div className="flex mt-3 justify-end">
    <Button variant={'success'}>Save</Button>

    </div>
    </div>
  );
}
