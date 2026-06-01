import { useCallback, useEffect, useRef } from "react";

type PlayToneOptions = {
	type?: OscillatorType;
	startDelaySec?: number;
};

export const useWheelAudio = () => {
	const audioContextRef = useRef<AudioContext | null>(null);

	const ensureAudioReady = useCallback(() => {
		if (!audioContextRef.current) {
			audioContextRef.current = new window.AudioContext();
		}

		if (audioContextRef.current.state === "suspended") {
			void audioContextRef.current.resume();
		}

		return audioContextRef.current;
	}, []);

	const playTone = useCallback(
		(
			frequency: number,
			durationMs: number,
			volume: number,
			options: PlayToneOptions = {},
		) => {
			const { type = "sine", startDelaySec = 0 } = options;
			const audioContext = ensureAudioReady();
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
		},
		[ensureAudioReady],
	);

	const playSpinTick = useCallback(() => {
		const randomFrequency = 360 + Math.random() * 220;
		playTone(randomFrequency, 55, 0.03, { type: "triangle" });
	}, [playTone]);

	const playSpinEndSound = useCallback(() => {
		playTone(620, 120, 0.08, { type: "triangle" });
		playTone(820, 180, 0.07, { type: "sine", startDelaySec: 0.12 });
	}, [playTone]);

	const playFinalSecondsBeep = useCallback(
		(second: number) => {
			const baseFrequency = second <= 2 ? 980 : 820;
			playTone(baseFrequency, 110, 0.07, { type: "square" });
		},
		[playTone],
	);

	const playTimerFinishedSound = useCallback(() => {
		playTone(520, 140, 0.08, { type: "sine" });
		playTone(410, 160, 0.08, { type: "triangle", startDelaySec: 0.15 });
		playTone(310, 240, 0.1, { type: "sawtooth", startDelaySec: 0.32 });
	}, [playTone]);

	useEffect(() => {
		return () => {
			if (audioContextRef.current) {
				void audioContextRef.current.close();
			}
		};
	}, []);

	return {
		ensureAudioReady,
		playFinalSecondsBeep,
		playSpinEndSound,
		playSpinTick,
		playTimerFinishedSound,
	};
};
