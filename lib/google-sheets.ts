import { google } from "googleapis";
import { FoodEntry, COMPLAINT_TYPES } from "@/types/food-entry";

interface GoogleSheetsConfig {
  spreadsheetId: string;
  keyFile?: any; // Service account key file content
  clientEmail?: string;
  privateKey?: string;
}

class GoogleSheetsService {
  private auth: any;
  private sheets: any;
  private config: GoogleSheetsConfig;

  constructor(config: GoogleSheetsConfig) {
    this.config = config;
  }

  async initialize() {
    try {
      // For server-side authentication with service account
      if (this.config.keyFile) {
        this.auth = new google.auth.GoogleAuth({
          credentials: this.config.keyFile,
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
          ],
        });
      } else if (this.config.clientEmail && this.config.privateKey) {
        this.auth = new google.auth.GoogleAuth({
          credentials: {
            client_email: this.config.clientEmail,
            private_key: this.config.privateKey.replace(/\\n/g, "\n"),
          },
          scopes: [
            "https://www.googleapis.com/auth/spreadsheets",
            "https://www.googleapis.com/auth/drive.file",
          ],
        });
      } else {
        throw new Error("No valid authentication method provided");
      }

      const authClient = await this.auth.getClient();
      this.sheets = google.sheets({ version: "v4", auth: this.auth });
    } catch (error) {
      console.error("Failed to initialize Google Sheets:", error);
      throw error;
    }
  }

  async ensureHeadersExist() {
    try {
      const headers = [
        "ID",
        "Dátum",
        "Időpont",
        "Étkezés Típusa",
        "Elfogyasztott Ételek",
        "Étkezési Megjegyzések",
        "Van Panasz",
        "Panasz Időpontja",
        "Panasz Típusok",
        "Panasz Súlyosságok",
        "Panasz Megjegyzések",
        "Létrehozva",
      ];

      // Check if headers exist
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: "A1:L1",
      });

      if (!response.data.values || response.data.values.length === 0) {
        // Create headers if they don't exist
        await this.sheets.spreadsheets.values.update({
          spreadsheetId: this.config.spreadsheetId,
          range: "A1:L1",
          valueInputOption: "RAW",
          resource: {
            values: [headers],
          },
        });

        // Format headers
        await this.sheets.spreadsheets.batchUpdate({
          spreadsheetId: this.config.spreadsheetId,
          resource: {
            requests: [
              {
                repeatCell: {
                  range: {
                    sheetId: 0,
                    startRowIndex: 0,
                    endRowIndex: 1,
                    startColumnIndex: 0,
                    endColumnIndex: headers.length,
                  },
                  cell: {
                    userEnteredFormat: {
                      backgroundColor: { red: 0.2, green: 0.6, blue: 1.0 },
                      textFormat: {
                        bold: true,
                        foregroundColor: { red: 1, green: 1, blue: 1 },
                      },
                    },
                  },
                  fields: "userEnteredFormat",
                },
              },
            ],
          },
        });
      }
    } catch (error) {
      console.error("Failed to ensure headers exist:", error);
      throw error;
    }
  }

  async appendEntry(entry: FoodEntry) {
    try {
      await this.ensureHeadersExist();

      const complaintTypesText = entry.complaintTypes
        .map((typeId) => {
          const type = COMPLAINT_TYPES.find((t) => t.id === typeId);
          return type ? type.name : typeId;
        })
        .join(", ");

      const complaintSeveritiesText = Object.entries(entry.complaintSeverities)
        .map(([typeId, severity]) => {
          const type = COMPLAINT_TYPES.find((t) => t.id === typeId);
          const typeName = type ? type.name : typeId;
          return `${typeName}: ${severity}`;
        })
        .join(", ");

      const row = [
        entry.id,
        entry.date,
        entry.time,
        this.getMealTypeText(entry.mealType),
        entry.foods,
        entry.mealNotes,
        entry.hasComplaints ? "Igen" : "Nem",
        entry.timeAfterMeal,
        complaintTypesText,
        complaintSeveritiesText,
        entry.complaintNotes,
        new Date().toISOString(),
      ];

      const response = await this.sheets.spreadsheets.values.append({
        spreadsheetId: this.config.spreadsheetId,
        range: "A:L",
        valueInputOption: "RAW",
        insertDataOption: "INSERT_ROWS",
        resource: {
          values: [row],
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to append entry:", error);
      throw error;
    }
  }

  async updateEntry(entry: FoodEntry, rowIndex: number) {
    try {
      const complaintTypesText = entry.complaintTypes
        .map((typeId) => {
          const type = COMPLAINT_TYPES.find((t) => t.id === typeId);
          return type ? type.name : typeId;
        })
        .join(", ");

      const complaintSeveritiesText = Object.entries(entry.complaintSeverities)
        .map(([typeId, severity]) => {
          const type = COMPLAINT_TYPES.find((t) => t.id === typeId);
          const typeName = type ? type.name : typeId;
          return `${typeName}: ${severity}`;
        })
        .join(", ");

      const row = [
        entry.id,
        entry.date,
        entry.time,
        this.getMealTypeText(entry.mealType),
        entry.foods,
        entry.mealNotes,
        entry.hasComplaints ? "Igen" : "Nem",
        entry.timeAfterMeal,
        complaintTypesText,
        complaintSeveritiesText,
        entry.complaintNotes,
        new Date().toISOString(),
      ];

      const response = await this.sheets.spreadsheets.values.update({
        spreadsheetId: this.config.spreadsheetId,
        range: `A${rowIndex}:L${rowIndex}`,
        valueInputOption: "RAW",
        resource: {
          values: [row],
        },
      });

      return response.data;
    } catch (error) {
      console.error("Failed to update entry:", error);
      throw error;
    }
  }

  async deleteEntry(entryId: string) {
    try {
      // Find the row containing the entry
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: "A:A",
      });

      const rows = response.data.values || [];
      const rowIndex = rows.findIndex((row: any[]) => row[0] === entryId);

      if (rowIndex === -1) {
        throw new Error("Entry not found");
      }

      // Delete the row (add 1 because sheets are 1-indexed)
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId: this.config.spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: 0,
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });

      return true;
    } catch (error) {
      console.error("Failed to delete entry:", error);
      throw error;
    }
  }

  async getAllEntries(): Promise<FoodEntry[]> {
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId: this.config.spreadsheetId,
        range: "A2:L", // Skip header row
      });

      const rows = response.data.values || [];
      return rows.map((row: any[]) => this.parseRowToEntry(row));
    } catch (error) {
      console.error("Failed to get entries:", error);
      throw error;
    }
  }

  private parseRowToEntry(row: any[]): FoodEntry {
    const [
      id,
      date,
      time,
      mealTypeText,
      foods,
      mealNotes,
      hasComplaintsText,
      timeAfterMeal,
      complaintTypesText,
      complaintSeveritiesText,
      complaintNotes,
    ] = row;

    const mealType = this.parseMealType(mealTypeText);
    const hasComplaints = hasComplaintsText === "Igen";

    const complaintTypes: string[] = complaintTypesText
      ? complaintTypesText.split(", ").map((name: string) => {
          const type = COMPLAINT_TYPES.find((t) => t.name === name.trim());
          return type ? type.id : name.trim();
        })
      : [];

    const complaintSeverities: { [key: string]: number } = {};
    if (complaintSeveritiesText) {
      complaintSeveritiesText.split(", ").forEach((item: string) => {
        const [name, severity] = item.split(": ");
        if (name && severity) {
          const type = COMPLAINT_TYPES.find((t) => t.name === name.trim());
          const typeId = type ? type.id : name.trim();
          complaintSeverities[typeId] = parseInt(severity);
        }
      });
    }

    return {
      id: id || Date.now().toString(),
      date: date || "",
      time: time || "",
      mealType,
      foods: foods || "",
      mealNotes: mealNotes || "",
      hasComplaints,
      complaintTypes,
      complaintSeverities,
      complaintNotes: complaintNotes || "",
      timeAfterMeal: timeAfterMeal || "",
    };
  }

  private getMealTypeText(mealType: string): string {
    const mealTypeMap: { [key: string]: string } = {
      breakfast: "Reggeli",
      lunch: "Ebéd",
      dinner: "Vacsora",
      snack: "Snack",
      other: "Egyéb",
    };
    return mealTypeMap[mealType] || mealType;
  }

  private parseMealType(
    mealTypeText: string
  ): "breakfast" | "lunch" | "dinner" | "snack" | "other" {
    const mealTypeMap: {
      [key: string]: "breakfast" | "lunch" | "dinner" | "snack" | "other";
    } = {
      Reggeli: "breakfast",
      Ebéd: "lunch",
      Vacsora: "dinner",
      Snack: "snack",
      Egyéb: "other",
    };
    return mealTypeMap[mealTypeText] || "other";
  }
}

export default GoogleSheetsService;
