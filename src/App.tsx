import { useEffect, useMemo, useRef, useState } from "react";
import { ChallengeTimerPanel } from "./components/ChallengeTimerPanel";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { WheelSection } from "./components/WheelSection";
import { CHALLENGE_OPTIONS, SPIN_OPTIONS } from "./domain/wheel/constants";
import { loadConfig, saveConfig } from "./domain/wheel/configStorage";
import { buildWheelBackground, calculateNextRotation } from "./domain/wheel/presentation";
import { parseItems, pickWeightedIndex } from "./domain/wheel/selection";
import type { WheelConfig } from "./domain/wheel/types";
import { useWheelAudio } from "./hooks/useWheelAudio";
import { useChallengeTimer } from "./hooks/useChallengeTimer";
import { THEME_DEFINITIONS } from "./styles/themes";
import Footer from "./components/Footer";



function App() {
  const initialConfig = useMemo(() => loadConfig(), []);

  const [itemsInput, setItemsInput] = useState(initialConfig.itemsInput);
  const [spinSeconds, setSpinSeconds] = useState(initialConfig.spinSeconds);
  const [challengeSeconds, setChallengeSeconds] = useState(initialConfig.challengeSeconds);
  const [difficulty, setDifficulty] = useState(initialConfig.difficulty);
  const [visualStyle, setVisualStyle] = useState(initialConfig.visualStyle);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [isSpinning, setIsSpinning] = useState(false);

  const spinTimeoutRef = useRef<number | null>(null);
  const spinTickIntervalRef = useRef<number | null>(null);

  const {
    ensureAudioReady,
    playFinalSecondsBeep,
    playSpinEndSound,
    playSpinTick,
    playTimerFinishedSound,
  } = useWheelAudio();

  const {
    timerRunning,
    setTimerRunning,
    timerRemaining,
    setTimerRemaining,
    timerJustFinished,
  } = useChallengeTimer(challengeSeconds, playTimerFinishedSound, playFinalSecondsBeep);

  const items = useMemo(() => parseItems(itemsInput), [itemsInput]);
  const segmentAngle = items.length > 0 ? 360 / items.length : 360;
  const selectedStyle = THEME_DEFINITIONS[visualStyle];

  const wheelBackground = useMemo(() => {
    return buildWheelBackground(items.length, segmentAngle, selectedStyle.wheelPalette);
  }, [items.length, segmentAngle, selectedStyle.wheelPalette]);

  useEffect(() => {
    const configToSave: WheelConfig = {
      itemsInput,
      spinSeconds,
      challengeSeconds,
      difficulty,
      visualStyle,
    };
    saveConfig(configToSave);
  }, [itemsInput, spinSeconds, challengeSeconds, difficulty, visualStyle]);

  useEffect(() => {
    if (!drawerOpen) return;

    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [drawerOpen]);

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
    return () => {
      if (spinTickIntervalRef.current) window.clearInterval(spinTickIntervalRef.current);
      if (spinTimeoutRef.current) window.clearTimeout(spinTimeoutRef.current);
    };
  }, []);

  const startSpin = () => {
    if (items.length === 0 || isSpinning) return;

    ensureAudioReady();

    const selectedIndex = pickWeightedIndex(items, difficulty);

    setWinner(null);
    setIsSpinning(true);
    setRotation((previous) => calculateNextRotation(previous, selectedIndex, segmentAngle));

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
    ensureAudioReady();

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
    ensureAudioReady();
    setTimerRunning(false);
    setTimerRemaining(challengeSeconds);
  };

  const challengePercent = Math.max((timerRemaining / challengeSeconds) * 100, 0);
  const canSpin = items.length > 0 && !isSpinning;
  const timerUrgent = timerRunning && timerRemaining > 0 && timerRemaining <= 5;
  const normalizedRotation = ((rotation % 360) + 360) % 360;

  return (
    <main data-theme={visualStyle} className="min-h-screen text-(--text-primary)">
      <div className="page-bg" />

      <section className="mx-auto flex w-full max-w-7xl flex-col px-6 py-12">
        <div className="mb-6 grid gap-6 lg:grid-cols-[1fr_auto]">
          <header className="space-y-2 text-center lg:text-left">
            <p className="font-title text-sm uppercase tracking-[0.24em] text-orange-300/90">
              Roleta Personalizada
            </p>
            <h1 className="font-title text-3xl leading-tight text-white sm:text-4xl">
              Sorteio com lista ordenada e controle de desafio
            </h1>
            <p className="text-sm text-slate-200/90 sm:text-base">
              A roleta fica na parte inferior. Abra o painel de configurações para editar lista, tempo, dificuldade e estilo visual.
            </p>

            <button
              type="button"
              onClick={() => setDrawerOpen(true)}
              className="mt-3 cursor-pointer rounded-xl border border-white/25 bg-(--panel-muted) px-4 py-2 font-title text-sm uppercase tracking-[0.12em] transition theme-sunset:hover:bg-orange-400/20 theme-oceano:hover:bg-cyan-400/20 theme-lava:hover:bg-rose-400/20"
            >
              Configurações
            </button>
          </header>

          <ChallengeTimerPanel
            timerUrgent={timerUrgent}
            timerJustFinished={timerJustFinished}
            timerRemaining={timerRemaining}
            challengePercent={challengePercent}
            timerRunning={timerRunning}
            onToggleTimer={toggleChallengeTimer}
            onRestartTimer={restartChallengeTimer}
          />
        </div>

        <WheelSection
          isSpinning={isSpinning}
          rotation={rotation}
          spinSeconds={spinSeconds}
          wheelBackground={wheelBackground}
          items={items}
          normalizedRotation={normalizedRotation}
          onStartSpin={startSpin}
          canSpin={canSpin}
          winner={winner}
        />

       <Footer />
      </section>

      <SettingsDrawer
        drawerOpen={drawerOpen}
        itemsInput={itemsInput}
        items={items}
        spinSeconds={spinSeconds}
        challengeSeconds={challengeSeconds}
        timerRunning={timerRunning}
        difficulty={difficulty}
        visualStyle={visualStyle}
        spinOptions={SPIN_OPTIONS}
        challengeOptions={CHALLENGE_OPTIONS}
        onClose={() => setDrawerOpen(false)}
        onItemsInputChange={setItemsInput}
        onSpinSecondsChange={setSpinSeconds}
        onChallengeSecondsChange={setChallengeSeconds}
        onDifficultyChange={setDifficulty}
        onVisualStyleChange={setVisualStyle}
        onTimerRemainingSync={setTimerRemaining}
      />
    </main>
  );
}

export default App;
