export interface FoodEntry {
  id: string;
  date: string;
  time: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'other';
  foods: string;
  mealNotes: string;
  hasComplaints: boolean;
  complaintTypes: string[];
  complaintSeverities: { [key: string]: number };
  complaintNotes: string;
  timeAfterMeal: string;
}

export interface ComplaintType {
  id: string;
  name: string;
  color: string;
}

export const COMPLAINT_TYPES: ComplaintType[] = [
  { id: 'nausea', name: 'Hányinger', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'bloating', name: 'Puffadás', color: 'bg-blue-100 text-blue-800' },
  { id: 'stomach-pain', name: 'Gyomorfájás', color: 'bg-red-100 text-red-800' },
  { id: 'heartburn', name: 'Gyomorégés', color: 'bg-orange-100 text-orange-800' },
  { id: 'diarrhea', name: 'Hasmenés', color: 'bg-brown-100 text-brown-800' },
  { id: 'constipation', name: 'Székrekedés', color: 'bg-gray-100 text-gray-800' },
  { id: 'gas', name: 'Gázosság', color: 'bg-green-100 text-green-800' },
  { id: 'fatigue', name: 'Fáradtság', color: 'bg-purple-100 text-purple-800' },
  { id: 'headache', name: 'Fejfájás', color: 'bg-pink-100 text-pink-800' },
  { id: 'other', name: 'Egyéb', color: 'bg-indigo-100 text-indigo-800' }
];

export const SEVERITY_LEVELS = [
  { value: 1, label: 'Enyhe', color: 'text-green-600' },
  { value: 2, label: 'Közepes', color: 'text-yellow-600' },
  { value: 3, label: 'Súlyos', color: 'text-orange-600' },
  { value: 4, label: 'Extrém', color: 'text-red-600' }
];