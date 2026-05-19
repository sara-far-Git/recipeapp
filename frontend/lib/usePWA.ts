"use client";

import { useEffect, useState } from "react";

export function usePWA() {
  const [prompt, setPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua) && !(window as any).MSStream;
    setIsIOS(ios);
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches);

    // Check if already captured before React mounted
    if ((window as any).__pwaPrompt) {
      setPrompt((window as any).__pwaPrompt);
    }

    // Listen for future firings (or if we missed it, it re-fires on some browsers)
    const onPromptReady = () => setPrompt((window as any).__pwaPrompt);
    const onPrompt = (e: any) => { e.preventDefault(); setPrompt(e); };
    const onInstalled = () => { setInstalled(true); setPrompt(null); };

    window.addEventListener("pwa-prompt-ready", onPromptReady);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("pwa-prompt-ready", onPromptReady);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async (): Promise<"accepted" | "dismissed" | "ios" | "unavailable"> => {
    if (isIOS) return "ios";
    if (!prompt) return "unavailable";
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === "accepted") setInstalled(true);
    setPrompt(null);
    (window as any).__pwaPrompt = null;
    return outcome;
  };

  const canInstall = !installed && !isStandalone && (!!prompt || isIOS);

  return { canInstall, install, installed, isIOS, prompt };
}
