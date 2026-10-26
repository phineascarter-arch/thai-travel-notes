# Premwadee MP3 Implementation Plan

> Execute inline using executing-plans; user approved implementation, GitHub main submission and production deployment.

**Goal:** Use fixed Premwadee Neural MP3 for every existing pronunciation entry.

**Architecture:** Collect typed note content into a deterministic manifest; generate static audio assets; replace the shared speech hook with a single audio controller and visible playback/error controls.

**Tech Stack:** React, TypeScript, Vitest, Python edge-tts, mutagen, FFmpeg.

## Constraints

Voice `th-TH-PremwadeeNeural`, synthesis rate `+0%`, pitch `+0Hz`, volume `+0%`. No device-voice fallback. Preserve current website content and unrelated local changes.

## Tasks

- [x] Collect all notes, examples and tokens using `node scripts/collect-speech.mjs`; generate manifest with deduplicated text and content-derived filenames (82 notes, 789 clips).
- [x] Generate each MP3 with `python scripts/generate-speech.py`; resume valid existing clips and retry a failed clip at most three times per run. All 789 clips verified with mutagen and FFmpeg: 9,817,344 bytes, 1,636.2 seconds.
- [x] Write failing coverage and audio-controller tests: missing clip, exact requested clip, latest request wins, slow pitch-preserving playback, stop, play rejection, stale rejection, decode error, normal replay.
- [x] Implement `src/lib/speechAudio.ts` and adapt `src/hooks/useSpeech.ts`; add `src/components/SpeechPlayer.tsx` with native controls, normal/slow buttons, close and visible errors; update button labels and README.
- [x] Run targeted and existing Vitest suites (37 tests passed), `npm run lint`, `npm run build`, full audio validation and browser playback checks at 1.0 and 0.71 speed. Verified word playback at 0.82, latest-click interruption, source selection, record playback/stop and mobile-width controls. No physical iPhone test was available.
- [ ] Review staged changes, commit only this feature, push main without force, wait for Vercel success and inspect deployed playback.
