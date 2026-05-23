import { Plus } from "lucide-react";
import { StateSwitch } from "@/components/ext/state-switch";
import { Button } from "@/components/ui/button";
import { UsersTable } from "@/components/settings/users-table";

export default function Page() {
  return (
    <>
      <div className="flex items-center justify-end gap-2 pb-4">
        <Button size="lg">
          <Plus className="size-4" />
          Добавить пользователя
        </Button>
      </div>
      <StateSwitch skeleton="table" emptyTitle="Пользователей нет">
        <UsersTable />
      </StateSwitch>
    </>
  );
}
