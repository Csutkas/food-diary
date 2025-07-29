import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function GET() {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const authClient = await auth.getClient();
    const sheets = google.sheets({ version: "v4", auth: auth });

    // Test basic read access
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID!,
    });

    return NextResponse.json({
      success: true,
      message: "Connection successful!",
      sheetTitle: response.data.properties?.title,
      sheetId: response.data.spreadsheetId,
    });
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);

    let troubleshooting = "";
    if (error.message?.includes("permission")) {
      troubleshooting = `Share your Google Sheet with this email: ${process.env.GOOGLE_CLIENT_EMAIL}`;
    }

    return NextResponse.json(
      {
        success: false,
        error: error.message,
        troubleshooting,
        serviceAccount: process.env.GOOGLE_CLIENT_EMAIL,
        spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
      },
      { status: 500 }
    );
  }
}
