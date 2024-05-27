import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import ShareUrl from "./share-url";
import Link from "next/link";
import { twMerge } from "tailwind-merge";
import { Button, buttonVariants } from "./ui/button";
import { toast } from "sonner";

type Props = {
  setFile: React.Dispatch<React.SetStateAction<File | undefined>>;
  file: File;
};

export default function AudioSubmit({ setFile, file }: Props) {
  const [submitted, setSubmitted] = useState(false);
  const [open, setOpen] = useState(false);
  const [call_id, setCall_id] = useState("");

  async function submitAudio() {
    const formData = new FormData();
    formData.append("file", file);
    const promise = () =>
      fetch(
        `https://kuluruvineeth--whisper-v3-demo-yt-entrypoint.modal.run/transcribe`,
        {
          method: "POST",
          body: formData,
        }
      ).then((response) => response.json());

    toast.promise(promise, {
      loading: "Sending your file to the server",
      success: (data) => {
        setOpen(true);
        setCall_id(data);
        return "Received call id: " + data;
      },
      error: "Failed to send file",
    });
  }

  return (
    <>
      <Dialog open={open}>
        <DialogContent>
          <DialogHeader className="text-left">
            <DialogTitle>Successfully Sent File !</DialogTitle>
            <DialogDescription>
              The transcription will be available at this link. You can go there
              right now ot check back later.
              <div className="max-w-[325px] sm:max-w-[450px] w-full">
                <ShareUrl host={window.location.href} call_id={call_id} />
              </div>
            </DialogDescription>
            <DialogFooter>
              <div className="flex gap-2 justify-end mt-2">
                <Link
                  href={`/tryit/${call_id}`}
                  className={twMerge(buttonVariants(), "w-fit")}
                >
                  Go to the Link
                </Link>
                <Button
                  className="w-fit"
                  onClick={() => {
                    setFile(undefined);
                    setOpen(false);
                    setSubmitted(false);
                    setCall_id("");
                  }}
                >
                  Upload A New File
                </Button>
              </div>
            </DialogFooter>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Button
        disabled={submitted}
        onClick={() => {
          setSubmitted(true);
          submitAudio();
        }}
      >
        {submitted ? "Sending..." : "Send It!"}
      </Button>
    </>
  );
}
