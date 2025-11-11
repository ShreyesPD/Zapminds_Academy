import { defineEventHandler } from "h3";

export type InvoicesData = string[] | string[][];

const generateFakeData = (): InvoicesData => {
  const data = [];
  const dataLength = 125 + Math.round(Math.random() * 50);
  for (let i = 0; i < dataLength; i++) {
    data.push((Math.round(Math.random() * 4700) + 300).toString());
  }

  return data;
};

export default defineEventHandler(async (event): Promise<InvoicesData> => {
  const range = "Total!A:B";
  const invoiceSheetId = process.env.NUXT_INVOICE_SHEET_ID;
  const googleApiKey = process.env.NUXT_GOOGLE_API_KEY;

  if (!invoiceSheetId || !googleApiKey) {
    console.warn("[google-sheets] Missing NUXT_INVOICE_SHEET_ID or NUXT_GOOGLE_API_KEY env vars");
    return generateFakeData();
  }

  const url = `https://sheets.googleapis.com/v4/spreadsheets/${invoiceSheetId}/values/${range}?key=${googleApiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    return data && data.values ? data.values : generateFakeData();
  } catch (error) {
    return generateFakeData();
  }
});
