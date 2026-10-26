import { speechPlayer, SPEECH_VOICE } from "../lib/speechAudio";

// Every entry uses the same pre-generated Premwadee Neural MP3 library.
export function useSpeech() {
  return {
    speak: speechPlayer.speak,
    stop: speechPlayer.stop,
    supported: typeof window !== "undefined" && typeof Audio !== "undefined",
    voiceName: SPEECH_VOICE,
  };
}
