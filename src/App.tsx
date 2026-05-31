import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
	THEME_DEFINITIONS,
	type VisualStyle,
	VISUAL_STYLE_OPTIONS,
} from "./styles/themes";

type DifficultyMode = "equilibrado" | "facil" | "dificil";

type WheelConfig = {
	itemsInput: string;
	spinSeconds: number;
	challengeSeconds: number;
	difficulty: DifficultyMode;
	visualStyle: VisualStyle;
};

const STORAGE_KEY = "@gira-ai:personalizada-v1";

const SPIN_OPTIONS = [3, 5, 9, 15];
const CHALLENGE_OPTIONS = [15, 30, 60, 120];

const DEFAULT_CONFIG: WheelConfig = {
	itemsInput: "1, 2, 3, 1, 2, 3, Passou a vez",
	spinSeconds: 5,
	challengeSeconds: 60,
	difficulty: "equilibrado",
	visualStyle: "sunset",
};

const loadConfig = (): WheelConfig => {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_CONFIG;

		const parsed = JSON.parse(raw) as Partial<WheelConfig>;

		return {
			itemsInput: parsed.itemsInput ?? DEFAULT_CONFIG.itemsInput,
			spinSeconds: SPIN_OPTIONS.includes(parsed.spinSeconds ?? 0)
				? (parsed.spinSeconds as number)
				: DEFAULT_CONFIG.spinSeconds,
			challengeSeconds: CHALLENGE_OPTIONS.includes(parsed.challengeSeconds ?? 0)
				? (parsed.challengeSeconds as number)
				: DEFAULT_CONFIG.challengeSeconds,
			difficulty:
				parsed.difficulty === "equilibrado" ||
				parsed.difficulty === "facil" ||
				parsed.difficulty === "dificil"
					? parsed.difficulty
					: DEFAULT_CONFIG.difficulty,
			visualStyle:
				parsed.visualStyle === "sunset" ||
				parsed.visualStyle === "oceano" ||
				parsed.visualStyle === "lava"
					? parsed.visualStyle
					: DEFAULT_CONFIG.visualStyle,
		};
	} catch {
		return DEFAULT_CONFIG;
	}
};

const parseItems = (input: string): string[] => {
	return input
		.split(/[\n,;]+/)
		.map((value) => value.trim())
		.filter(Boolean);
};

