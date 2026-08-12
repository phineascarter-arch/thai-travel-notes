import { useCallback, useEffect, useState } from "react";

// Chrome 有一個很經典的 bug：SpeechSynthesisUtterance 物件如果只是函式裡的
// 區域變數、沒有其他地方持續參照住，瀏覽器只會「弱引用」它。語音還在合成
// 播放的當下，JS 的垃圾回收（GC）隨時可能把這個物件收走，導致開頭音節被
// 硬生生截斷。解法是用一個模組層級的變數把「正在播放」的 utterance 強引用
// 住，直到播放結束或出錯才放掉。
let activeUtterance: SpeechSynthesisUtterance | null = null;

// 每次呼叫 speak() 都會拿到一個遞增的編號。快速連點好幾個不同的發音
// 按鈕時，用來判斷「這次排隊等著播放的請求，是不是已經被後來更新的
// 點擊取代了」——是的話就直接放棄不播，只讓使用者最後點的那句話真的
// 出聲，避免聽到一串跟畫面對不上的舊發音依序播完。
let latestRequestId = 0;

// 用瀏覽器內建的 Web Speech API 播放泰文發音。
// 音質取決於裝置系統內建的泰文語音包（iPhone 需在
// 設定 > 輔助使用 > 語音內容 > 聲音 > 泰文 先下載一次）。
export function useSpeech() {
  const supported = typeof window !== "undefined" && !!window.speechSynthesis;
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
      const requestId = ++latestRequestId;

      const doSpeak = () => {
        // 在等待下面那段 100ms 緩衝期間，如果使用者又點了別的發音按鈕
        // （requestId 被後來的呼叫超車），這次排隊中的播放就直接放棄、
        // 不要真的念出來——不然快速點好幾個不同的字/句子時，會聽到
        // 排隊播放一串跟畫面上正在看的內容對不上的舊發音。
        if (requestId !== latestRequestId) return;

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

      // 除了瀏覽器回報的 synth.speaking/pending，也一併檢查 activeUtterance
      // 這個我們自己同步設定的旗標——手機瀏覽器（尤其 iOS Safari）呼叫
      // synth.speak() 之後，speaking 常常要過一小段時間才會真的變 true。
      // 這段空窗期如果連續點兩個不同的發音按鈕，兩次呼叫都只看
      // synth.speaking/pending 會誤判成「目前沒在播」，各自直接呼叫
      // synth.speak()、沒有互相 cancel，瀏覽器就會把兩句話排隊依序播完，
      // 聽起來像是點了這句、卻先聽到（或被插入）另一句不相干的發音。
      // activeUtterance 不受瀏覽器回報延遲影響，能補上這段空窗期。
      if (activeUtterance != null || synth.speaking || synth.pending) {
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
  // 上拿下來，不想等它自然播完）。順便讓還在 100ms 緩衝期、還沒真的
  // 念出來的排程作廢，不然叫停之後過一下子又會突然冒出聲音。
  const stop = useCallback(() => {
    if (!supported) return;
    latestRequestId++;
    window.speechSynthesis.cancel();
  }, [supported]);

  return { speak, stop, supported, hasThaiVoice: !!thaiVoice, voiceName: thaiVoice?.name ?? null };
}
