import manifest from "../data/speech-manifest.json";

export const SPEECH_VOICE = "Microsoft Premwadee Neural 女聲";
export const SLOW_RATE = 0.71;

interface SpeechState {
  text: string | null;
  error: string | null;
  rate: number;
}

// A single media element keeps playback mutually exclusive across buttons,
// the record player and the canal. It also retains the user's media unlock.
export function createSpeechPlayer(
  clips: Record<string, string>,
  baseUrl: string,
  makeAudio: () => HTMLAudioElement = () => new Audio(),
) {
  let audio: HTMLAudioElement | null = null;
  let requestId = 0;
  let state: SpeechState = { text: null, error: null, rate: SLOW_RATE };
  const listeners = new Set<() => void>();
  const update = (next: SpeechState) => {
    state = next;
    listeners.forEach((listener) => listener());
  };

  const getAudio = () => {
    if (!audio) {
      audio = makeAudio();
      audio.preload = "none";
      audio.setAttribute("playsinline", "");
      audio.controls = true;
      audio.setAttribute("aria-label", `${SPEECH_VOICE}發音播放器`);
    }
    return audio;
  };

  const clearAudio = () => {
    if (!audio) return;
    audio.onerror = null;
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
  };

  const speak = (text: string, rate = SLOW_RATE) => {
    const currentRequest = ++requestId;
    clearAudio();
    const file = Object.prototype.hasOwnProperty.call(clips, text) ? clips[text] : null;
    if (!file) {
      update({ text, rate, error: "這段文字尚未提供 Premwadee 音檔。" });
      return;
    }
    const media = getAudio();
    const playbackRate = Number.isFinite(rate) && rate > 0 ? rate : SLOW_RATE;
    media.src = `${baseUrl}${file}`;
    media.currentTime = 0;
    media.playbackRate = playbackRate;
    media.preservesPitch = true;
    // Older Safari exposes the pitch-preservation switch with a prefix.
    (media as HTMLAudioElement & { webkitPreservesPitch?: boolean }).webkitPreservesPitch = true;
    media.onerror = () => {
      if (requestId !== currentRequest) return;
      update({ ...state, error: "音檔無法載入或播放，請檢查網路後按重播。" });
    };
    update({ text, rate: playbackRate, error: null });
    const onRejected = () => {
      if (requestId !== currentRequest) return;
      update({ ...state, error: state.error ?? "請按下方播放器的播放鍵，或點正常／慢速重播。" });
    };
    // Call play synchronously in the user's click; no fetch or synthesis await.
    try {
      void media.play().catch(onRejected);
    } catch {
      onRejected();
    }
  };

  return {
    speak,
    getAudio,
    getSnapshot: () => state,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    stop: () => {
      requestId++;
      clearAudio();
      update({ text: null, error: null, rate: SLOW_RATE });
    },
  };
}

export const speechPlayer = createSpeechPlayer(manifest.clips, import.meta.env.BASE_URL);
