import { useState } from "react";
import type { QuizExample, Token } from "../data/notes";
import SpeakButton from "./SpeakButton";
import { recordAnswer, weightOf } from "../lib/progress";
import { dedupeByThai } from "../lib/tokens";
import { safeGetItem, safeSetItem } from "../lib/storage";

type Mode = "roman-zh" | "zh-roman" | "cloze";

const MODE_LABEL: Record<Mode, string> = {
  "roman-zh": "拼音選中文",
  "zh-roman": "中文選拼音",
  cloze: "句子挖空",
};

interface Question {
  example: QuizExample;
  mode: Mode;
  options: string[];
  correctIndex: number;
  blankToken?: Token;
}

// 隊列裡的一題：是否曾經答錯過（答錯過的題目就不算「一次就答對」）。
interface QueueItem {
  question: Question;
  attemptedWrong: boolean;
}

function wordKey(example: QuizExample): string {
  return `${example.day}|${example.thai}`;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

// 依權重抽樣、不放回。答錯次數多的例句權重較高，更容易被抽到。
function weightedSample(pool: QuizExample[], count: number): QuizExample[] {
  const remaining = pool.map((example) => ({ example, weight: weightOf(wordKey(example)) }));
  const picked: QuizExample[] = [];
  const n = Math.min(count, remaining.length);
  for (let i = 0; i < n; i++) {
    const total = remaining.reduce((sum, r) => sum + r.weight, 0);
    let roll = Math.random() * total;
    let idx = 0;
    for (; idx < remaining.length - 1; idx++) {
      roll -= remaining[idx].weight;
      if (roll <= 0) break;
    }
    picked.push(remaining[idx].example);
    remaining.splice(idx, 1);
  }
  return picked;
}

// 只挖掉第一次出現的位置。泰文字沒有空格分詞，若用 split/join 整句取代，
// 遇到挖空的詞剛好是句子裡另一個詞的子字串時會炸開（同時挖錯地方或挖多處）。
function blankFirstOccurrence(sentence: string, target: string): string {
  const idx = sentence.indexOf(target);
  if (idx === -1) return sentence;
  return `${sentence.slice(0, idx)} ＿＿＿ ${sentence.slice(idx + target.length)}`;
}

function buildQuestions(pool: QuizExample[], mode: Mode, count: number): Question[] {
  const picked = weightedSample(pool, count);

  return picked.map((example) => {
    if (mode === "cloze") {
      const token = example.tokens[Math.floor(Math.random() * example.tokens.length)];
      const allTokens = pool.flatMap((e) => e.tokens);
      const distractors = shuffle(dedupeByThai(allTokens.filter((t) => t.thai !== token.thai)))
        .slice(0, 3)
        .map((t) => t.thai);
      const options = shuffle([token.thai, ...distractors]);
      return { example, mode, options, correctIndex: options.indexOf(token.thai), blankToken: token };
    }
    if (mode === "roman-zh") {
      const distractors = shuffle(pool.filter((e) => e.zh !== example.zh))
        .slice(0, 3)
        .map((e) => e.zh);
      const options = shuffle([example.zh, ...distractors]);
      return { example, mode, options, correctIndex: options.indexOf(example.zh) };
    }
    const distractors = shuffle(pool.filter((e) => e.roman !== example.roman))
      .slice(0, 3)
      .map((e) => e.roman);
    const options = shuffle([example.roman, ...distractors]);
    return { example, mode, options, correctIndex: options.indexOf(example.roman) };
  });
}

interface Props {
  pool: QuizExample[];
  maxDay: number;
  bookmarkedDays: Set<number>;
}

export default function ReviewQuiz({ pool, maxDay, bookmarkedDays }: Props) {
  const [phase, setPhase] = useState<"setup" | "playing" | "result">("setup");
  const [mode, setMode] = useState<Mode>("roman-zh");
  const [count, setCount] = useState(5);
  const [dayFrom, setDayFrom] = useState(1);
  const [dayTo, setDayTo] = useState(maxDay);
  const [bookmarkedOnly, setBookmarkedOnly] = useState(false);

  // activeItem 是「畫面上正在顯示、使用者正在作答／看解答」的題目，
  // 只有按下「下一題」才會換下一個，答題當下不會變——這樣答對/答錯的
  // 解答文字才會一直對應到正確的題目，不會答完就跳掉。
  const [activeItem, setActiveItem] = useState<QueueItem | null>(null);
  const [queue, setQueue] = useState<QueueItem[]>([]); // 排在 activeItem 後面、還沒出過的題目
  const [totalDistinct, setTotalDistinct] = useState(0);
  const [masteredCount, setMasteredCount] = useState(0);
  const [firstTryCorrect, setFirstTryCorrect] = useState(0);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [selfGrade, setSelfGrade] = useState<"correct" | "wrong" | null>(null);
  const [best, setBest] = useState<number>(() => Number(safeGetItem("thai-quiz-best") || 0));

  const rangePool = pool.filter(
    (q) => q.day >= dayFrom && q.day <= dayTo && (!bookmarkedOnly || bookmarkedDays.has(q.day))
  );
  const current = activeItem?.question;

  const startQuiz = () => {
    const qs = buildQuestions(rangePool, mode, count).map((question) => ({ question, attemptedWrong: false }));
    setActiveItem(qs[0] ?? null);
    setQueue(qs.slice(1));
    setTotalDistinct(qs.length);
    setMasteredCount(0);
    setFirstTryCorrect(0);
    setLastCorrect(null);
    setSelected(null);
    setAnswered(false);
    setRevealed(false);
    setSelfGrade(null);
    setPhase("playing");
  };

  // 只記錄結果、更新「一次就答對」計數，不移動題目——題目要等使用者
  // 按「下一題」才會真的往後推，畫面上的解答才不會跟著跳掉。
  const settleAnswer = (isCorrect: boolean) => {
    if (!activeItem) return;
    recordAnswer(wordKey(activeItem.question.example), isCorrect);
    if (isCorrect && !activeItem.attemptedWrong) {
      setFirstTryCorrect((c) => c + 1);
    }
    setLastCorrect(isCorrect);
  };

  const pickOption = (i: number) => {
    if (answered || !current) return;
    setSelected(i);
    setAnswered(true);
    settleAnswer(i === current.correctIndex);
  };

  const grade = (isCorrect: boolean) => {
    if (selfGrade || !activeItem) return;
    setSelfGrade(isCorrect ? "correct" : "wrong");
    settleAnswer(isCorrect);
  };

  const goNext = () => {
    if (!activeItem || lastCorrect === null) return;

    let nextQueue = queue;
    if (lastCorrect) {
      setMasteredCount((c) => c + 1);
    } else {
      // 答錯的題目排到隊列尾端，之後還會再出一次，直到答對為止。
      nextQueue = [...queue, { ...activeItem, attemptedWrong: true }];
    }

    const nextActive = nextQueue[0] ?? null;
    setActiveItem(nextActive);
    setQueue(nextQueue.slice(1));
    setLastCorrect(null);
    setSelected(null);
    setAnswered(false);
    setRevealed(false);
    setSelfGrade(null);

    if (nextActive === null) {
      const pct = Math.round((firstTryCorrect / totalDistinct) * 100);
      if (pct > best) {
        safeSetItem("thai-quiz-best", String(pct));
        setBest(pct);
      }
      setPhase("result");
    }
  };

  if (phase === "setup") {
    return (
      <section className="review-quiz" id="review-quiz" aria-label="複習測驗">
        <div className="review-heading">
          <div>
            <span>REVIEW QUIZ</span>
            <h2>複習測驗</h2>
            <p>從 {pool.length} 個情境例句隨機出題，答錯的字更容易再被抽到，不使用 AI，也不消耗 Token。</p>
          </div>
          <b>最高 {best}%</b>
        </div>
        <div className="review-setup">
          <fieldset>
            <legend>測驗模式</legend>
            {(Object.keys(MODE_LABEL) as Mode[]).map((m) => (
              <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                {MODE_LABEL[m]}
              </button>
            ))}
          </fieldset>
          <fieldset>
            <legend>題目數量</legend>
            {[5, 10, 20].map((c) => (
              <button key={c} className={count === c ? "active" : ""} onClick={() => setCount(c)}>
                {c} 題
              </button>
            ))}
          </fieldset>
          <fieldset className="day-range">
            <legend>Day 範圍</legend>
            <label>
              從{" "}
              <input
                aria-label="起始 Day"
                type="number"
                min={1}
                max={maxDay}
                value={dayFrom}
                onChange={(e) => setDayFrom(Number(e.target.value) || 1)}
              />
            </label>
            <span>～</span>
            <label>
              到{" "}
              <input
                aria-label="結束 Day"
                type="number"
                min={1}
                max={maxDay}
                value={dayTo}
                onChange={(e) => setDayTo(Number(e.target.value) || maxDay)}
              />
            </label>
            <small>共 {rangePool.length} 個例句</small>
          </fieldset>
          {bookmarkedDays.size > 0 && (
            <label className="review-bookmark-only">
              <input
                type="checkbox"
                checked={bookmarkedOnly}
                onChange={(e) => setBookmarkedOnly(e.target.checked)}
              />
              只考收藏的（{bookmarkedDays.size} 天）
            </label>
          )}
          <button className="review-start" disabled={rangePool.length === 0} onClick={startQuiz}>
            開始測驗 →
          </button>
        </div>
      </section>
    );
  }

  if (phase === "result") {
    const pct = Math.round((firstTryCorrect / totalDistinct) * 100);
    return (
      <section className="review-quiz" id="review-quiz" aria-label="複習測驗">
        <div className="review-result">
          <span>本次成績（一次就答對的比例）</span>
          <strong>
            {pct}%<small> / {firstTryCorrect} 題一次答對，共 {totalDistinct} 題</small>
          </strong>
          <h3>{pct >= 80 ? "太厲害了！" : pct >= 50 ? "不錯，繼續加油！" : "再多複習幾次吧！"}</h3>
          <p>目前最高紀錄 {best}%</p>
          <div>
            <button className="active" onClick={() => setPhase("setup")}>
              再測一次 →
            </button>
          </div>
        </div>
      </section>
    );
  }

  // playing
  if (!current) return null;

  const willFinishNext = lastCorrect === true && queue.length === 0;

  return (
    <section className="review-quiz" id="review-quiz" aria-label="複習測驗">
      <div className="review-playing">
        <div className="review-progress">
          <i style={{ width: `${(masteredCount / totalDistinct) * 100}%` }} />
        </div>
        <small>
          已掌握 {masteredCount} / {totalDistinct} 題 · {MODE_LABEL[mode]}
        </small>

        {current.mode === "roman-zh" && (
          <div className="quiz-prompt-row">
            <h3>{current.example.roman}</h3>
            <SpeakButton text={current.example.thai} />
          </div>
        )}
        {current.mode === "zh-roman" && <h3>{current.example.zh}</h3>}
        {current.mode === "cloze" && (
          <h3 lang="th">
            {blankFirstOccurrence(current.example.thai, current.blankToken!.thai)}
            <br />
            <span className="review-thai">{current.example.zh}</span>
          </h3>
        )}

        {current.mode !== "cloze" && (
          <div className="review-options">
            {current.options.map((opt, i) => {
              let cls = "";
              if (answered) {
                if (i === current.correctIndex) cls = "correct";
                else if (i === selected) cls = "wrong";
                else cls = "muted";
              }
              return (
                <button key={i} className={cls} disabled={answered} onClick={() => pickOption(i)}>
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {current.mode === "cloze" && !revealed && (
          <button className="review-reveal" onClick={() => setRevealed(true)}>
            揭曉答案
          </button>
        )}

        {(answered || (current.mode === "cloze" && revealed)) && (
          <div className={`review-feedback ${current.mode !== "cloze" && selected !== current.correctIndex ? "bad" : ""}`}>
            {current.mode === "cloze" ? (
              <>
                <div className="review-feedback-row">
                  <p className="review-roman" lang="th">
                    {current.example.thai}
                  </p>
                  <SpeakButton text={current.example.thai} size="sm" />
                </div>
                <em>{current.example.roman}</em>
                <span>{current.example.zh}</span>
              </>
            ) : (
              <>
                <div className="review-feedback-row">
                  <p lang="th">{current.example.thai}</p>
                  <SpeakButton text={current.example.thai} size="sm" />
                </div>
                <em>{current.example.roman}</em>
                <span>{current.example.zh}</span>
              </>
            )}
            <div className="review-tokens">
              {current.example.tokens.map((t, i) => (
                <i key={i}>
                  <div className="token-top">
                    <b lang="th">{t.thai}</b>
                    <SpeakButton text={t.thai} size="sm" rate={0.82} />
                  </div>
                  <small>{t.roman}</small>
                  <span>{t.zh}</span>
                </i>
              ))}
            </div>

            {current.mode === "cloze" && (
              <div className="self-grade">
                <span>我這題答對了嗎？</span>
                <button className={selfGrade === "correct" ? "active correct" : ""} disabled={!!selfGrade} onClick={() => grade(true)}>
                  ✓ 答對了
                </button>
                <button className={selfGrade === "wrong" ? "active wrong" : ""} disabled={!!selfGrade} onClick={() => grade(false)}>
                  ✗ 答錯了
                </button>
              </div>
            )}
          </div>
        )}

        <div className="review-actions">
          <button className="review-quit" onClick={() => setPhase("setup")}>
            結束測驗
          </button>
          <button
            className="review-next"
            disabled={current.mode === "cloze" ? !selfGrade : !answered}
            onClick={goNext}
          >
            {willFinishNext ? "看成績 →" : "下一題 →"}
          </button>
        </div>
      </div>
    </section>
  );
}
