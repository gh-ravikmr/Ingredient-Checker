// Smoke test: posts an image to a running backend and prints the response.
//
//   node scripts/test-image.js [path/to/label.jpg] [http://localhost:5000]
//
// With no path it generates a blank image, which is expected to be rejected by
// the ingredient validation — pass a real food label to exercise the happy path.
import fs from "fs";
import path from "path";
import fetch from "node-fetch";
import sharp from "sharp";

const imagePath = process.argv[2] || path.join("scripts", "test-sample.jpg");
const apiUrl = (process.argv[3] || "http://localhost:5000").replace(/\/+$/, "");

async function testBackend() {
  try {
    if (!fs.existsSync(imagePath)) {
      console.log(`📝 ${imagePath} not found, creating a blank test image...`);
      await sharp({
        create: {
          width: 800,
          height: 600,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .jpeg()
        .toFile(imagePath);
    }

    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = `data:image/jpeg;base64,${imageBuffer.toString("base64")}`;

    console.log(`🧪 Testing ${apiUrl}/api/analyze with ${imagePath}`);
    console.log(`📊 Image size: ${(imageBuffer.length / 1024).toFixed(1)}KB`);

    const response = await fetch(`${apiUrl}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: base64Image,
        fastMode: true,
        isMobile: false,
      }),
    });

    console.log(`📡 Response status: ${response.status}`);

    const bodyText = await response.text();

    if (!response.ok) {
      console.error("❌ Error response:", bodyText);
      process.exitCode = 1;
      return;
    }

    console.log("✅ Success! Response:");
    console.log(JSON.stringify(JSON.parse(bodyText), null, 2));
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exitCode = 1;
  }
}

testBackend();