const formatTimer = (totalSeconds: number): string => {
	const minutes = Math.floor(totalSeconds / 60);
	const seconds = totalSeconds % 60;
	return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

const getItemBaseWeight = (item: string): number => {
  const penalidades = ["passou a vez", "perdeu tudo", "volte o início", "0"];
  const itemMinusculo = item.toLowerCase().trim();
  
  if (penalidades.some(p => itemMinusculo.includes(p))) {
    return 10; 
  }
  return 30; 
};

const pickWeightedIndex = (
  items: string[],
  difficulty: DifficultyMode,
): number => {
  if (items.length <= 1) return 0;

  const weights = items.map((item) => {
    const baseWeight = getItemBaseWeight(item);
    const isPenalty = baseWeight === 10;

    switch (difficulty) {
      case "facil":
        return isPenalty ? baseWeight * 0.3 : baseWeight * 1.5;
      
      case "dificil":
        return isPenalty ? baseWeight * 2.5 : baseWeight * 0.5;
      
      case "equilibrado":
      default:
        return baseWeight;
    }
  });

  const totalWeight = weights.reduce((sum, value) => sum + value, 0);
  const randomValue = Math.random() * totalWeight;

  let cumulative = 0;
  for (let index = 0; index < weights.length; index += 1) {
    cumulative += weights[index];
    if (randomValue <= cumulative) {
      return index;
    }
  }

  return items.length - 1;
};

function App() {
	const initialConfig = useMemo(() => loadConfig(), []);

	const [itemsInput, setItemsInput] = useState(initialConfig.itemsInput);
	const [spinSeconds, setSpinSeconds] = useState(initialConfig.spinSeconds);
	const [challengeSeconds, setChallengeSeconds] = useState(
		initialConfig.challengeSeconds,
	);
	const [difficulty, setDifficulty] = useState<DifficultyMode>(
		initialConfig.difficulty,
	);
	const [visualStyle, setVisualStyle] = useState<VisualStyle>(
		initialConfig.visualStyle,
	);

	const [drawerOpen, setDrawerOpen] = useState(false);

	const [rotation, setRotation] = useState(0);
	const [winner, setWinner] = useState<string | null>(null);
	const [isSpinning, setIsSpinning] = useState(false);

	const [timerRunning, setTimerRunning] = useState(false);
	const [timerRemaining, setTimerRemaining] = useState(challengeSeconds);
	const [timerJustFinished, setTimerJustFinished] = useState(false);

	const spinTimeoutRef = useRef<number | null>(null);
	const timerFinishedFxTimeoutRef = useRef<number | null>(null);
	const audioContextRef = useRef<AudioContext | null>(null);
	const spinTickIntervalRef = useRef<number | null>(null);

	const items = useMemo(() => parseItems(itemsInput), [itemsInput]);
	const segmentAngle = items.length > 0 ? 360 / items.length : 360;
	const selectedStyle = THEME_DEFINITIONS[visualStyle];

	const wheelBackground = useMemo(() => {
		if (items.length === 0) {
			return "radial-gradient(circle at 30% 30%, #e2e8f0, #94a3b8)";
		}

		const stops = items
			.map((_, index) => {
				const start = segmentAngle * index;
				const end = segmentAngle * (index + 1);
				const color =
					selectedStyle.wheelPalette[index % selectedStyle.wheelPalette.length];
				return `${color} ${start}deg ${end}deg`;
			})
			.join(", ");

		return `conic-gradient(${stops})`;
	}, [items, segmentAngle, selectedStyle]);

	useEffect(() => {
		const configToSave: WheelConfig = {
			itemsInput,
			spinSeconds,
			challengeSeconds,
			difficulty,
			visualStyle,
		};

		localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
	}, [itemsInput, spinSeconds, challengeSeconds, difficulty, visualStyle]);

	useEffect(() => {
		if (!drawerOpen) return;

		const onEsc = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setDrawerOpen(false);
			}
		};

		window.addEventListener("keydown", onEsc);
		return () => window.removeEventListener("keydown", onEsc);
	}, [drawerOpen]);

	useEffect(() => {
		if (!timerRunning) return;

		const intervalId = window.setInterval(() => {
			setTimerRemaining((previous) => {
				if (previous <= 1) {
					window.clearInterval(intervalId);
					setTimerRunning(false);
					setTimerJustFinished(true);
					return 0;
				}

				return previous - 1;
			});
		}, 1000);

		return () => window.clearInterval(intervalId);
	}, [timerRunning]);

	useEffect(() => {
		if (!timerJustFinished) return;

		if (timerFinishedFxTimeoutRef.current) {
			window.clearTimeout(timerFinishedFxTimeoutRef.current);
		}

		timerFinishedFxTimeoutRef.current = window.setTimeout(() => {
			setTimerJustFinished(false);
		}, 900);

		return () => {
			if (timerFinishedFxTimeoutRef.current) {
				window.clearTimeout(timerFinishedFxTimeoutRef.current);
			}
		};
	}, [timerJustFinished]);

	useEffect(() => {
		return () => {
			if (spinTickIntervalRef.current) {
				window.clearInterval(spinTickIntervalRef.current);
			}

			if (spinTimeoutRef.current) {
				window.clearTimeout(spinTimeoutRef.current);
			}

			if (timerFinishedFxTimeoutRef.current) {
				window.clearTimeout(timerFinishedFxTimeoutRef.current);
			}

			if (audioContextRef.current) {
				void audioContextRef.current.close();
			}
		};
	}, []);

	const getAudioContext = useCallback(() => {
		if (!audioContextRef.current) {
			audioContextRef.current = new window.AudioContext();
		}

		if (audioContextRef.current.state === "suspended") {
			void audioContextRef.current.resume();
		}

		return audioContextRef.current;
	}, []);

	const playTone = useCallback((
		frequency: number,
		durationMs: number,
		volume: number,
		type: OscillatorType = "sine",
		startDelaySec = 0,
	) => {
		const audioContext = getAudioContext();
		const startTime = audioContext.currentTime + startDelaySec;
		const endTime = startTime + durationMs / 1000;

		const oscillator = audioContext.createOscillator();
		const gainNode = audioContext.createGain();

		oscillator.type = type;
		oscillator.frequency.setValueAtTime(frequency, startTime);

		gainNode.gain.setValueAtTime(0.0001, startTime);
		gainNode.gain.exponentialRampToValueAtTime(volume, startTime + 0.015);
		gainNode.gain.exponentialRampToValueAtTime(0.0001, endTime);

		oscillator.connect(gainNode);
		gainNode.connect(audioContext.destination);

		oscillator.start(startTime);
		oscillator.stop(endTime + 0.02);
	}, [getAudioContext]);

	const playSpinTick = useCallback(() => {
		const randomFrequency = 360 + Math.random() * 220;
		playTone(randomFrequency, 55, 0.03, "triangle");
	}, [playTone]);

	const playSpinEndSound = useCallback(() => {
		playTone(620, 120, 0.08, "triangle");
		playTone(820, 180, 0.07, "sine", 0.12);
	}, [playTone]);

	const playFinalSecondsBeep = useCallback((second: number) => {
		const baseFrequency = second <= 2 ? 980 : 820;
		playTone(baseFrequency, 110, 0.07, "square");
	}, [playTone]);

	const playTimerFinishedSound = useCallback(() => {
		playTone(520, 140, 0.08, "sine");
		playTone(410, 160, 0.08, "triangle", 0.15);
		playTone(310, 240, 0.1, "sawtooth", 0.32);
	}, [playTone]);

	useEffect(() => {
		if (!isSpinning) {
			if (spinTickIntervalRef.current) {
				window.clearInterval(spinTickIntervalRef.current);
				spinTickIntervalRef.current = null;
			}
			return;
		}

		playSpinTick();
		spinTickIntervalRef.current = window.setInterval(() => {
			playSpinTick();
		}, 120);

		return () => {
			if (spinTickIntervalRef.current) {
				window.clearInterval(spinTickIntervalRef.current);
				spinTickIntervalRef.current = null;
			}
		};
	}, [isSpinning, playSpinTick]);

	useEffect(() => {
		if (!timerRunning || timerRemaining <= 0 || timerRemaining > 5) return;
		playFinalSecondsBeep(timerRemaining);
	}, [timerRemaining, timerRunning, playFinalSecondsBeep]);

	useEffect(() => {
		if (!timerJustFinished) return;
		playTimerFinishedSound();
	}, [timerJustFinished, playTimerFinishedSound]);

	const startSpin = () => {
		if (items.length === 0 || isSpinning) return;

		getAudioContext();

		const selectedIndex = pickWeightedIndex(items, difficulty);
		const centerAngle = (selectedIndex + 0.5) * segmentAngle;
		const desiredMod = (360 - centerAngle) % 360;
		const extraSpins = Math.floor(Math.random() * 3) + 6;

		setWinner(null);
		setIsSpinning(true);

		setRotation((previous) => {
			const currentMod = ((previous % 360) + 360) % 360;
			const delta = (desiredMod - currentMod + 360) % 360;
			return previous + extraSpins * 360 + delta;
		});

		if (spinTimeoutRef.current) {
			window.clearTimeout(spinTimeoutRef.current);
		}

		spinTimeoutRef.current = window.setTimeout(() => {
			setWinner(items[selectedIndex]);
			setIsSpinning(false);
			playSpinEndSound();
		}, spinSeconds * 1000);
	};

	const toggleChallengeTimer = () => {
		getAudioContext();

		if (timerRunning) {
			setTimerRunning(false);
			return;
		}

		if (timerRemaining <= 0) {
			setTimerRemaining(challengeSeconds);
		}

		setTimerRunning(true);
	};

	const restartChallengeTimer = () => {
		getAudioContext();
		setTimerRunning(false);
		setTimerRemaining(challengeSeconds);
		setTimerJustFinished(false);
	};

	const challengePercent = Math.max(
		(timerRemaining / challengeSeconds) * 100,
		0,
	);
	const canSpin = items.length > 0 && !isSpinning;
	const timerUrgent = timerRunning && timerRemaining > 0 && timerRemaining <= 5;
	const normalizedRotation = ((rotation % 360) + 360) % 360;

	return (
		<main data-theme={visualStyle} className="min-h-screen text-(--text-primary)">
			<div className="page-bg" />

			<section className="mx-auto flex  w-full max-w-7xl px-6  py-12 flex-col">
				<div className="mb-6 grid gap-6 lg:grid-cols-[1fr_auto]">
					<header className="space-y-2 text-center lg:text-left">
						<p className="font-title text-sm uppercase tracking-[0.24em] text-orange-300/90">
							Roleta Personalizada
						</p>
						<h1 className="font-title text-3xl leading-tight text-white sm:text-4xl">
							Sorteio com lista ordenada e controle de desafio
						</h1>
						<p className=" text-sm text-slate-200/90 sm:text-base">
							A roleta fica na parte inferior. Abra o painel de configurações
							para editar lista, tempo, dificuldade e estilo visual.
						</p>

						<button
							type="button"
							onClick={() => setDrawerOpen(true)}
							className="mt-3 rounded-xl border cursor-pointer border-white/25 bg-(--panel-muted) px-4 py-2 font-title text-sm uppercase tracking-[0.12em] transition theme-sunset:hover:bg-orange-400/20 theme-oceano:hover:bg-cyan-400/20 theme-lava:hover:bg-rose-400/20"
						>
							Configurações
						</button>
					</header>

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
								onClick={toggleChallengeTimer}
								className="flex-1 rounded-xl cursor-pointer bg-(--accent-strong) px-3 py-2 font-semibold text-slate-900 transition hover:brightness-110"
							>
								{timerRunning ? "Pausar" : "Iniciar"}
							</button>

							<button
								type="button"
								onClick={restartChallengeTimer}
								className="rounded-xl border cursor-pointer border-white/25 px-3 py-2 text-sm font-medium transition hover:bg-white/10"
							>
								Reiniciar
							</button>
						</div>
					</aside>
				</div>

				<section className="mt-auto rounded-3xl border border-white/15 bg-(--panel-muted) p-4 shadow-2xl backdrop-blur sm:p-6">
					<div className="wheel-shell mx-auto mb-6">
						<div className={`pointer-triangle ${isSpinning ? "pointer-active" : ""}`} />

						<div
							className={`wheel-frame ${isSpinning ? "wheel-frame-spinning" : ""}`}
							style={{
								transform: `rotate(${rotation}deg)`,
								transition: `transform ${spinSeconds}s cubic-bezier(.17,.67,.2,1)`,
								backgroundImage: wheelBackground,
							}}
						>
							{items.length > 0 && items.length <= 20
								? items.map((item, index) => {
										const angle = segmentAngle * (index + 0.5);
										const radian = ((angle - 90) * Math.PI) / 180;
										const radius = 40;
										const x = 50 + radius * Math.cos(radian);
										const y = 50 + radius * Math.sin(radian);

										return (
											<span
												key={`${item}-badge-${index}`}
												className="wheel-badge"
												style={{
													left: `${x}%`,
													top: `${y}%`,
													transform: `translate(-50%, -50%) rotate(${-normalizedRotation}deg)`,
													transition: `transform ${spinSeconds}s cubic-bezier(.17,.67,.2,1)`,
												}}
												title={item}
											>
												{item.length > 11 ? `${item.slice(0, 11)}...` : item}
											</span>
										);
									})
								: null}
						</div>

						<button
							type="button"
							onClick={startSpin}
							disabled={!canSpin}
							className="abs-wheel-start border-[5px] border-white/90 rounded-full font-title text-base uppercase tracking-wide text-slate-900 disabled:cursor-not-allowed disabled:filter cursor-pointer disabled:grayscale disabled:opacity-70"
						>
							{isSpinning ? "Girando" : "Começar"}
						</button>
					</div>

					<div className="mx-auto w-full max-w-xl p-4 rounded-2xl border border-white/20 bg-(--panel-bg) text-center">
						<p className="mb-1 text-xs uppercase tracking-[0.18em] text-orange-200/85">
							Ultimo sorteio
						</p>
						<p className="font-title text-2xl text-amber-200 sm:text-3xl">
							{winner ?? "Aguardando giro..."}
						</p>
						{items.length === 0 ? (
							<p className="mt-2 text-xs text-slate-300/80">
								Abra configurações e adicione itens para sortear.
							</p>
						) : null}
						{items.length > 20 ? (
							<p className="mt-2 text-xs text-slate-300/80">
								Muitos itens para rótulos no disco. O sorteio continua normal.
							</p>
						) : null}
					</div>
				</section>
			</section>

			<div
				className={`fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm transition ${
					drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
				}`}
				onClick={() => setDrawerOpen(false)}
				aria-hidden="true"
			/>

			<aside
				className={`settings-drawer fixed right-0 top-0 z-40 h-full w-full max-w-md border-l border-white/15 bg-(--panel-bg) p-4 shadow-2xl backdrop-blur transition-transform sm:p-6 ${
					drawerOpen ? "translate-x-0" : "translate-x-full"
				}`}
			>
				<div className="mb-4 flex items-center justify-between">
					<h2 className="font-title text-xl uppercase tracking-[0.12em] text-amber-200">
						Configurações
					</h2>
					<button
						type="button"
						onClick={() => setDrawerOpen(false)}
						className="rounded-lg border border-white/20 px-3 py-1 text-sm hover:bg-white/10"
					>
						Fechar
					</button>
				</div>

				<div className="space-y-4 overflow-y-auto pb-12">
					<div>
						<label className="mb-2 block font-title text-xs uppercase tracking-[0.2em] text-orange-200/80">
							Lista ordenada
						</label>
						<textarea
							value={itemsInput}
							onChange={(event) => setItemsInput(event.target.value)}
							rows={8}
							className="w-full resize-y rounded-2xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 outline-none ring-orange-300/50 transition focus:ring"
							placeholder="1, 2, 3, 1, 2, 3, Passou a vez"
						/>
					</div>

					<div className="grid gap-3 sm:grid-cols-2">
						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
								Tempo da roleta
							</label>
							<select
								value={spinSeconds}
								onChange={(event) => setSpinSeconds(Number(event.target.value))}
								className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
							>
								{SPIN_OPTIONS.map((seconds) => (
									<option key={seconds} value={seconds}>
										{seconds} segundos
									</option>
								))}
							</select>
						</div>

						<div>
							<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
								Tempo do desafio
							</label>
							<select
								value={challengeSeconds}
								onChange={(event) => {
									const nextValue = Number(event.target.value);
									setChallengeSeconds(nextValue);
									if (!timerRunning) {
										setTimerRemaining(nextValue);
									}
								}}
								className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
							>
								{CHALLENGE_OPTIONS.map((seconds) => (
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
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
							Probabilidade
						</label>
						<select
							value={difficulty}
							onChange={(event) =>
								setDifficulty(event.target.value as DifficultyMode)
							}
							className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
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
						<label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-300">
							Estilo visual
						</label>
						<select
							value={visualStyle}
							onChange={(event) =>
								setVisualStyle(event.target.value as VisualStyle)
							}
							className="w-full rounded-xl border border-white/15 bg-slate-950/60 px-3 py-2 text-sm outline-none ring-orange-300/50 transition focus:ring"
						>
							{VISUAL_STYLE_OPTIONS.map((styleOption) => (
								<option key={styleOption} value={styleOption}>
									{THEME_DEFINITIONS[styleOption].label}
								</option>
							))}
						</select>
					</div>

					<div className="rounded-xl border border-white/10 bg-slate-950/45 p-3">
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
		</main>
	);
}

export default App;
