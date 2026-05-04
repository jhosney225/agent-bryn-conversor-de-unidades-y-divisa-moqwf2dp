
```javascript
const Anthropic = require("@anthropic-ai/sdk");
const readline = require("readline");

const client = new Anthropic();

// Define tools for unit and currency conversion
const tools = [
  {
    name: "convert_length",
    description:
      "Convert length measurements between different units (meters, feet, inches, kilometers, miles, etc.)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The numerical value to convert",
        },
        from_unit: {
          type: "string",
          description: "The unit to convert from (e.g., 'meters', 'feet', 'miles')",
        },
        to_unit: {
          type: "string",
          description: "The unit to convert to",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_weight",
    description:
      "Convert weight measurements between different units (kilograms, pounds, grams, ounces, tons, etc.)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The numerical value to convert",
        },
        from_unit: {
          type: "string",
          description: "The unit to convert from (e.g., 'kilograms', 'pounds', 'grams')",
        },
        to_unit: {
          type: "string",
          description: "The unit to convert to",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_temperature",
    description:
      "Convert temperature between different scales (Celsius, Fahrenheit, Kelvin)",
    input_schema: {
      type: "object",
      properties: {
        value: {
          type: "number",
          description: "The temperature value to convert",
        },
        from_unit: {
          type: "string",
          description: "The temperature scale to convert from (Celsius, Fahrenheit, Kelvin)",
        },
        to_unit: {
          type: "string",
          description: "The temperature scale to convert to",
        },
      },
      required: ["value", "from_unit", "to_unit"],
    },
  },
  {
    name: "convert_currency",
    description:
      "Convert between different currencies using current exchange rates (USD, EUR, GBP, JPY, MXN, etc.)",
    input_schema: {
      type: "object",
      properties: {
        amount: {
          type: "number",
          description: "The amount of money to convert",
        },
        from_currency: {
          type: "string",
          description: "The currency code to convert from (e.g., 'USD', 'EUR', 'GBP')",
        },
        to_currency: {
          type: "string",
          description: "The currency code to convert to",
        },
      },
      required: ["amount", "from_currency", "to_currency"],
    },
  },
];

// Conversion factor databases
const lengthConversions = {
  meter: 1,
  meters: 1,
  m: 1,
  kilometer: 1000,
  kilometers: 1000,
  km: 1000,
  centimeter: 0.01,
  centimeters: 0.01,
  cm: 0.01,
  millimeter: 0.001,
  millimeters: 0.001,
  mm: 0.001,
  foot: 0.3048,
  feet: 0.3048,
  ft: 0.3048,
  inch: 0.0254,
  inches: 0.0254,
  in: 0.0254,
  yard: 0.9144,
  yards: 0.9144,
  yd: 0.9144,
  mile: 1609.34,
  miles: 1609.34,
  mi: 1609.34,
};

const weightConversions = {
  kilogram: 1,
  kilograms: 1,
  kg: 1,
  gram: 0.001,
  grams: 0.001,
  g: 0.001,
  milligram: 0.000001,
  milligrams: 0.000001,
  mg: 0.000001,
  pound: 0.453592,
  pounds: 0.453592,
  lb: 0.453592,
  lbs: 0.453592,
  ounce: 0.0283495,
  ounces: 0.0283495,
  oz: 0.0283495,
  ton: 1000,
  tons: 1000,
  stone: 6.35029,
  stones: 6.35029,
};

// Mock exchange rates (in production, these would be fetched from an API)
const exchangeRates = {
  USD: 1,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 149.5,
  MXN: 17.05,
  CAD: 1.36,
  AUD: 1.53,
  INR: 83.12,
  CNY: 7.24,
  CHF: 0.88,
};

function convertLength(value, fromUnit, toUnit) {
  const normalizedFrom = fromUnit.toLowerCase();
  const normalizedTo = toUnit.toLowerCase();

  if (!(normalizedFrom in lengthConversions)) {
    return { error: `Unknown length unit: ${fromUnit}` };
  }
  if (!(normalizedTo in lengthConversions)) {
    return { error: `Unknown length unit: ${toUnit}` };
  }

  const valueInMeters = value * lengthCon