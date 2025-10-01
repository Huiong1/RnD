const axios = require("axios");
const fs = require("fs");
const path = require("path");
const OPEN_DART_KEY = "9e90974fba4ce9bf605b1c7a86c61e0a3f9969ac";

async function downloadCorpInfoZip(corpCode) {
  const url = "https://opendart.fss.or.kr/api/corpCode.xml";  // 혹은 해당 API 엔드포인트 URL
  // (가이드 문서에 URL 보시면 xml/zip 형태가 있음) :contentReference[oaicite:3]{index=3}

  try {
    const response = await axios.get(url, {
      params: {
        crtfc_key: OPEN_DART_KEY,
        corp_code: corpCode
      },
      responseType: "arraybuffer"  // 바이너리 데이터를 받기 위함
    });

    // 파일 저장 경로 정하기
    const fileName = `corpinfo_${corpCode}.zip`;
    const filePath = path.join(__dirname, "downloads", fileName);

    // 디렉터리 없으면 생성
    fs.mkdirSync(path.dirname(filePath), { recursive: true });

    // 파일 쓰기
    fs.writeFileSync(filePath, response.data);

    console.log("파일 저장 완료:", filePath);
    return filePath;
  } catch (err) {
    console.error("파일 다운로드 실패:", err.message);
    throw err;
  }
}

// 사용 예
downloadCorpInfoZip("001450")
  .then(fp => console.log("다운로드된 파일 경로:", fp))
  .catch(err => console.error("에러 발생:", err));
