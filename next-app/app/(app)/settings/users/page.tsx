import { Plus } from "lucide-react";
import { PageHeader } from "@/components/ext/page-header";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/settings/users-table";

export default function Page() {
  return (
    <>
      <PageHeader
        title="Пользователи"
        description="Управление учётками офицеров комплаенса и доступом"
        actions={
          <Button size="lg">
            <Plus className="size-4" />
            Добавить пользователя
          </Button>
        }
      />
      <StateSwitch skeleton="table" emptyTitle="Пользователей нет">
        <UsersTable />
      </StateSwitch>
    </>
  );
}
