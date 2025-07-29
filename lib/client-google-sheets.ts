import { FoodEntry, COMPLAINT_TYPES } from "@/types/food-entry";

interface ClientSheetsConfig {
  spreadsheetId: string;
}

class ClientGoogleSheetsService {
  private config: ClientSheetsConfig;

  constructor(config: ClientSheetsConfig) {
    this.config = config;
  }

  // For client-side, we'll provide a method to generate a CSV that can be
  // manually imported to Google Sheets or provide instructions for manual setup
  generateSheetData(entries: FoodEntry[]): string[][] {
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

    const rows = entries.map((entry) => {
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

      return [
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
    });

    return [headers, ...rows];
  }

  generateGoogleSheetsFormula(entries: FoodEntry[]): string {
    const data = this.generateSheetData(entries);
    const formattedData = data.map((row) => `{"${row.join('","')}"}`).join(",");

    return `=ARRAYFORMULA({${formattedData}})`;
  }

  getManualInstructions(spreadsheetId: string): {
    steps: string[];
    csvData: string;
    sheetsUrl: string;
  } {
    return {
      steps: [
        "1. Nyisd meg a Google Sheets dokumentumodat",
        "2. Válaszd ki az A1 cellát",
        "3. Másold be a lenti CSV adatokat",
        "4. Vagy használd a Google Sheets IMPORTDATA funkciót",
        "5. Vagy manuálisan másold be az adatokat",
      ],
      csvData: "", // Will be generated when needed
      sheetsUrl: `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
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
}

export default ClientGoogleSheetsService;
