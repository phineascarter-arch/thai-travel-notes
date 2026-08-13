import { useEffect, useMemo, useState, type KeyboardEvent } from "react";
import { CATEGORIES, sortedNotes, quizPool, type Category } from "./data/notes";
import ReviewQuiz from "./components/ReviewQuiz";
import NoteModal from "./components/NoteModal";
import RecordWall from "./components/RecordWall";
import SpeakButton from "./components/SpeakButton";
import AyutthayaCanal from "./components/AyutthayaCanal";
import { recordVisitToday, getStreak } from "./lib/progress";

const GOAL_DAYS = 100;

// 卡片本身用 div 模擬按鈕（而不是 <button>），才能在裡面安全放進真正的
// <button>（發音按鈕）。瀏覽器不允許 <button> 裡面再放 <button>。
function openOnEnterOrSpace(onOpen: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onOpen();
    }
  };
}

function App() {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"全部" | Category>("全部");
  const [openDay, setOpenDay] = useState<number | null>(null);

  const maxDay = sortedNotes[0]?.day ?? 0;

  const [streak, setStreak] = useState(0);
  useEffect(() => {
    recordVisitToday();
    setStreak(getStreak());
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedNotes.filter((n) => {
      const matchesCategory = activeCategory === "全部" || n.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      return (
        n.thai.toLowerCase().includes(q) ||
        n.roman.toLowerCase().includes(q) ||
        n.zh.toLowerCase().includes(q)
      );
    });
  }, [query, activeCategory]);

  const featured = sortedNotes.slice(0, 4);
  const recent = sortedNotes.slice(0, 3);
  const openNote = openDay != null ? sortedNotes.find((n) => n.day === openDay) ?? null : null;
  const openIndex = openNote ? sortedNotes.findIndex((n) => n.day === openNote.day) : -1;

  return (
    <main>
      <header className="topbar">
        <a className="brand" href="#top">
          <span>泰文手帳</span>
          <small>旅遊基礎對話</small>
        </a>
        <nav aria-label="主要導覽">
          <a href="#timeline">時間軸</a>
          <a href="#topics">主題</a>
          <a href="#review-quiz">複習測驗</a>
          <a href="#ayutthaya-canal">AYUTTHAYA</a>
        </nav>
      </header>

      <section className="hero" id="top">
        <p className="eyebrow">SA-WÀT-DII · สวัสดี</p>
        <h1>我的泰文旅行手帳</h1>
        <p className="thai-title">สมุดโน้ตภาษาไทยสำหรับนักท่องเที่ยว</p>
        <p className="hero-sub">每天學一句，下次去泰國自助旅行就能自己開口</p>
      </section>

      <RecordWall />

      <section className="note-wall" aria-label="精選筆記">
        <span className="doodle doodle-one">ไทย</span>
        <span className="doodle doodle-two">✈</span>
        <div className="wall-scroll">
          {featured.map((n, i) => (
            <div
              key={n.day}
              className={`polaroid tilt-${(i % 4) + 1}`}
              role="button"
              tabIndex={0}
              aria-label={`Day ${n.day}：${n.thai}，${n.zh}，開啟筆記`}
              onClick={() => setOpenDay(n.day)}
              onKeyDown={openOnEnterOrSpace(() => setOpenDay(n.day))}
            >
              <span className="tape" />
              <span className="polaroid-day">DAY {n.day}</span>
              <div className="polaroid-word-row">
                <strong lang="th">{n.thai}</strong>
                <SpeakButton text={n.thai} size="sm" />
              </div>
              <em>{n.roman}</em>
              <span>{n.zh}</span>
            </div>
          ))}
          <blockquote>
            會用<br />比會背<br />更重要。
            <small>— 旅行泰文手帳</small>
          </blockquote>
        </div>
        <a className="wall-cta" href="#timeline">
          看全部 {sortedNotes.length} 篇筆記 →
        </a>
      </section>

      <section className="intro-grid">
        <div>
          <p className="section-kicker">SA-WÀT-DII 👋</p>
          <h2>旅遊路上，一天記住一句就夠</h2>
          <p className="lead">
            這裡整理旅泰時最常用到的對話——機場、住宿、點餐、殺價、閒聊，每句都附拼音、中文意思和逐詞拆解，出發前每天翻一頁。
          </p>
          <label className="search-box">
            <span>⌕</span>
            <input
              placeholder="搜尋單字、拼音或中文……"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
        </div>
      </section>

      <section className="topics" id="topics">
        <b>主題：</b>
        <button className={activeCategory === "全部" ? "active" : ""} onClick={() => setActiveCategory("全部")}>
          全部 {sortedNotes.length}
        </button>
        {CATEGORIES.map((c) => (
          <button key={c} className={activeCategory === c ? "active" : ""} onClick={() => setActiveCategory(c)}>
            {c}
          </button>
        ))}
      </section>

      <ReviewQuiz pool={quizPool} maxDay={maxDay} />

      <AyutthayaCanal />

      <section className="content-grid" id="timeline">
        <div className="timeline-list">
          <div className="list-heading">
            <div>
              <span>LEARNING TIMELINE</span>
              <h2>全部學習筆記</h2>
            </div>
            <small>{filtered.length} 篇</small>
          </div>

          {filtered.length === 0 && <div className="empty">找不到符合的筆記，換個關鍵字試試？</div>}

          {filtered.map((n) => (
            <div
              key={n.day}
              className={`note-row ${n.day === maxDay ? "latest" : ""}`}
              role="button"
              tabIndex={0}
              aria-label={`Day ${n.day}：${n.thai}，${n.zh}，開啟筆記`}
              onClick={() => setOpenDay(n.day)}
              onKeyDown={openOnEnterOrSpace(() => setOpenDay(n.day))}
            >
              <div className="note-meta">
                <span>Day {n.day}</span>
                <time>{n.date}</time>
              </div>
              <div className="note-main">
                <strong lang="th">{n.thai}</strong>
                <SpeakButton text={n.thai} size="sm" />
                <em>{n.roman}</em>
                <b>{n.zh}</b>
              </div>
              <div className="note-foot">
                <span>{n.category}</span>
                <i>閱讀筆記 ↗</i>
              </div>
            </div>
          ))}
        </div>

        <aside className="sidebar">
          <div className="progress-card">
            <span>連續學習</span>
            <div>
              <b>{streak}</b>
              <small> / {GOAL_DAYS} 天</small>
            </div>
            <div className="progress-track">
              <i style={{ width: `${Math.min(100, (streak / GOAL_DAYS) * 100)}%` }} />
            </div>
            <p>
              <span>{sortedNotes.length} 個單字</span>
              <span>持續更新中</span>
            </p>
            <q>每天一句，出國那天就能自己開口。</q>
          </div>

          <div className="side-card popular">
            <p className="side-title">📌 最近複習</p>
            {recent.map((n) => (
              <div
                key={n.day}
                className="popular-row"
                role="button"
                tabIndex={0}
                aria-label={`Day ${n.day}：${n.thai}，${n.zh}，開啟筆記`}
                onClick={() => setOpenDay(n.day)}
                onKeyDown={openOnEnterOrSpace(() => setOpenDay(n.day))}
              >
                <span className="popular-word-row">
                  <b lang="th">{n.thai}</b>
                  <SpeakButton text={n.thai} size="sm" />
                </span>
                <span className="popular-meta">
                  {n.zh} · D{n.day}
                </span>
              </div>
            ))}
          </div>

          <div className="tip-card">
            ✎ 小提醒
            <br />
            每句話開口練習 3 次，比默背 10 次更容易記住。
          </div>
        </aside>
      </section>

      <footer>
        <div>
          <b>泰文手帳</b>
          <span>สมุดโน้ตภาษาไทยสำหรับนักท่องเที่ยว</span>
        </div>
        <p>每天學一句，慢慢靠近能自在旅行的那一天。</p>
      </footer>

      {openNote && (
        <NoteModal
          note={openNote}
          hasPrev={openIndex < sortedNotes.length - 1}
          hasNext={openIndex > 0}
          onClose={() => setOpenDay(null)}
          onPrev={() => setOpenDay(sortedNotes[openIndex + 1].day)}
          onNext={() => setOpenDay(sortedNotes[openIndex - 1].day)}
        />
      )}
    </main>
  );
}

export default App;
