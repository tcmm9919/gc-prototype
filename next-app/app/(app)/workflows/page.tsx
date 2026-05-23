import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorkflowsTable } from "@/components/workflows/workflows-table";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button asChild>
          <Link href="/workflows/builder">
            <Plus className="size-4" />
            Создать
          </Link>
        </Button>
      </div>
      <WorkflowsTable />
    </>
  );
}
