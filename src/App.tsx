import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import { TooltipProvider } from "./components/ui/tooltip";
import { Toaster } from "sonner";

export default function App() {
  return (
    <TooltipProvider>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        richColors
        closeButton
        expand
        duration={5000}
      />
    </TooltipProvider>
  );
}
