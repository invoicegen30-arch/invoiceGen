export type TaxMode = "domestic" | "intraEU_rc" | "uk_eu_cross" | "export";

export interface Item {
  desc: string;
  qty: number;
  rate: number;
  tax: number;
}

export interface InvoiceData {
  region: string;
  country: string;
  currency: string;
  taxMode: TaxMode;
  lineTaxRate: number;
  items: Item[];
  sender: {
    companyName: string;
    vatReg: string;
    address: string;
    city: string;
    country: string;
    iban: string;
  };
  client: {
    companyName: string;
    vatReg: string;
    address: string;
    city: string;
    country: string;
    email?: string;
  };
  invoice: {
    number: string;
    date: string;
    due: string;
  };
  notes: string;
}

export interface CurrencyData {
  [country: string]: string;
}

export interface CountryCode {
  [country: string]: string;
}

export interface VatRates {
  [countryCode: string]: number[];
}



