const fetch = require("node-fetch");

const DID_API_KEY = "Bearer YOUR_DID_API_KEY"; // 🔑 여기 본인의 D-ID API 키 입력
const IMAGE_URL = "https://your-image-link.com/sejong.png"; // ✅ 얼굴 이미지 주소
const AUDIO_URL = "http://localhost:3001/audio/audio_12345.mp3"; // ✅ TTS 서버에서 생성된 mp3 주소

async function testDID() {
  try {
    const response = await fetch("https://api.d-id.com/talks", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: DID_API_KEY
      },
      body: JSON.stringify({
        script: {
          type: "audio",
          audioUrl: AUDIO_URL
        },
        source_url: IMAGE_URL
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error("D-ID 요청 실패: " + errorData);
    }

    const data = await response.json();
    const videoUrl = `https://studio.d-id.com/talks/${data.id}.mp4`;

    console.log("✅ 영상 생성 성공! 영상 주소:", videoUrl);
  } catch (err) {
    console.error("❌ 에러 발생:", err.message);
  }
}

testDID();
