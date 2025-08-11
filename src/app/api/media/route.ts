// app/api/media/route.ts

import { NextRequest, NextResponse } from "next/server";
import { s3 } from "@/lib/cloudFlairR2";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";
import { scope, UploadedFileMeta } from "@/features/media/server/media-types";
export const config = {
  api: {
    bodyParser: false,
  },
};

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const files = formData.getAll("files");
  const scope = formData.get("scope") as scope

  const uploadedFileDetails:UploadedFileMeta[] = [];

  for (const file of files) {
    if (!(file instanceof File)) {
      console.warn("Skipping non-file entry in formData:", file);
      continue;
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const fileType = file.type || "application/octet-stream";
    const fileName = `${randomUUID()}-${file.name}`; 
    const filePath = `${scope}/${fileName}`
    const command = new PutObjectCommand({
      Bucket: "solveit", 
      Key: filePath,
      Body: fileBuffer,
      ContentType: fileType,
    });

    try {
      await s3.send(command);
      const publicUrl = `https://pub-c60addcb244c4d23b18a98d686f3195e.r2.dev/solveit/${filePath}`;
      uploadedFileDetails.push({
        fileName: file.name,
        fileSize:file.size,
        fileType:file.type,
        storageLocation:publicUrl,
        filePath: filePath,
      });
    } catch (err) {
      console.error(`Upload error for file ${file.name}:`, err);
      return NextResponse.json({ error: `Upload failed for ${file.name}` }, { status: 500 });
    }
  }

  return NextResponse.json(uploadedFileDetails);
}
export async function PUT(req: NextRequest) {
  console.log("hit endpoint file update..")
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