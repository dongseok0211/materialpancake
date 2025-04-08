const express = require('express');
const cors = require('cors');
const textToSpeech = require('@google-cloud/text-to-speech');
const fs = require('fs');
const util = require('util');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use('/audio', express.static('public'));

const client = new textToSpeech.TextToSpeechClient({
  keyFilename: 'google-key.json' // ← 구글에서 받은 JSON 키 파일 이름
});

app.post('/tts', async (req, res) => {
  const { text } = req.body;

  const request = {
    input: { text },
    voice: { languageCode: 'ko-KR', ssmlGender: 'MALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = `public/${fileName}`;

    const writeFile = util.promisify(fs.writeFile);
    await writeFile(filePath, response.audioContent, 'binary');

    res.send({ audioUrl: `/audio/${fileName}` });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
});

app.listen(port, () => {
  console.log(`✅ TTS 프록시 서버 실행 중: http://localhost:${port}`);
});
