import { PENALTY_KEYWORDS } from "./constants";
import type { DifficultyMode } from "./types";

export const parseItems = (input: string): string[] => {
	return input
		.split(/[\n,;]+/)
		.map((value) => value.trim())
		.filter(Boolean);
};

export const getItemBaseWeight = (item: string): number => {
	const normalizedItem = item.toLowerCase().trim();
	const isPenalty = PENALTY_KEYWORDS.some((penalty) =>
		normalizedItem.includes(penalty),
	);

	return isPenalty ? 10 : 30;
};

export const pickWeightedIndex = (
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
