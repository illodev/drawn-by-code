"""Word-level times of a song's vocals, on this machine (no paid service): faster-whisper on CPU.

  pip install faster-whisper
  python3 -I tools/transcribe.py medium.en private/song.mp3 out/words-medium.json

medium.en took 76 s for 4:11 on four cores. Do not pass the lyrics as a prompt: on a clip it
echoed the prompt back as one long segment with no usable word times. A section it skips
(here the whole of chorus 2) is recovered from an identical section by the bar difference,
then checked on a clip of that section. Word starts after a gap are early (a held word
swallows the silence before it); ends are reliable. The output stays in out/ (lyrics are the
song's), only times go into the edit.
"""
import sys, json, time, subprocess
import numpy as np
from faster_whisper import WhisperModel

model_name, audio, out = sys.argv[1], sys.argv[2], sys.argv[3]
t0 = time.time()
# decoded by ffmpeg: the installed PyAV does not take faster-whisper's open() arguments
x = np.frombuffer(subprocess.run(['ffmpeg', '-v', 'error', '-i', audio, '-ac', '1', '-ar', '16000',
                                  '-f', 'f32le', '-'], capture_output=True).stdout, np.float32)
m = WhisperModel(model_name, device='cpu', compute_type='int8', cpu_threads=4)
segs, info = m.transcribe(x, language='en', word_timestamps=True, vad_filter=False, beam_size=5,
                          condition_on_previous_text=False)
words = []
for s in segs:
    print('%7.2f-%7.2f %s' % (s.start, s.end, s.text), flush=True)
    for w in s.words:
        words.append({'w': w.word.strip(), 's': round(w.start, 2), 'e': round(w.end, 2), 'p': round(w.probability, 2)})
json.dump(words, open(out, 'w'), indent=0)
print('took %.0f s, %d words' % (time.time() - t0, len(words)))
