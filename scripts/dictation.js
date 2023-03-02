const DeepSpeech = require('deepspeech');
const { Readable } = require('stream');

const modelPath = './models/deepspeech-0.9.3-models.pbmm';
const scorerPath = './models/deepspeech-0.9.3-models.scorer';
const beamWidth = 500;
const lmAlpha = 0.75;
const lmBeta = 1.85;

const model = new DeepSpeech.Model(modelPath, beamWidth);
model.enableExternalScorer(scorerPath);
model.setScorerAlphaBeta(lmAlpha, lmBeta);

function transcribe(audioStream) {
  console.log("doing stuff");
  const microphoneStream = Readable({
    objectMode: true,
    read() {}
  });

  audioStream.connect(microphoneStream);

  microphoneStream.on('data', audioBuffer => {
    const result = model.stt(audioBuffer);
    console.log(`Transcription: ${result}`);
  });
}
module.exports = {
    DeepSpeech,
    transcribe
  };