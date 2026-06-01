import { CHALLENGE_OPTIONS, DEFAULT_CONFIG, SPIN_OPTIONS, STORAGE_KEY } from "./constants";
import type { DifficultyMode, WheelConfig } from "./types";

const isDifficultyMode = (value: unknown): value is DifficultyMode => {
	return value === "equilibrado" || value === "facil" || value === "dificil";
};

const isVisualStyle = (value: unknown): value is WheelConfig["visualStyle"] => {
	return value === "sunset" || value === "oceano" || value === "lava";
};

export const loadConfig = (): WheelConfig => {
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
			difficulty: isDifficultyMode(parsed.difficulty)
				? parsed.difficulty
				: DEFAULT_CONFIG.difficulty,
			visualStyle: isVisualStyle(parsed.visualStyle)
				? parsed.visualStyle
				: DEFAULT_CONFIG.visualStyle,
		};
	} catch {
		return DEFAULT_CONFIG;
	}
};

export const saveConfig = (config: WheelConfig): void => {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};
