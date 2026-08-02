import { useCallback, useEffect, useState } from "react";

// Chrome 有一個很經典的 bug：SpeechSynthesisUtterance 物件如果只是函式裡的
// 區域變數、沒有其他地方持續參照住，瀏覽器只會「弱引用」它。語音還在合成
// 播放的當下，JS 的垃圾回收（GC）隨時可能把這個物件收走，導致開頭音節被
// 硬生生截斷。解法是用一個模組層級的變數把「正在播放」的 utterance 強引用
// 住，直到播放結束或出錯才放掉。
let activeUtterance: SpeechSynthesisUtterance | null = null;

// 用瀏覽器內建的 Web Speech API 播放泰文發音。
// 音質取決於裝置系統內建的泰文語音包（iPhone 需在
// 設定 > 輔助使用 > 語音內容 > 聲音 > 泰文 先下載一次）。
export function useSpeech() {
  const supported = typeof window !== "undefined" && "speechSynthesis" in window;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!supported) return;
    const load = () => setVoices(window.speechSynthesis.getVoices());
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, [supported]);

  const thaiVoice = voices.find((v) => v.lang?.toLowerCase().startsWith("th"));

  const speak = useCallback(
    (text: string, rate = 0.65) => {
      if (!supported) return;
      const synth = window.speechSynthesis;

      const doSpeak = () => {
        // 音訊管線啟動本身也有一點延遲，就算前面沒有任何語音在播、單獨點一次
        // 也偶爾會發生。在真正內容前面墊一個逗號當緩衝——逗號不會被念出來，
        // 只會造成一個很短的停頓，讓管線啟動的延遲去吃這個停頓，而不是吃到
        // 真正的第一個音節。
        const utter = new SpeechSynthesisUtterance(`, , ${text}`);
        utter.lang = "th-TH";
        if (thaiVoice) utter.voice = thaiVoice;
        utter.rate = rate;
        utter.onend = () => {
          if (activeUtterance === utter) activeUtterance = null;
        };
        utter.onerror = () => {
          if (activeUtterance === utter) activeUtterance = null;
        };
        activeUtterance = utter; // 強引用住，播放完成前不能被 GC 回收
        synth.speak(utter);
      };

      if (synth.speaking || synth.pending) {
        // 打斷上一個還在播放的語音時才需要留緩衝：cancel() 之後瀏覽器要一點
        // 時間才會真的清空音訊管線，緊接著 speak() 常常會把新語音的開頭吃掉，
        // 短單字（像逐詞拆解）音檔本來就短，吃掉的比例感覺特別明顯。單純點一次、
        // 沒有其他語音在播放時不會走到這個分支，不會有延遲感。
        synth.cancel();
        setTimeout(doSpeak, 100);
      } else {
        doSpeak();
      }
    },
    [supported, thaiVoice]
  );

  // 讓呼叫端可以主動打斷還在播放的語音（例如使用者手動把唱片從撥放器
  // 上拿下來，不想等它自然播完）。
  const stop = useCallback(() => {
    if (!supported) return;
    window.speechSynthesis.cancel();
  }, [supported]);

  return { speak, stop, supported, hasThaiVoice: !!thaiVoice, voiceName: thaiVoice?.name ?? null };
}
