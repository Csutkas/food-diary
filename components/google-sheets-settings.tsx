"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Settings,
  ExternalLink,
  CheckCircle,
  XCircle,
  RotateCcw,
  Copy,
  FileText,
} from "lucide-react";
import { useGoogleSheets } from "@/hooks/use-google-sheets";
import ClientGoogleSheetsService from "@/lib/client-google-sheets";
import { exportToCSV } from "@/lib/export-utils";
import { FoodEntry } from "@/types/food-entry";

interface GoogleSheetsSettingsProps {
  entries: FoodEntry[];
  onSync?: (entries: FoodEntry[]) => void;
}

export function GoogleSheetsSettings({
  entries,
  onSync,
}: GoogleSheetsSettingsProps) {
  const [spreadsheetId, setSpreadsheetId] = useState("");
  const [isEnabled, setIsEnabled] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [csvData, setCsvData] = useState("");
  const { loading, error, loadEntries, syncWithSheets } = useGoogleSheets();

  useEffect(() => {
    // Load settings from localStorage
    const savedSpreadsheetId = localStorage.getItem(
      "googleSheetsSpreadsheetId"
    );
    const savedIsEnabled =
      localStorage.getItem("googleSheetsEnabled") === "true";

    if (savedSpreadsheetId) {
      setSpreadsheetId(savedSpreadsheetId);
    }
    setIsEnabled(savedIsEnabled);

    // Generate CSV data for manual import
    if (entries.length > 0) {
      const clientService = new ClientGoogleSheetsService({
        spreadsheetId: savedSpreadsheetId || "",
      });
      const data = clientService.generateSheetData(entries);
      const csv = data.map((row) => row.join(",")).join("\n");
      setCsvData(csv);
    }

    // Check connection status
    const checkConnectionAsync = async () => {
      if (!savedSpreadsheetId || !savedIsEnabled) {
        setIsConnected(false);
        return;
      }

      try {
        await loadEntries();
        setIsConnected(true);
      } catch (err) {
        setIsConnected(false);
      }
    };

    checkConnectionAsync();
  }, [loadEntries, entries]);

  const checkConnection = async () => {
    if (!spreadsheetId || !isEnabled) {
      setIsConnected(false);
      return;
    }

    try {
      await loadEntries();
      setIsConnected(true);
    } catch (err) {
      setIsConnected(false);
    }
  };

  const handleSave = () => {
    localStorage.setItem("googleSheetsSpreadsheetId", spreadsheetId);
    localStorage.setItem("googleSheetsEnabled", isEnabled.toString());

    if (isEnabled && spreadsheetId) {
      checkConnection();
    } else {
      setIsConnected(false);
    }
  };

  const handleSync = async () => {
    if (!isEnabled || !spreadsheetId) return;

    try {
      const syncedEntries = await syncWithSheets(entries);
      setLastSync(new Date().toLocaleString("hu-HU"));
      onSync?.(syncedEntries);
    } catch (err) {
      console.error("Sync failed:", err);
    }
  };

  const extractSpreadsheetId = (url: string) => {
    // Extract spreadsheet ID from Google Sheets URL
    const match = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
    return match ? match[1] : url;
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert("Másolva a vágólapra!");
    });
  };

  const handleExportForSheets = () => {
    exportToCSV(entries);
  };

  const handleUrlPaste = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const extractedId = extractSpreadsheetId(value);
    setSpreadsheetId(extractedId);
  };

  const getStatusBadge = () => {
    if (!isEnabled) {
      return <Badge variant="secondary">Kikapcsolva</Badge>;
    }
    if (loading) {
      return <Badge variant="secondary">Ellenőrzés...</Badge>;
    }
    if (isConnected) {
      return (
        <Badge variant="default" className="bg-green-500">
          <CheckCircle className="w-3 h-3 mr-1" />
          Csatlakozva
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="w-3 h-3 mr-1" />
        Nincs csatlakozva
      </Badge>
    );
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader className="px-4 sm:px-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
          Google Sheets Integráció
        </CardTitle>
        <CardDescription className="text-sm sm:text-base">
          Szinkronizáld az étkezési naplódat egy Google Sheets táblázattal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        <Tabs defaultValue="auto" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2 h-auto">
            <TabsTrigger value="auto" className="text-xs sm:text-sm p-2 sm:p-3">
              Automatikus Szinkronizálás
            </TabsTrigger>
            <TabsTrigger
              value="manual"
              className="text-xs sm:text-sm p-2 sm:p-3"
            >
              Manuális Exportálás
            </TabsTrigger>
          </TabsList>

          <TabsContent value="auto" className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
              <div className="space-y-1">
                <Label htmlFor="enable-sheets" className="text-sm sm:text-base">
                  Google Sheets Szinkronizálás
                </Label>
                <p className="text-xs sm:text-sm text-gray-500">
                  Automatikusan mentés Google Drive-ba (API kulcs szükséges)
                </p>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto">
                {getStatusBadge()}
                <Switch
                  id="enable-sheets"
                  checked={isEnabled}
                  onCheckedChange={setIsEnabled}
                />
              </div>
            </div>

            {isEnabled && (
              <>
                <div className="space-y-2">
                  <Label
                    htmlFor="spreadsheet-id"
                    className="text-sm sm:text-base"
                  >
                    Google Sheets URL vagy ID
                  </Label>
                  <Input
                    id="spreadsheet-id"
                    placeholder="Illeszd be a Google Sheets URL-t vagy az ID-t"
                    value={spreadsheetId}
                    onChange={handleUrlPaste}
                    className="text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 break-all">
                    Példa:
                    https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
                  </p>
                </div>

                <Alert>
                  <AlertDescription className="text-xs sm:text-sm">
                    <strong>Fontos:</strong> Az automatikus szinkronizáláshoz
                    szükséges a Google Sheets API beállítása.
                    <br />
                    Lásd a GOOGLE_SHEETS_SETUP.md fájlt a részletes útmutatóért.
                  </AlertDescription>
                </Alert>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription className="text-xs sm:text-sm">
                      <strong>Hiba:</strong> {error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1 text-sm sm:text-base"
                  >
                    Beállítások Mentése
                  </Button>

                  {isConnected && (
                    <Button
                      onClick={handleSync}
                      variant="outline"
                      disabled={loading}
                      className="flex items-center gap-2 text-sm sm:text-base"
                    >
                      <RotateCcw
                        className={`w-3 h-3 sm:w-4 sm:h-4 ${
                          loading ? "animate-spin" : ""
                        }`}
                      />
                      Szinkronizálás
                    </Button>
                  )}
                </div>

                {lastSync && (
                  <p className="text-xs sm:text-sm text-gray-500 text-center">
                    Utolsó szinkronizálás: {lastSync}
                  </p>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="manual" className="space-y-4 sm:space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="font-medium mb-2 text-sm sm:text-base">
                  Egyszerű Exportálás
                </h4>
                <p className="text-xs sm:text-sm text-gray-500 mb-4">
                  Exportáld az adataidat CSV formátumban, majd importáld Google
                  Sheets-be.
                </p>

                <Button
                  onClick={handleExportForSheets}
                  className="w-full text-sm sm:text-base"
                >
                  <FileText className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                  CSV Exportálás Google Sheets-hez
                </Button>
              </div>

              {entries.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm sm:text-base">
                    Adatok Másolása
                  </Label>
                  <Textarea
                    value={csvData}
                    readOnly
                    className="min-h-[100px] text-xs sm:text-sm resize-none"
                    placeholder="CSV adatok jelennek meg itt..."
                  />
                  <Button
                    onClick={() => copyToClipboard(csvData)}
                    variant="outline"
                    className="w-full"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Másolás Vágólapra
                  </Button>
                </div>
              )}

              <Alert>
                <AlertDescription>
                  <strong>Manuális importálás lépései:</strong>
                  <br />
                  1. Exportáld a CSV fájlt vagy másold a fenti adatokat
                  <br />
                  2. Nyisd meg Google Sheets-et
                  <br />
                  3. Hozz létre egy új táblázatot
                  <br />
                  4. Fájl → Importálás → CSV fájl feltöltése
                  <br />
                  5. Vagy illeszd be az adatokat az A1 cellába
                </AlertDescription>
              </Alert>
            </div>
          </TabsContent>
        </Tabs>

        <div className="pt-4 border-t">
          <h4 className="font-medium mb-2">Hasznos Linkek</h4>
          <div className="space-y-1">
            <a
              href="https://sheets.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Google Sheets Megnyitása
            </a>
            <a
              href="https://docs.google.com/spreadsheets/create"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
            >
              <ExternalLink className="w-3 h-3" />
              Új Táblázat Létrehozása
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
