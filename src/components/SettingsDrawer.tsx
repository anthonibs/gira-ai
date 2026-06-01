import {
	THEME_DEFINITIONS,
	type VisualStyle,
	VISUAL_STYLE_OPTIONS,
} from "../styles/themes";
import type { DifficultyMode } from "../domain/wheel/types";

type SettingsDrawerProps = {
	drawerOpen: boolean;
	itemsInput: string;
	items: string[];
	spinSeconds: number;
	challengeSeconds: number;
	timerRunning: boolean;
	difficulty: DifficultyMode;
	visualStyle: VisualStyle;
	spinOptions: number[];
	challengeOptions: number[];
	onClose: () => void;
	onItemsInputChange: (value: string) => void;
	onSpinSecondsChange: (value: number) => void;
	onChallengeSecondsChange: (value: number) => void;
	onDifficultyChange: (value: DifficultyMode) => void;
	onVisualStyleChange: (value: VisualStyle) => void;
	onTimerRemainingSync: (value: number) => void;
};

export const SettingsDrawer = ({
	drawerOpen,
	itemsInput,
	items,
	spinSeconds,
	challengeSeconds,
	timerRunning,
	difficulty,
	visualStyle,
	spinOptions,
	challengeOptions,
	onClose,
	onItemsInputChange,
	onSpinSecondsChange,
	onChallengeSecondsChange,
	onDifficultyChange,
	onVisualStyleChange,
	onTimerRemainingSync,
}: SettingsDrawerProps) => {
	return (
		<>
			<div
				className={`fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition ${
					drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
				onClick={onClose}
				aria-hidden="true"
			/>

			<aside
				className={`settings-drawer fixed right-0 top-0 z-40 h-screen w-full overflow-auto max-w-md border-l border-white/15 bg-(--panel-bg) p-6 shadow-2xl backdrop-blur transition-transform  ${
					drawerOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-title text-xl uppercase tracking-[0.12em] text-amber-200">
						Configurações
					</h2>
					<button
						type="button"
						onClick={onClose}
						className="rounded-lg cursor-pointer border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
					>
						Fechar
					</button>
				</div>

				<div className="space-y-4 pb-12">
					<div>
						<label htmlFor="items-input" className="mb-2 block font-title text-xs uppercase tracking-[0.2em] text-orange-200/80">
							Lista ordenada
						</label>
						<textarea
							id="items-input"
							name="items-input"
							value={itemsInput}
							onChange={(event) => onItemsInputChange(event.target.value)}
							rows={8}
							className="w-full resize-y rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-orange-300/50 transition focus:ring"
							placeholder="1, 2, 3, 1, 2, 3, Passou à vez"
						/>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div>
							<label htmlFor="spin-seconds" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
								Tempo da roleta
							</label>
							<select
								id="spin-seconds"
								name="spin-seconds"
								value={spinSeconds}
								onChange={(event) => onSpinSecondsChange(Number(event.target.value))}
								className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
							>
								{spinOptions.map((seconds) => (
									<option key={seconds} value={seconds}>
										{seconds} segundos
									</option>
								))}
							</select>
						</div>

						<div>
							<label htmlFor="challenge-seconds" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
								Tempo do desafio
							</label>
							<select
								id="challenge-seconds"
								name="challenge-seconds"
								value={challengeSeconds}
								onChange={(event) => {
									const nextValue = Number(event.target.value);
									onChallengeSecondsChange(nextValue);
									if (!timerRunning) {
										onTimerRemainingSync(nextValue);
									}
								}}
								className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
							>
								{challengeOptions.map((seconds) => (
									<option key={seconds} value={seconds}>
										{seconds < 60
											? `${seconds} segundos`
											: `${seconds / 60} minuto(s)`}
									</option>
								))}
							</select>
						</div>
					</div>

					<div>
						<label htmlFor="difficulty" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
							Probabilidade
						</label>

						<select
							id="difficulty"
							name="difficulty"
							value={difficulty}
							onChange={(event) =>
								onDifficultyChange(event.target.value as DifficultyMode)
							}
							className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
						>
							<option value="equilibrado">Equilibrado</option>
							<option value="facil">
								Fácil (favorece itens no início e repetidos)
							</option>
							<option value="dificil">
								Difícil (favorece itens mais raros e no final)
							</option>
						</select>
					</div>

					<div>
						<label htmlFor="style-visual" className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
							Estilo visual
						</label>

						<select
							id="style-visual"
							name="style-visual"
							value={visualStyle}
							onChange={(event) =>
								onVisualStyleChange(event.target.value as VisualStyle)
							}
							className="w-full rounded-lg border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
						>
							{VISUAL_STYLE_OPTIONS.map((styleOption) => (
								<option key={styleOption} value={styleOption}>
									{THEME_DEFINITIONS[styleOption].label}
								</option>
							))}
						</select>
					</div>

					<div className="rounded-lg border border-white/10 bg-slate-950/45 p-3">
						<h3 className="mb-2 text-sm font-semibold text-slate-200">
							Itens ativos ({items.length})
						</h3>
						{items.length === 0 ? (
							<p className="text-sm text-slate-300/80">
								Adicione pelo menos 1 item para sortear.
							</p>
						) : (
							<ol className="max-h-48 list-decimal space-y-1 overflow-auto pl-5 text-sm text-slate-100">
								{items.map((item, index) => (
									<li key={`${item}-${index}`}>{item}</li>
								))}
							</ol>
						)}
					</div>
				</div>
			</aside>
		</>
	);
};
