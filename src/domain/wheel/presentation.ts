export const buildWheelBackground = (
	itemsCount: number,
	segmentAngle: number,
	palette: readonly string[],
): string => {
	if (itemsCount === 0) {
		return "radial-gradient(circle at 30% 30%, #e2e8f0, #94a3b8)";
	}

	const stops = Array.from({ length: itemsCount })
		.map((_, index) => {
			const start = segmentAngle * index;
			const end = segmentAngle * (index + 1);
			const color = palette[index % palette.length];
			return `${color} ${start}deg ${end}deg`;
		})
		.join(", ");

	return `conic-gradient(${stops})`;
};

export const calculateNextRotation = (
	currentRotation: number,
	selectedIndex: number,
	segmentAngle: number,
): number => {
	const centerAngle = (selectedIndex + 0.5) * segmentAngle;
	const desiredMod = (360 - centerAngle) % 360;
	const extraSpins = Math.floor(Math.random() * 3) + 6;
	const currentMod = ((currentRotation % 360) + 360) % 360;
	const delta = (desiredMod - currentMod + 360) % 360;

	return currentRotation + extraSpins * 360 + delta;
};
