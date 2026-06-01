import type { WheelConfig } from "./types";

export const STORAGE_KEY = "@gira-ai:personalizada-v1";

export const SPIN_OPTIONS = [3, 5, 9, 15];
export const CHALLENGE_OPTIONS = [15, 30, 60, 120];

export const DEFAULT_CONFIG: WheelConfig = {
	itemsInput: "1, 2, 3, 1, 2, 3, Passou a vez",
	spinSeconds: 5,
	challengeSeconds: 60,
	difficulty: "equilibrado",
	visualStyle: "sunset",
};

export const PENALTY_KEYWORDS = [
	"passou a vez",
	"perdeu tudo",
	"volte o início",
	"0",
];
