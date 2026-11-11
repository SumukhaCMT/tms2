import { usePermission } from "@/permissions/usePermission";
export function useModulePermissions(module: string) {
  const canAdd = usePermission(module, "ADD");
  const canEdit = usePermission(module, "EDIT");
  const canDelete = usePermission(module, "DELETE");
  const canView = usePermission(module, "READ");

  return {
    canAdd,
    canEdit,
    canDelete,
    canView,
  };
}