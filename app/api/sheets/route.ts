import { NextRequest, NextResponse } from "next/server";
import GoogleSheetsService from "@/lib/google-sheets";
import { FoodEntry } from "@/types/food-entry";

let sheetsService: GoogleSheetsService | null = null;

async function getOrCreateSheetsService() {
  if (!sheetsService) {
    const config = {
      spreadsheetId: process.env.NEXT_PUBLIC_GOOGLE_SPREADSHEET_ID!,
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL,
      privateKey: process.env.GOOGLE_PRIVATE_KEY,
    };

    if (!config.spreadsheetId) {
      throw new Error("Google Spreadsheet ID is not configured");
    }

    if (!config.clientEmail || !config.privateKey) {
      throw new Error("Google service account credentials are not configured");
    }

    sheetsService = new GoogleSheetsService(config);
    await sheetsService.initialize();
  }

  return sheetsService;
}

export async function GET() {
  try {
    const service = await getOrCreateSheetsService();
    const entries = await service.getAllEntries();

    return NextResponse.json({ entries }, { status: 200 });
  } catch (error) {
    console.error("Error fetching entries:", error);
    return NextResponse.json(
      { error: "Failed to fetch entries from Google Sheets" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const entry: FoodEntry = await request.json();

    if (!entry.id) {
      entry.id = Date.now().toString();
    }

    const service = await getOrCreateSheetsService();
    await service.appendEntry(entry);

    return NextResponse.json({ success: true, entry }, { status: 201 });
  } catch (error) {
    console.error("Error creating entry:", error);
    return NextResponse.json(
      { error: "Failed to create entry in Google Sheets" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { entry, rowIndex }: { entry: FoodEntry; rowIndex: number } =
      await request.json();

    const service = await getOrCreateSheetsService();
    await service.updateEntry(entry, rowIndex);

    return NextResponse.json({ success: true, entry }, { status: 200 });
  } catch (error) {
    console.error("Error updating entry:", error);
    return NextResponse.json(
      { error: "Failed to update entry in Google Sheets" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get("id");

    if (!entryId) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const service = await getOrCreateSheetsService();
    await service.deleteEntry(entryId);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting entry:", error);
    return NextResponse.json(
      { error: "Failed to delete entry from Google Sheets" },
      { status: 500 }
    );
  }
}
