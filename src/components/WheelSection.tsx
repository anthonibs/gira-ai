type WheelSectionProps = {
	isSpinning: boolean;
	rotation: number;
	spinSeconds: number;
	wheelBackground: string;
	items: string[];
	normalizedRotation: number;
	onStartSpin: () => void;
	canSpin: boolean;
	winner: string | null;
};

export const WheelSection = ({
	isSpinning,
	rotation,
	spinSeconds,
	wheelBackground,
	items,
	normalizedRotation,
	onStartSpin,
	canSpin,
	winner,
}: WheelSectionProps) => {
	const segmentAngle = items.length > 0 ? 360 / items.length : 360;

	return (
		<section className="mt-auto rounded-3xl border border-white/15 bg-(--panel-muted) pt-8 pb-4 px-4 shadow-2xl backdrop-blur md:pt-12 md:pb-6">
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
								const radius = 36;
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
										{item}
									</span>
								);
						  })
						: null}
				</div>

				<button
					type="button"
					onClick={onStartSpin}
					disabled={!canSpin}
					className="abs-wheel-start border-[5px] border-white/90 rounded-full font-title text-xs lg:text-base uppercase tracking-wide text-slate-900 disabled:cursor-not-allowed disabled:filter cursor-pointer disabled:grayscale disabled:opacity-70"
				>
					{isSpinning ? "Girando" : "Girar"}
				</button>
			</div>

			<div className="abs-roulette-result mx-auto w-full max-w-sm p-4 rounded-lg border border-t-2 border-t-(--accent-strong) border-white/10 text-center">
				<p className="mb-1 text-[10px] lg:text-xs uppercase tracking-[0.18em] text-(--accent-strong)/85">
					Último sorteio
				</p>
				<p className="font-title text-xl text-(--accent-strong) lg:text-3xl">
					{winner ?? "Aguardando giro..."}
				</p>

				{items.length === 0 ? (
					<p className="mt-2 text-[10px] lg:text-xs text-slate-300/80">
						Abra configurações e adicione itens para sortear.
					</p>
				) : null}
				{items.length > 20 ? (
					<p className="mt-2 text-[10px] lg:text-xs text-slate-300/80">
						Muitos itens para rótulos no disco. O sorteio continua normal.
					</p>
				) : null}
			</div>
		</section>
	);
};
