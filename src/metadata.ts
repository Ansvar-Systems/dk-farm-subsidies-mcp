export interface Meta {
  disclaimer: string;
  data_age: string;
  source_url: string;
  copyright: string;
  server: string;
  version: string;
}

const DISCLAIMER =
  'Oplysningerne er vejledende og udgør ikke juridisk eller økonomisk rådgivning. ' +
  'Støtteordninger, betalingssatser og ansøgningskrav ændres løbende — kontakt ' +
  'Landbrugsstyrelsen (lbst.dk) eller din landbrugsrådgiver for aktuel information. ' +
  'Data baseret på CAP Strategisk Plan 2023-2027 for Danmark.';

export function buildMeta(overrides?: Partial<Meta>): Meta {
  return {
    disclaimer: DISCLAIMER,
    data_age: overrides?.data_age ?? 'unknown',
    source_url: overrides?.source_url ?? 'https://lbst.dk/tilskud-selvbetjening/',
    copyright: 'Data: Landbrugsstyrelsen (public). Server: Apache-2.0 Ansvar Systems.',
    server: 'dk-farm-subsidies-mcp',
    version: '0.1.0',
    ...overrides,
  };
}
