import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="h-[80vh] flex justify-center items-center">
      <div className="bg-gray-100 w-fit px-2.5 rounded-xl border-gray-300 border text-gray-600 flex gap-1 items-center">
        <div className="animate-spin items-center flex">
          <Loader2 size={15} />
        </div>{" "}
        Checking up on your function call
      </div>
    </div>
  );
}
