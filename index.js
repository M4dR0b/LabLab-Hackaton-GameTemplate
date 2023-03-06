import express from 'express';
import path from 'path';
import multer from 'multer';
import fs from 'fs';
import { spawn } from 'child_process';
// import axios from'axios';
import fetch from 'node-fetch';

const __dirname = process.cwd();

// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/scripts')
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + '-' + Date.now())
  }
})
var upload = multer({ storage: storage })

const app = express();
const port = process.env.PORT || 3000;

app.use((req, res, next) => {
  if (req.url.endsWith('.js')) {
    res.setHeader('Content-Type', 'text/javascript');
  }
  next();
});

app.use(express.static('public'));
app.use(express.static('uploads'));

app.post('/process-json', upload.single('json'), (req, res) => {
  const jsonFilePath = req.file.path;

  console.log("req.file:", req.file);

  // read JSON data from the file
  const json = fs.readFileSync(jsonFilePath, 'utf-8');

  // write the JSON data to a new file in the uploads folder
  const newFilePath = `public/scripts/${req.file.originalname}`;
  fs.writeFileSync(newFilePath, json);

  // send a response to the client
  res.send(`File ${newFilePath} uploaded successfully`);

  // delete the original JSON file
  fs.unlinkSync(jsonFilePath);
});

// create a POST route for /transcribe
app.post('/transcribe', upload.single('audio'), (req, res) => {
  const webmFilePath = req.file.path;
  const wavFilePath = `${path.parse(webmFilePath).dir}/${path.parse(webmFilePath).name}.wav`;

  console.log(webmFilePath);
  console.log(wavFilePath);

  // convert webm to wav format using ffmpeg
  const ffmpegArgs = ['-i', webmFilePath, '-vn', '-acodec', 'pcm_s16le', '-ar', '16000', '-ac', '1', '-y', wavFilePath];

  console.log(ffmpegArgs);

  const ffmpeg = spawn("ffmpeg", ffmpegArgs, { stdio: "inherit" });
  ffmpeg.on('exit', (code) => {
    if (code !== 0) {
      console.error(`ffmpeg process exited with code ${code}`);
      return;
    }

    // read audio data from the wav file
    const audio = fs.readFileSync(wavFilePath);

    // Convert the audio buffer to a 16-bit depth and make its length even
    const modifiedAudio = new Int16Array(audio.length / 2 + audio.length % 2);
    for (let i = 0; i < audio.length; i += 2) {
      const uint = new Uint16Array(audio.slice(i, i + 2));
      modifiedAudio[i / 2] = uint[0];
    }

    // create a new stream from the modified audio buffer
    const stream = model.createStream();

    // feed the modified audio data into the stream
    stream.feedAudioContent(audio);

    // get the transcription from the stream
    let transcription = stream.finishStream();

    // send the transcription back to the client
    res.send(transcription);

    // delete the wav file
    fs.unlinkSync(wavFilePath);
    fs.unlinkSync(webmFilePath);
  });
});


app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/game', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'game-index.html'));
});

app.get('/dalle', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dall-e-index.html'));
});
app.get('/test', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'anythingWorld_index.html'));
});
app.get('/lms', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lms-index.html'));
});

app.get('/openai-api/dall-e', (req, res) => {

  let options = req.data;
  
  // let subject = "science"
  const prompt = `fun and colorful science correct answer icon, flat vector graphic`;
  const size = "512x512";
  fetch('https://api.openai.com/v1/images/generations', {
    method: "POST",
    headers: {
      Authorization: `Bearer + ${process.env.DALLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "image-alpha-001",
      prompt: `${prompt}`,
      size,
    })
  })
    .then(response => response.json())
    .then(data => {
      let images = [];
      console.log(data);
      const imageUrl = data.data[0].url;
      images.push(imageUrl);
      res.send({ images });
    })
    .catch(error => {
      console.error(error);
      res.status(500).send({ error: 'An error occurred while fetching images' });
    });
});

app.get('/api/studentData', (req, res) => {
  // Read the JSON file from public/data folder
  fs.readFile('public/data/student.json', 'utf8', (err, data) => {
    if (err) {
      console.log(`Error reading file from disk: ${err}`);
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Send the JSON data as a response
    res.json(jsonData);
  });
});

app.get('/api/gameData', (req, res) => {
  // Read the JSON file from public/data folder
  fs.readFile('public/scripts/game_template.json', 'utf8', (err, data) => {
    if (err) {
      console.log(`Error reading file from disk: ${err}`);
      return;
    }

    // Parse the JSON data
    const jsonData = JSON.parse(data);

    // Send the JSON data as a response
    res.json(jsonData);
  });
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});