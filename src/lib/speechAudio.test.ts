import { describe, expect, it } from "vitest";
import { createSpeechPlayer } from "./speechAudio";

// Only the browser's media transport is substituted; source selection,
// interruption, rate and error state run through the production controller.
class MediaStub {
  src = "";
  currentTime = 0;
  playbackRate = 1;
  preservesPitch = false;
  preload = "";
  paused = true;
  onerror: (() => void) | null = null;
  nextPlay: Promise<void> = Promise.resolve();
  play() { this.paused = false; return this.nextPlay; }
  pause() { this.paused = true; }
  setAttribute() {}
  removeAttribute(name: string) { if (name === "src") this.src = ""; }
  load() {}
}

function setup() {
  const media = new MediaStub();
  const player = createSpeechPlayer(
    { "สวัสดี": "audio/hello.mp3", "ขอบคุณ": "audio/thanks.mp3" },
    "/thai-travel-notes/",
    () => media as unknown as HTMLAudioElement,
  );
  return { media, player };
}

describe("fixed MP3 pronunciation", () => {
  it("plays the requested recording at slow speed with original pitch", () => {
    const { media, player } = setup();
    player.speak("สวัสดี");
    expect(media.src).toBe("/thai-travel-notes/audio/hello.mp3");
    expect(media.paused).toBe(false);
    expect(media.playbackRate).toBe(0.71);
    expect(media.preservesPitch).toBe(true);
    expect(player.getSnapshot().error).toBeNull();
  });

  it("switches to the last word immediately and can stop pending playback", () => {
    const { media, player } = setup();
    player.speak("สวัสดี");
    media.currentTime = 1.2;
    player.speak("ขอบคุณ", 0.82);
    expect(media.src).toBe("/thai-travel-notes/audio/thanks.mp3");
    expect(media.currentTime).toBe(0);
    expect(media.playbackRate).toBe(0.82);
    player.stop();
    expect(media.paused).toBe(true);
    expect(media.src).toBe("");
    expect(player.getSnapshot().text).toBeNull();
  });

  it("replays the same recording at normal speed", () => {
    const { media, player } = setup();
    player.speak("สวัสดี");
    player.speak("สวัสดี", 1);
    expect(media.src).toBe("/thai-travel-notes/audio/hello.mp3");
    expect(media.playbackRate).toBe(1);
  });

  it("shows missing audio instead of playing another voice or leaving old audio running", () => {
    const { media, player } = setup();
    player.speak("สวัสดี");
    player.speak("unrecorded");
    expect(media.paused).toBe(true);
    expect(media.src).toBe("");
    expect(player.getSnapshot().error).toContain("尚未提供");
  });

  it("keeps the MP3 available for manual playback when play is rejected", async () => {
    const { media, player } = setup();
    media.nextPlay = Promise.reject(new Error("NotAllowedError"));
    player.speak("สวัสดี");
    await Promise.resolve();
    expect(player.getSnapshot().error).toContain("播放鍵");
    expect(media.src).toBe("/thai-travel-notes/audio/hello.mp3");
  });

  it("does not let an interrupted request's rejection overwrite the new word", async () => {
    const { media, player } = setup();
    let rejectOld!: (reason: Error) => void;
    media.nextPlay = new Promise<void>((_, reject) => { rejectOld = reject; });
    player.speak("สวัสดี");
    media.nextPlay = Promise.resolve();
    player.speak("ขอบคุณ");
    rejectOld(new Error("AbortError"));
    await Promise.resolve();
    expect(player.getSnapshot().text).toBe("ขอบคุณ");
    expect(player.getSnapshot().error).toBeNull();
  });

  it("reports media loading or decoding errors", () => {
    const { media, player } = setup();
    player.speak("สวัสดี");
    media.onerror?.();
    expect(player.getSnapshot().error).toContain("音檔");
  });

  it("notifies the shared player UI when another entry starts or stops", () => {
    const { player } = setup();
    const seen: (string | null)[] = [];
    const unsubscribe = player.subscribe(() => seen.push(player.getSnapshot().text));
    player.speak("สวัสดี");
    player.speak("ขอบคุณ");
    player.stop();
    unsubscribe();
    player.speak("สวัสดี");
    expect(seen).toEqual(["สวัสดี", "ขอบคุณ", null]);
  });
});
