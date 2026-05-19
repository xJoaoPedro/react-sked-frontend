import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import skedLogo from "@/assets/skedLogo.svg";
import { Button } from "@/components/ui/button";

const notFoundBackgroundImages = [
  "/login-bg-1.jpg",
  "/login-bg-2.jpg",
  "/login-bg-3.jpg",
  "/login-bg-4.jpg",
];

export function NotFoundPage() {
  const hasSession = Boolean(localStorage.getItem("token"));
  const [backgroundImage] = useState(
    () =>
      notFoundBackgroundImages[Math.floor(Math.random() * notFoundBackgroundImages.length)],
  );

  useEffect(() => {
    document.title = "Sked - Página não encontrada";
  }, []);

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#080D0D] px-6 py-12">
      <img
        src={backgroundImage}
        alt=""
        aria-hidden="true"
        loading="eager"
        decoding="async"
        className="pointer-events-none absolute inset-0 h-full w-full scale-105 object-cover object-center blur-[6px]"
      />
      <div className="absolute inset-0 bg-[#080D0D]/38" />
      <div className="absolute inset-0 bg-[linear-gradient(rgba(8,13,13,0.66),rgba(8,13,13,0.76))]" />
      <div className="pointer-events-none absolute top-[-160px] left-[-120px] h-[500px] w-[500px] rounded-full bg-[#00A676]/[0.07] blur-3xl" />
      <div className="pointer-events-none absolute right-[-80px] bottom-[-180px] h-[520px] w-[520px] rounded-full bg-[#00A676]/[0.05] blur-3xl" />
      <div className="pointer-events-none absolute top-[40%] left-[40%] h-[300px] w-[300px] rounded-full bg-[#00A676]/[0.04] blur-2xl" />

      <section className="relative z-10 w-full max-w-2xl rounded-[28px] border border-border/70 bg-white p-8 text-foreground shadow-[0_32px_96px_rgba(0,0,0,0.45)] md:p-12">
        <span className="absolute top-6 right-6 rounded-full border border-[#00A676]/25 bg-[#00A676]/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[#7BE0B4]">
          Erro 404
        </span>

        <div className="mb-8 flex items-center gap-3">
          <img src={skedLogo} alt="Sked" className="h-10 w-auto" />
        </div>

        <div className="space-y-4">
          <p className="text-3xl font-medium tracking-tight text-[#7BE0B4] md:text-4xl">
            :(
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-foreground md:text-5xl">
            A página que você tentou abrir saiu da agenda.
          </h1>
          <p className="max-w-xl text-base leading-7 text-muted-foreground md:text-lg">
            O link pode estar incorreto, desatualizado ou a página pode ter sido movida.
            Você pode voltar para um ponto seguro e continuar de onde parou.
          </p>
        </div>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Button asChild size="lg" className="sm:min-w-52">
            <Link to={hasSession ? "/dashboard" : "/auth"}>
              <ArrowLeft />
              {hasSession ? "Voltar ao painel" : "Ir para o acesso"}
            </Link>
          </Button>

          <Button asChild size="lg" className="sm:min-w-52 text-foreground bg-transparent hover:bg-gray-100 transition-200 hover:border hover:border-black">
            <Link to="/">
              <Compass />
              Tentar rota inicial
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
