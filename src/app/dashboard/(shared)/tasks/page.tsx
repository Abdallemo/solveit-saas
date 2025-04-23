'use client'
import { Button } from "@/components/ui/button";
import TaskPostingEditor from "@/features/tasks/components/Tiptap";
import { useState } from "react";

export default function page() {
  const [inputValue,setInputValue] = useState<string>("")

  return (
    <div className="max-w-3xl mx-auto flex flex-col ">
      <h1>Task/Job posting Page</h1>

      <TaskPostingEditor inputValue={inputValue} setInputValue={setInputValue} />
    <div className="flex mt-3 justify-end">
    <Button variant={'success'}>Save</Button>

    </div>
    </div>
  );
}
