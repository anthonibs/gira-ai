import type { VisualStyle } from "../../styles/themes";

export type DifficultyMode = "equilibrado" | "facil" | "dificil";

export type WheelConfig = {
	itemsInput: string;
	spinSeconds: number;
	challengeSeconds: number;
	difficulty: DifficultyMode;
	visualStyle: VisualStyle;
};
