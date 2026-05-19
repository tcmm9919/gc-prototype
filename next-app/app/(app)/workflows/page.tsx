import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { Button } from "@/components/ui/button";
import { WorkflowsTable } from "@/components/workflows/workflows-table";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Конструктор сценариев"
        actions={
          <Button asChild>
            <Link href="/workflows/builder">
              <Plus className="size-4" />
              Создать
            </Link>
          </Button>
        }
      />
      <WorkflowsTable />
    </>
  );
}
