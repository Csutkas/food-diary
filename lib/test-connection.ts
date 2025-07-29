// Quick test script to verify Google Sheets connection
import { google } from "googleapis";

async function testConnection() {
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
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID,
    });

    console.log("✅ Connection successful!");
    console.log("Sheet title:", response.data.properties?.title);
    console.log("Sheet ID:", response.data.spreadsheetId);

    return true;
  } catch (error: any) {
    console.error("❌ Connection failed:", error.message);

    if (error.message?.includes("permission")) {
      console.log("\n🔧 Fix: Share your Google Sheet with this email:");
      console.log(`   ${process.env.GOOGLE_CLIENT_EMAIL}`);
    }

    return false;
  }
}

export { testConnection };
