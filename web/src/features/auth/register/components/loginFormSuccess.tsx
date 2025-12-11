import { CircleCheck } from "lucide-react";
type RegisterFormErrorProps = {
  message: string;
};

export default function FormSuccess({ message }: RegisterFormErrorProps) {
  if (!message) return null;
  return (
    <div className="bg-emerald-500/15 p-3  dark:bg-emerald-500 dark:text-white rounded-md flex items-center gap-x-2 text-sm text-emerald-700">
      <CircleCheck className="h-4 w-4 " />
      <p>{message}</p>
    </div>
  );
}
