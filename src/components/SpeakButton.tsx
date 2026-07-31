import { useSpeech } from "../hooks/useSpeech";

interface Props {
  text: string;
  size?: "md" | "sm";
  withLabel?: boolean;
  // 語速：整句例句維持慢速（預設 0.65）方便學習；逐詞拆解的短字用快一點的
  // 語速（建議 0.82），因為語速越慢，瀏覽器偶發的開頭截斷佔短音檔的比例
  // 就越高，感覺特別明顯。
  rate?: number;
}

export default function SpeakButton({ text, size = "md", withLabel = false, rate }: Props) {
  const { speak, supported, hasThaiVoice, voiceName } = useSpeech();

  if (!supported) return null;

  const title = hasThaiVoice
    ? `播放發音（語音：${voiceName}）`
    : "播放發音（iPhone 建議先在設定下載泰文語音包，發音會更準；找不到泰文語音時瀏覽器可能會用預設語音硬唸）";

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
