import { buildMeta } from '../metadata.js';
import { SUPPORTED_JURISDICTIONS } from '../jurisdiction.js';

export function handleAbout() {
  return {
    name: 'Denmark Farm Subsidies MCP',
    description:
      'Danish farm subsidy schemes — grundbetaling, eco-ordninger, agri-environment tilskud, ' +
      'investeringsstøtte, GLM-krav (GAEC/konditionalitet), and Fællesskema guidance. ' +
      'Based on Landbrugsstyrelsen publications and the CAP Strategic Plan 2023-2027 for Denmark.',
    version: '0.1.0',
    jurisdiction: [...SUPPORTED_JURISDICTIONS],
    data_sources: [
      'Landbrugsstyrelsen (lbst.dk)',
      'CAP Strategisk Plan 2023-2027 for Danmark',
      'EU-Kommissionen',
    ],
    tools_count: 10,
    links: {
      homepage: 'https://ansvar.eu/open-agriculture',
      repository: 'https://github.com/ansvar-systems/dk-farm-subsidies-mcp',
      mcp_network: 'https://ansvar.ai/mcp',
    },
    _meta: buildMeta(),
  };
}
