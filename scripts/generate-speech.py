"""Generate/resume fixed Premwadee clips, or validate every shipped MP3.

Install scripts/requirements-speech.txt in a venv, then:
  node scripts/collect-speech.mjs
  python scripts/generate-speech.py
  python scripts/generate-speech.py --validate-only
"""
import argparse
import asyncio
import json
import subprocess
from pathlib import Path

import edge_tts
import imageio_ffmpeg
from mutagen.mp3 import MP3

ROOT = Path(__file__).resolve().parents[1]
VOICE = "th-TH-PremwadeeNeural"


def valid(path):
    try:
        return path.stat().st_size > 0 and MP3(path).info.length > 0
    except Exception:
        return False


async def generate(clips, concurrency):
    semaphore = asyncio.Semaphore(concurrency)
    completed = 0
    failures = []

    async def one(text, relative):
        nonlocal completed
        path = ROOT / "public" / relative
        async with semaphore:
            if not valid(path):
                path.parent.mkdir(parents=True, exist_ok=True)
                temporary = path.with_suffix(".part.mp3")
                for attempt in range(3):
                    try:
                        await edge_tts.Communicate(
                            text, voice=VOICE, rate="+0%", pitch="+0Hz", volume="+0%",
                        ).save(str(temporary))
                        if not valid(temporary):
                            raise ValueError("Empty or invalid MP3")
                        temporary.replace(path)
                        break
                    except Exception as error:
                        temporary.unlink(missing_ok=True)
                        if attempt == 2:
                            failures.append({"text": text, "error": str(error)})
                            print(f"Failed {relative}: {error}", flush=True)
                        else:
                            await asyncio.sleep(3 * (attempt + 1))
            completed += 1
            if completed % 25 == 0 or completed == len(clips):
                print(f"Processed {completed}/{len(clips)}, failures={len(failures)}", flush=True)

    await asyncio.gather(*(one(text, relative) for text, relative in clips.items()))
    if failures:
        print(json.dumps(failures, ensure_ascii=True, indent=2))
        raise SystemExit(f"Failed to generate {len(failures)} clips; voice was not substituted")


def validate(clips):
    executable = imageio_ffmpeg.get_ffmpeg_exe()
    total_bytes = 0
    total_seconds = 0
    for relative in clips.values():
        path = ROOT / "public" / relative
        if not valid(path):
            raise SystemExit(f"Missing/invalid MP3: {relative}")
        result = subprocess.run(
            [executable, "-v", "error", "-xerror", "-i", str(path), "-f", "null", "-"],
            capture_output=True, text=True,
        )
        if result.returncode or result.stderr.strip():
            raise SystemExit(f"Cannot decode {relative}: {result.stderr}")
        total_bytes += path.stat().st_size
        total_seconds += MP3(path).info.length
    print(f"Decoded {len(clips)} MP3s; {total_bytes} bytes; {total_seconds:.1f} seconds", flush=True)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--validate-only", action="store_true")
    parser.add_argument("--concurrency", type=int, default=4)
    parser.add_argument("--limit", type=int)
    args = parser.parse_args()
    manifest = json.loads((ROOT / "src/data/speech-manifest.json").read_text(encoding="utf-8"))
    if manifest["voice"] != VOICE:
        raise SystemExit("Unexpected manifest voice")
    clips = dict(list(manifest["clips"].items())[:args.limit]) if args.limit else manifest["clips"]
    if not args.validate_only:
        asyncio.run(generate(clips, args.concurrency))
    validate(clips)
