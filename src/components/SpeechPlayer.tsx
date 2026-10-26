import { useEffect, useRef, useSyncExternalStore } from "react";
import { speechPlayer, SPEECH_VOICE, SLOW_RATE } from "../lib/speechAudio";

export default function SpeechPlayer() {
  const state = useSyncExternalStore(speechPlayer.subscribe, speechPlayer.getSnapshot);
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.text || !host.current) return;
    const audio = speechPlayer.getAudio();
    host.current.appendChild(audio);
    return () => { audio.remove(); };
  }, [state.text]);

  if (!state.text) return null;

  return (
    <section className="speech-player" aria-label="泰文發音">
      <div className="speech-player-heading">
        <strong>{SPEECH_VOICE}</strong>
        <button type="button" onClick={speechPlayer.stop} aria-label="關閉發音播放器">×</button>
      </div>
      <p lang="th">{state.text}</p>
      <div className="speech-player-actions">
        <button type="button" aria-pressed={state.rate === 1} onClick={() => speechPlayer.speak(state.text!, 1)}>
          正常重播
        </button>
        <button type="button" aria-pressed={state.rate === SLOW_RATE} onClick={() => speechPlayer.speak(state.text!, SLOW_RATE)}>
          慢速重播
        </button>
        <small>標準口語合成</small>
      </div>
      <div ref={host} />
      {state.error && <p className="speech-player-error" role="alert">{state.error}</p>}
    </section>
  );
}
