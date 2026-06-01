import { formatTimer } from "../utils/time";

type ChallengeTimerPanelProps = {
	timerUrgent: boolean;
	timerJustFinished: boolean;
	timerRemaining: number;
	challengePercent: number;
	timerRunning: boolean;
	onToggleTimer: () => void;
	onRestartTimer: () => void;
};

export const ChallengeTimerPanel = ({
	timerUrgent,
	timerJustFinished,
	timerRemaining,
	challengePercent,
	timerRunning,
	onToggleTimer,
	onRestartTimer,
}: ChallengeTimerPanelProps) => {
	return (
		<aside
			className={`w-full min-w-full lg:min-w-90 rounded-2xl border border-white/20 bg-(--panel-bg) p-4 shadow-xl backdrop-blur ${timerUrgent ? "timer-urgent" : ""} ${timerJustFinished ? "timer-finished" : ""}`}
		>
			<div className="mb-2 flex items-center justify-between">
				<h2 className="font-title text-sm uppercase tracking-wider text-amber-200">
					Cronômetro do desafio
				</h2>
				<span className="font-mono text-xl font-semibold">
					{formatTimer(timerRemaining)}
				</span>
			</div>

			<div className="h-3 overflow-hidden rounded-full bg-white/20">
				<div
					className="h-full rounded-full bg-linear-to-r from-(--accent-strong) via-(--accent-soft) to-(--accent-strong) transition-all duration-1000"
					style={{ width: `${challengePercent}%` }}
				/>
			</div>

			<div className="flex mt-8 gap-3">
				<button
					type="button"
					onClick={onToggleTimer}
					className="flex-1 rounded-xl cursor-pointer bg-(--accent-strong) px-3 py-2 font-semibold text-slate-900 transition hover:brightness-110"
				>
					{timerRunning ? "Pausar" : "Iniciar"}
				</button>

				<button
					type="button"
					onClick={onRestartTimer}
					className="rounded-xl border cursor-pointer border-white/25 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
				>
					Reiniciar
				</button>
			</div>
		</aside>
	);
};
