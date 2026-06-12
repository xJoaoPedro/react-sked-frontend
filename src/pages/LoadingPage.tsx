import { Spinner } from "@/components/ui/spinner";

export function LoadingPage({ color = 'text-primary' }) {
  return (
    <div className="flex min-h-[60vh] w-full flex-1 flex-col items-center justify-center px-6 text-center">
      <Spinner className={`size-16 ${color}`} />
      <span className="mt-4 text-base font-medium">Carregando...</span>
      <span className="mt-1 max-w-sm text-sm text-muted-foreground">
        Se demorar demais, considere recarregar a página
      </span>
    </div>
  )
}
