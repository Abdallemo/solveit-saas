// app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/cloudFlairR2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const fileType = file.type || "application/octet-stream";
  const fileName = `${randomUUID()}-${file.name}`;

  const command = new PutObjectCommand({
    Bucket: "solveit",
    Key: `workspace/${fileName}`,
    Body: fileBuffer,
    ContentType: fileType,
  });

  try {
    await s3.send(command);
    const publicUrl = `https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev/solveit/workspace/${fileName}`;

    return NextResponse.json({
      success: true,
      fileName: file.name,
      publicUrl,
      filePath: `workspace/${fileName}`,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
export async function PUT(req: NextRequest) {
  const { filePath, content, contentType } = await req.json();
  console.log("File path",filePath )
  if (!filePath || typeof content !== "string") {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const command = new PutObjectCommand({
    Bucket: "solveit",
    Key: filePath,
    Body: content,
    ContentType: contentType || "text/plain",
  });

  try {
    await s3.send(command);
    console.log("sucess")
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json({ error: "Failed to upload" }, { status: 500 });
  }
}