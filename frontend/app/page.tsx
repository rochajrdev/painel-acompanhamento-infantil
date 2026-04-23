import { Public_Sans } from "next/font/google";
import Image from "next/image";
import Link from "next/link";
import prefeituraIcon from "@/assets/prefeitura-icon.png";
import silhuetaRio from "@/assets/silhueta-rio.png";

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"]
});

export default function HomePage() {
  return (
    <div className={`${publicSans.className} min-h-screen bg-[#f9f9ff] text-[#191c21] antialiased`}>
      <main>
        <section className="relative flex min-h-screen w-full items-center overflow-hidden bg-[#00346f]">
          <div className="absolute inset-0 z-0">
            <Image
              src={silhuetaRio}
              alt="Silhueta da cidade do Rio de Janeiro"
              priority
              className="absolute bottom-0 left-0 h-auto w-full object-cover object-bottom opacity-55 mix-blend-screen"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#00346f]/80 via-[#00346f]/45 to-[#00346f]/60" />
          </div>

          <div className="relative z-10 w-full px-4 py-12 sm:px-6 sm:py-16 lg:px-10 xl:px-14">
            <div className="max-w-[720px] text-left">
              <Image
                src={prefeituraIcon}
                alt="Logo Rio Prefeitura"
                priority
                className="mb-6 h-12 w-auto sm:h-14 md:h-16 lg:h-[4.6rem]"
              />

              <span className="mb-7 inline-block rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-white sm:text-xs md:text-[13px]">
                Prefeitura da Cidade do Rio de Janeiro
              </span>

              <h1 className="mb-6 text-[2.45rem] font-bold leading-[1.04] text-white sm:text-[3.4rem] md:text-[4.2rem] lg:text-[4.6rem]">
                Painel de
                <br />
                Acompanhamento
                <br />
                Infantil
              </h1>

              <p className="mb-9 max-w-[640px] text-[1.05rem] font-semibold leading-relaxed text-[#9bb8df] sm:text-[1.16rem] md:text-[1.26rem]">
                Sistema centralizado para gestão e acompanhamento de indicadores sociais
                criticos, integrando dados em tempo real para ações municipais estratégicas.
              </p>

              <Link
                href="/login"
                className="inline-flex items-center rounded-md bg-white px-9 py-4 text-base font-bold text-[#004A99] shadow-lg transition-all hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#00346f] active:scale-[0.98] sm:px-11 sm:py-[1.125rem] sm:text-[1.05rem]"
              >
                Fazer login
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}