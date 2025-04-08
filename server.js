const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3001;

// Google TTS 클라이언트 설정
const client = new textToSpeech.TextToSpeechClient();

app.use(cors());
app.use(express.json());
app.use("/audio", express.static(path.join(__dirname, "audio"))); // mp3 파일 서빙

// ✅ mp3 생성용 엔드포인트
app.post("/tts", async (req, res) => {
  try {
    const text = req.body.text;
    const request = {
      input: { text },
      voice: { languageCode: "ko-KR", ssmlGender: "MALE" },
      audioConfig: { audioEncoding: "MP3" },
    };

    const [response] = await client.synthesizeSpeech(request);
    const fileName = `audio_${Date.now()}.mp3`;
    const filePath = path.join(__dirname, "audio", fileName);

    fs.writeFileSync(filePath, response.audioContent, "binary");
    console.log("✅ MP3 생성 완료:", fileName);

    res.json({ audioUrl: `/audio/${fileName}` });
  } catch (err) {
    console.error("❌ TTS 오류:", err);
    res.status(500).json({ error: "TTS 생성 실패" });
  }
});

// ✅ D-ID 영상 생성용 엔드포인트
app.post("/make-video", async (req, res) => {
  try {
    const audioUrl = req.body.audioUrl;

    const didRes = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DID_API_KEY}`, // ✅ Bearer 자동 붙임
      },
      body: JSON.stringify({
        script: {
          type: "audio",
          audioUrl,
        },
        source_url: "https://i.ibb.co/HpN5G3Zm/sejong-v2.png", // 세종대왕 얼굴 이미지
      }),
    });

    const didData = await didRes.json();
    console.log("🎥 D-ID 응답(JSON):", JSON.stringify(didData, null, 2));

    if (!didData.id) {
      return res.status(500).json({ error: "D-ID 영상 ID 없음", ...didData });
    }

    res.json({ id: didData.id });
  } catch (err) {
    console.error("❌ D-ID 요청 실패:", err);
    res.status(500).json({ error: "D-ID 영상 생성 실패" });
  }
});

app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
});
