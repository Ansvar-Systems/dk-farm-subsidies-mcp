import { buildMeta } from '../metadata.js';
import type { Database } from '../db.js';

interface Source {
  name: string;
  authority: string;
  official_url: string;
  retrieval_method: string;
  update_frequency: string;
  license: string;
  coverage: string;
  last_retrieved?: string;
}

export function handleListSources(db: Database): { sources: Source[]; _meta: ReturnType<typeof buildMeta> } {
  const lastIngest = db.get<{ value: string }>('SELECT value FROM db_metadata WHERE key = ?', ['last_ingest']);

  const sources: Source[] = [
    {
      name: 'Landbrugsstyrelsen tilskudsguide',
      authority: 'Landbrugsstyrelsen (Danish Agricultural Agency)',
      official_url: 'https://lbst.dk/tilskud-selvbetjening/',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Public sector information (Danish PSI)',
      coverage: 'Grundbetaling, eco-ordninger, agri-environment tilskud, investeringsstøtte, Fællesskema vejledning',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'CAP Strategisk Plan 2023-2027 for Danmark',
      authority: 'Ministeriet for Fødevarer, Landbrug og Fiskeri',
      official_url: 'https://lbst.dk/eu-LLP/LLP-perioden-2023-2027/',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'multi-annual (CAP period)',
      license: 'Public sector information (Danish PSI)',
      coverage: 'Scheme definitions, payment rates, eligibility criteria, GLM/GAEC conditionality requirements',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'EU-Kommissionen CAP implementation',
      authority: 'European Commission DG AGRI',
      official_url: 'https://agriculture.ec.europa.eu/cap-my-country/cap-strategic-plans_en',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'EU public data',
      coverage: 'Cross-reference for scheme types, GAEC standards, and eco-scheme design',
      last_retrieved: lastIngest?.value,
    },
    {
      name: 'GLM-krav (konditionalitet)',
      authority: 'Landbrugsstyrelsen',
      official_url: 'https://lbst.dk/tilskud-selvbetjening/konditionalitet/',
      retrieval_method: 'MANUAL_REVIEW',
      update_frequency: 'annual',
      license: 'Public sector information (Danish PSI)',
      coverage: 'GLM 1-9 (GAEC) conditionality requirements for all direct payment recipients',
      last_retrieved: lastIngest?.value,
    },
  ];

  return {
    sources,
    _meta: buildMeta({ source_url: 'https://lbst.dk/tilskud-selvbetjening/' }),
  };
}
