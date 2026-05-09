import { useEffect } from "react";
import { useLayoutOutletContext } from "./useLayoutOutletContext";

export function usePageHeader(title: string, subtitle?: string) {
  const { setPageHeader } = useLayoutOutletContext();

  useEffect(() => {
    setPageHeader({ title, subtitle });
  }, [setPageHeader, subtitle, title]);
}
