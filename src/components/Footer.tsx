import packageJson from "../../package.json";

const APP_VERSION = packageJson.version;
const DEVELOPER_NAME = packageJson.author.name;

const Footer = () => {
	return (
		<footer className="mt-12 rounded-2xl border border-white/15 bg-(--panel-bg)/90 p-5 text-sm text-slate-200 shadow-[0_16px_40px_rgba(2,6,23,0.32)]">
			<div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
				<div className="flex items-center gap-3">
					<img
						src="/favicon-32x32.png"
						alt="Logo da roleta"
						width={32}
						height={32}
						className="h-8 w-8 rounded-md ring-1 ring-white/25"
					/>
					<div className="leading-tight">
						<p className="font-title text-base uppercase tracking-[0.08em] text-white">
							Gira AI
						</p>
						<p className="text-xs text-slate-300/90">Roleta personalizada para desafios</p>
					</div>
				</div>

				<div className="grid gap-1 text-xs md:text-right sm:text-sm">
					<p>
						Versão da roleta: <span className="font-semibold text-white">v{APP_VERSION}</span>
					</p>
					<p>
						Desenvolvedor: <span className="font-semibold text-white">{DEVELOPER_NAME}</span>
					</p>

				</div>
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-3 text-xs text-slate-300/90">
				<span>© {new Date().getFullYear()} Gira AI. Todos os direitos reservados.</span>
				<div className="flex items-center gap-3">
					<a
						href="https://github.com/anthonibs"
						target="_blank"
						rel="noreferrer"
						className="transition hover:text-white"
					>
						GitHub
					</a>
				</div>
			</div>
		</footer>
	);
}

export default Footer;
