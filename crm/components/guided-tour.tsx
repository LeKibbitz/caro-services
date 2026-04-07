"use client";
import { Joyride, STATUS, ACTIONS } from "react-joyride";
import type { EventData } from "react-joyride";
import { TOUR_STEPS } from "@/lib/tour-steps";
import { useState, useEffect } from "react";

const STORAGE_KEY = "caro_tour_completed";
const TOUR_ENABLED_KEY = "caro_tour_enabled";

export function GuidedTour() {
  const [run, setRun] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    // Auto-start on first visit if not completed
    const completed = localStorage.getItem(STORAGE_KEY);
    const enabled = localStorage.getItem(TOUR_ENABLED_KEY);
    if (!completed && enabled !== "false") {
      setRun(true);
    }
  }, []);

  // Expose a function to re-trigger the tour from the sidebar button
  useEffect(() => {
    (window as Window & { startTour?: () => void }).startTour = () => {
      setStepIndex(0);
      setRun(true);
    };
  }, []);

  function handleEvent(data: EventData) {
    const { status, action } = data;
    if (status === STATUS.FINISHED || status === STATUS.SKIPPED) {
      setRun(false);
      localStorage.setItem(STORAGE_KEY, "true");
    }
    if (action === ACTIONS.CLOSE) {
      setRun(false);
    }
  }

  return (
    <Joyride
      steps={TOUR_STEPS}
      run={run}
      stepIndex={stepIndex}
      continuous
      onEvent={handleEvent}
      locale={{
        back: "Précédent",
        close: "Fermer",
        last: "Terminer",
        next: "Suivant",
        open: "Ouvrir",
        skip: "Passer",
      }}
      options={{
        showProgress: true,
        buttons: ["back", "close", "primary", "skip"],
        overlayClickAction: false,
        primaryColor: "hsl(var(--primary))",
        zIndex: 10000,
      }}
    />
  );
}
