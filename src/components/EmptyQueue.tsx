import { Inbox } from "lucide-react";

export function EmptyQueue() {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
        <Inbox className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="mt-4 text-sm font-medium text-foreground">Queue is empty</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload images to your Google Drive input folder to start processing
      </p>
    </div>
  );
}
