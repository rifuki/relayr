import axios from "axios";

export async function GET() {
  const fileUrl = "https://files.testfile.org/AUDIO/C/M4A/sample1.m4a";

  try {
    const response = await axios.get(fileUrl, {
      responseType: "stream",
    });
    const nodeStream = response.data;
    const contentLength = response.headers["content-length"];
    const contentType = response.headers["content-type"] || "audio/mp4";
    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err: Error) => controller.error(err));
      },
    });

    return new Response(webStream, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": 'attachment; filename="sample1.m4a"',
        ...(contentLength && { "Content-Length": contentLength }), // <- penting
      },
    });
  } catch (error: unknown) {
    console.error(error);
    return new Response(JSON.stringify({ message: "Failed to catch file" }), {
      status: 500,
    });
  }
}
