import { useOutletContext } from "react-router-dom";
import type { NotificationItem } from "@/components/PageHeader";

interface PageHeaderConfig {
  title: string;
  subtitle?: string;
}

export interface LayoutOutletContext {
  dados: any;
  updateDados: (valueOrUpdater: any) => void;
  refreshDados: () => Promise<any>;
  setPageHeader: (header: PageHeaderConfig) => void;
  notifications: NotificationItem[];
}

export function useLayoutOutletContext() {
  return useOutletContext<LayoutOutletContext>();
}
