import { FoodEntry, COMPLAINT_TYPES, SEVERITY_LEVELS } from '@/types/food-entry';

export function exportToCSV(entries: FoodEntry[]) {
  const headers = [
    'Dátum',
    'Időpont',
    'Étkezés Típusa',
    'Ételek',
    'Étkezési Megjegyzések',
    'Van Panasz',
    'Panasz Típusok',
    'Panasz Súlyosság',
    'Panasz Megjegyzések',
    'Idő az Étkezés Után'
  ];

  const getMealTypeLabel = (mealType: string) => {
    switch (mealType) {
      case 'breakfast': return 'Reggeli';
      case 'lunch': return 'Ebéd';
      case 'dinner': return 'Vacsora';
      case 'snack': return 'Snack';
      default: return 'Egyéb';
    }
  };

  const csvData = entries.map(entry => {
    const complaintNames = entry.complaintTypes.map(id => {
      const complaint = COMPLAINT_TYPES.find(c => c.id === id);
      return complaint?.name || id;
    }).join('; ');

    const complaintSeverities = entry.complaintTypes.map(id => {
      const severity = entry.complaintSeverities[id];
      const severityLabel = SEVERITY_LEVELS.find(s => s.value === severity);
      const complaint = COMPLAINT_TYPES.find(c => c.id === id);
      return `${complaint?.name || id}: ${severityLabel?.label || severity}`;
    }).join('; ');

    return [
      entry.date,
      entry.time,
      getMealTypeLabel(entry.mealType),
      `"${entry.foods.replace(/"/g, '""')}"`,
      `"${entry.mealNotes.replace(/"/g, '""')}"`,
      entry.hasComplaints ? 'Igen' : 'Nem',
      `"${complaintNames}"`,
      `"${complaintSeverities}"`,
      `"${entry.complaintNotes.replace(/"/g, '""')}"`,
      `"${entry.timeAfterMeal}"`
    ];
  });

  const csvContent = [headers, ...csvData]
    .map(row => row.join(','))
    .join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `etkezesi-naplo-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function generateExcelIntegrationGuide() {
  return `
# Excel Integráció Útmutató

Az étkezési napló Excel táblázattal való integrálásához több lehetőséged van:

## 1. Opció: Manuális Importálás (Jelenleg ajánlott)
1. Használd az "Exportálás CSV-be" gombot az adatok letöltéséhez
2. Nyisd meg az Excel fájlodat a privát meghajtódon
3. Használd az Excel "Adatok" > "Szövegből/CSV-ből" funkcióját a letöltött fájl importálásához
4. A CSV tartalmazza az összes kért oszlopot a pontos formátumban

## 2. Opció: Microsoft Graph API Integráció (Haladó)
Az adatok automatikus szinkronizálásához a privát OneDrive Excel fájlba:

1. Alkalmazás regisztrálása az Azure Active Directory-ban
2. Szükséges engedélyek megszerzése a Microsoft Graph API-hoz
3. Hitelesítési folyamat implementálása
4. Excel REST API használata az adatok közvetlen írásához a táblázatba

Szükséges engedélyek:
- Files.ReadWrite
- Sites.ReadWrite.All (SharePoint használata esetén)

## 3. Opció: Google Sheets Integráció (Alternatíva)
Ha nyitott vagy a Google Sheets használatára:
1. Google Sheets API engedélyezése
2. Szolgáltatásfiók hitelesítő adatok beállítása
3. Táblázat megosztása a szolgáltatásfiókkal
4. Google Sheets API használata az adatok hozzáfűzéséhez

Az exportált CSV tartalmazza az összes kért oszlopot:
- Dátum, Időpont, Étkezés Típusa, Ételek, Étkezési Megjegyzések
- Van Panasz, Panasz Típusok, Panasz Súlyosság
- Panasz Megjegyzések, Idő az Étkezés Után

Szeretnéd, hogy implementáljam valamelyik integrációs lehetőséget?
  `;
}