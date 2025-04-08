const express = require("express");
const cors = require("cors");
const textToSpeech = require("@google-cloud/text-to-speech");
const fs = require("fs");
const util = require("util");
const path = require("path");
const fetch = require("node-fetch");

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use("/audio", express.static(path.join(__dirname, "public")));

// ✅ Google TTS 클라이언트 설정
const client = new textToSpeech.TextToSpeechClient({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
});

// ✅ TTS 요청 처리
app.post("/tts", async (req, res) => {
  const { text } = req.body;

  if (!text) return res.status(400).send({ error: "텍스트가 필요합니다." });

  const request = {
    input: { text },
    voice: { languageCode: "ko-KR", ssmlGender: "MALE" },
    audioConfig: { audioEncoding: "MP3" }
  };

  try {
    const [response] = await client.synthesizeSpeech(request);
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "public", fileName);

    await util.promisify(fs.writeFile)(filePath, response.audioContent, "binary");

    res.send({ audioUrl: `/audio/${fileName}` });
  } catch (err) {
    console.error("TTS 오류:", err);
    res.status(500).send({ error: err.message });
  }
});

// ✅ D-ID 립싱크 영상 생성 프록시
app.post("/make-video", async (req, res) => {
  const { audioUrl } = req.body;

  if (!audioUrl) return res.status(400).send({ error: "audioUrl이 필요합니다." });

  try {
    const didRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${N1yYk-WiBxYUecoYvwJMr}`
      },
      body: JSON.stringify({
        script: {
          type: "audio",
          audioUrl
        },
        source_url: "https://i.ibb.co/HpN5G3Zm/sejong-v2.png"
      })
    });

    const data = await didRes.json();
    res.send(data);
  } catch (err) {
    console.error("D-ID 프록시 오류:", err);
    res.status(500).send({ error: err.message });
  }
});

// ✅ 기본 홈 경로
app.get("/", (req, res) => {
  res.send("✅ 세종대왕 TTS + D-ID 프록시 서버 실행 중!");
});

app.listen(port, () => {
  console.log(`🚀 서버 실행 중: http://localhost:${port}`);
});
