import { Spinner } from "@/components/ui/spinner";

export function LoadingPage({ color = 'text-primary' }) {
  return (
    <div className="w-full h-full flex flex-col justify-center items-center">
      <Spinner className={`size-16 ${color}`} />
      <span>Carregando...</span>
      <span className="text-muted-foreground">Se demorar demais, considere recarregar a página</span>
    </div>
  )
}