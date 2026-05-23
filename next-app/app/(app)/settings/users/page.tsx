import { StateSwitch } from "@/components/ext/state-switch";
import { UsersTable } from "@/components/settings/users-table";

export default function Page() {
  return (
    <StateSwitch skeleton="table" emptyTitle="Пользователей нет">
      <UsersTable />
    </StateSwitch>
  );
}
