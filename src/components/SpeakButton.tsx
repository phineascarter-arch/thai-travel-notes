import { useSpeech } from "../hooks/useSpeech";

interface Props {
  text: string;
  size?: "md" | "sm";
  withLabel?: boolean;
  // MP3 播放速度：整句預設 0.71；逐詞拆解沿用 0.82，保留原音高。
  rate?: number;
}

export default function SpeakButton({ text, size = "md", withLabel = false, rate }: Props) {
  const { speak, supported, voiceName } = useSpeech();

  if (!supported) return null;

  const title = `播放發音（${voiceName}／MP3）`;

  return (
    <button
      type="button"
      className={`speak-btn ${size === "sm" ? "speak-btn-sm" : ""}`}
      title={title}
      aria-label="播放發音"
      onClick={(e) => {
        e.stopPropagation();
        speak(text, rate);
      }}
    >
      🔊{withLabel && <span> 播放</span>}
    </button>
  );
}
