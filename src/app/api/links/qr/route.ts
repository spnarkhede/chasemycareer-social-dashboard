// app/api/links/qr/route.ts
import { NextRequest, NextResponse } from "next/server";
import QRCode from "qrcode";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get("username");
    const url = searchParams.get("url") || `${process.env.NEXT_PUBLIC_APP_URL}/${username}`;

    // Generate QR code as PNG
    const qrCodeDataUrl = await QRCode.toDataURL(url, {
      width: 400,
      margin: 2,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });

    // Convert to buffer
    const buffer = Buffer.from(qrCodeDataUrl.split(",")[1], "base64");

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-code-${username}.png"`,
      },
    });
  } catch (error) {
    console.error("QR code error:", error);
    return NextResponse.json(
      { error: "Failed to generate QR code" },
      { status: 500 }
    );
  }
}