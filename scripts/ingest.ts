/**
 * Denmark Farm Subsidies MCP — Data Ingestion Script
 *
 * Populates the SQLite database with Danish agricultural subsidy data from:
 * - Landbrugsstyrelsen (Danish Agricultural Agency)
 * - CAP Strategisk Plan 2023-2027 for Denmark
 * - EU Commission CAP implementation data
 *
 * Usage: npm run ingest
 */

import { createDatabase } from '../src/db.js';
import { mkdirSync, writeFileSync } from 'fs';

mkdirSync('data', { recursive: true });
const db = createDatabase('data/database.db');

const now = new Date().toISOString().split('T')[0];

// ---------------------------------------------------------------------------
// 1. SCHEMES
// ---------------------------------------------------------------------------

const schemes: {
  id: string;
  name: string;
  scheme_type: string;
  authority: string;
  status: string;
  start_date: string;
  description: string;
  eligibility_summary: string;
  application_window: string;
}[] = [
  {
    id: 'grundbetaling',
    name: 'Grundbetaling',
    scheme_type: 'direct_payment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Grundbetaling baseret paa betalingsrettigheder. Ca. 1.600 DKK/ha efter konvergens. ' +
      'Alle landbrugere med betalingsrettigheder og stoetteberettigede arealer kan soege. ' +
      'Arealet skal vaere til raadighed den 15. maj og drives aktivt.',
    eligibility_summary:
      'Mindst 2 ha stoetteberettiget areal. Betalingsrettigheder paakraevet. ' +
      'Arealet skal opfylde krav om landbrugsaktivitet.',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'omfordelingsstoette',
    name: 'Omfordelingsstoette',
    scheme_type: 'direct_payment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Forhojet sats paa de foerste 67,14 ha. Ca. 600 DKK/ha. ' +
      'Automatisk tilskud til alle grundbetalingsmodtagere for de foerste hektarer.',
    eligibility_summary:
      'Alle grundbetalingsmodtagere. Gaelder automatisk for de foerste 67,14 ha.',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'eco-biodiversitet',
    name: 'Eco-ordning: Biodiversitet og baeredygtighed',
    scheme_type: 'eco_scheme',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Tilskud for biodiversitetsfremmende tiltag. 1.264 DKK/ha. ' +
      'Omfatter blomsterbrak, bestoverbrak og smaabiotoper. ' +
      'Arealet skal etableres med godkendte froeblandinger.',
    eligibility_summary:
      'Omdriftsarealer. Krav om etablering af godkendte blomstertiltag. ' +
      'Min. 0,5 ha sammenhaengende areal.',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'eco-varieret',
    name: 'Eco-ordning: Varieret planteproduktion',
    scheme_type: 'eco_scheme',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Krav om min. 4 afgroeder. 261 DKK/ha. ' +
      'Fremmer afgroedediversitet og reducerer monokulturer.',
    eligibility_summary:
      'Min. 4 forskellige afgroeder paa bedriften. Ingen afgroede maa udgore mere end 65% af omdriftsarealet.',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'eco-graes',
    name: 'Eco-ordning: Miljo- og klimavenligt graes',
    scheme_type: 'eco_scheme',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Ekstensivt graes uden goedning og sprojtning. 2.100 DKK/ha. ' +
      'Alternativt med begraenset goedning: 1.500 DKK/ha. ' +
      'Fremmer biodiversitet paa graesarealer.',
    eligibility_summary:
      'Permanente graesarealer eller omdriftsgraes. Forbud mod sprojtning. ' +
      'Valg mellem nul-goedning (2.100 DKK/ha) og begraenset goedning (1.500 DKK/ha).',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'oekologisk-arealtilskud',
    name: 'Oekologisk Arealtilskud',
    scheme_type: 'agri_environment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Tilskud til oekologisk drift. Omlaegning ca. 1.050 DKK/ha, opretholdelse ca. 870 DKK/ha. ' +
      'Specialafgroeder ca. 1.200 DKK/ha. ' +
      'Kraever autoriseret oekologisk produktion.',
    eligibility_summary:
      'Autoriseret oekologisk landbruger. Arealet skal drives oekologisk. ' +
      '5-aarigt tilsagn.',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'pleje-naturarealer',
    name: 'Pleje af graes- og naturarealer',
    scheme_type: 'agri_environment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Tilskud til ekstensiv afgraesning (ca. 2.600 DKK/ha) eller slaet (ca. 1.800 DKK/ha) af naturarealer. ' +
      'Saerlig pleje ca. 3.200 DKK/ha. ' +
      'Bidrager til vedligeholdelse af vaerdifulde naturomraader.',
    eligibility_summary:
      'Naturarealer, permanente graesarealer i Natura 2000 eller HNV-omraader. ' +
      '5-aarigt tilsagn.',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'miljoeteknologi',
    name: 'Miljoeteknologi',
    scheme_type: 'investment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Investeringsstoette til staldteknologi. Op til 40% medfinansiering. ' +
      'Reducerer ammoniak-, lugt- og drivhusgasudledninger fra husdyrproduktion.',
    eligibility_summary:
      'Husdyrproducenter. Investeringen skal reducere miljobelastning. ' +
      'Krav om forhindsgodkendelse.',
    application_window: 'Loebende ansogningsrunder (se lbst.dk)',
  },
  {
    id: 'skovrejsning',
    name: 'Tilskud til skovrejsning',
    scheme_type: 'investment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Tilskud til etablering af ny skov. Krav om min. 75% loevtrae. ' +
      'Bidrager til CO2-binding, grundvandsbeskyttelse og biodiversitet.',
    eligibility_summary:
      'Landbrugsareal. Min. 2 ha sammenhaengende. Krav om 75% loevtrae. ' +
      'Tinglyses som fredskov.',
    application_window: 'Loebende ansogningsrunder (se lbst.dk)',
  },
  {
    id: 'minivaadomraader',
    name: 'Tilskud til minivaadomraader',
    scheme_type: 'investment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Etableringstilskud til kvaelstoffjernelse via konstruerede vaadomraader. ' +
      'Aabenland-minivaadomraader og lukkede filterloesninger.',
    eligibility_summary:
      'Landbrugsjord i oplandsomraader med kvaelstofbelastning. ' +
      'Krav om minimum kvaelstoffjernelseseffekt.',
    application_window: 'Loebende ansogningsrunder (se lbst.dk)',
  },
  {
    id: 'oe-stoette',
    name: 'Oe-stoette',
    scheme_type: 'direct_payment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Saerligt tilskud til landbrug paa 27 danske smaaroeer. ' +
      'Kompensation for oe-specifikke meromkostninger.',
    eligibility_summary:
      'Landbrug paa en af de 27 stoetteberettigede smaaroeer (fx Aeroe, Samso, Laeso, Bornholm undtaget).',
    application_window: 'Faellesskema: 1. februar - 25. april',
  },
  {
    id: 'modernisering',
    name: 'Moderniseringsstoette',
    scheme_type: 'investment',
    authority: 'Landbrugsstyrelsen',
    status: 'active',
    start_date: '2023-01-01',
    description:
      'Investeringer i primaer jordbrugsproduktion. Forhojet sats for unge landbrugere. ' +
      'Stoetter modernisering af produktionsapparatet.',
    eligibility_summary:
      'Primaerproducenter. Forhojet sats for landbrugere under 41 aar. ' +
      'Investeringen skal forbedre bedriftens samlede ydeevne.',
    application_window: 'Loebende ansogningsrunder (se lbst.dk)',
  },
];

const insertScheme = db.instance.prepare(`
  INSERT OR REPLACE INTO schemes (id, name, scheme_type, authority, status, start_date, description, eligibility_summary, application_window, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'DK')
`);

for (const s of schemes) {
  insertScheme.run(s.id, s.name, s.scheme_type, s.authority, s.status, s.start_date, s.description, s.eligibility_summary, s.application_window);
}
console.log(`Inserted ${schemes.length} schemes.`);

// ---------------------------------------------------------------------------
// 2. SCHEME OPTIONS
// ---------------------------------------------------------------------------

const schemeOptions: {
  id: string;
  scheme_id: string;
  code: string;
  name: string;
  description: string;
  payment_rate: number;
  payment_unit: string;
  eligible_land_types: string;
  requirements: string;
  duration_years: number;
  stacking_rules: string;
}[] = [
  // eco-biodiversitet options
  {
    id: 'eco-bio-blomsterbrak',
    scheme_id: 'eco-biodiversitet',
    code: 'BIO-1',
    name: 'Blomsterbrak',
    description: 'Etablering af blomsterbrak med godkendt froeblanding. Fremmer bestoevere og insekter.',
    payment_rate: 1264,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal',
    requirements: 'Godkendt froeblanding. Ingen sprojtning eller goedning. Min. 0,5 ha.',
    duration_years: 1,
    stacking_rules: 'Kan kombineres med grundbetaling og omfordelingsstoette.',
  },
  {
    id: 'eco-bio-bestoverbrak',
    scheme_id: 'eco-biodiversitet',
    code: 'BIO-2',
    name: 'Bestoverbrak',
    description: 'Brak med saerlige bestoevervenlige blomstertiltag. Hoej vaerdi for vilde bier.',
    payment_rate: 1264,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal',
    requirements: 'Saerlig bestoeverfroeblanding. Ingen jordbearbejdning 1. april - 31. august.',
    duration_years: 1,
    stacking_rules: 'Kan kombineres med grundbetaling og omfordelingsstoette.',
  },
  {
    id: 'eco-bio-smaabiotoper',
    scheme_id: 'eco-biodiversitet',
    code: 'BIO-3',
    name: 'Smaabiotoper',
    description: 'Etablering af smaabiotoper som stenroser, insektvolde eller vandhuller.',
    payment_rate: 1264,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal',
    requirements: 'Permanente landskabselementer. Min. 3 forskellige typer pr. 10 ha.',
    duration_years: 1,
    stacking_rules: 'Kan kombineres med grundbetaling og omfordelingsstoette.',
  },
  // eco-varieret options
  {
    id: 'eco-var-basis',
    scheme_id: 'eco-varieret',
    code: 'VAR-1',
    name: 'Varieret planteproduktion - basis',
    description: 'Krav om minimum 4 afgroeder paa bedriften. Ingen afgroede over 65% af omdriftsarealet.',
    payment_rate: 261,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal',
    requirements: 'Min. 4 afgroeder. Max 65% af arealet med en enkelt afgroede. Min. 5% med baelgplanter eller braklaeggelse.',
    duration_years: 1,
    stacking_rules: 'Kan kombineres med alle oevrige eco-ordninger, grundbetaling og omfordelingsstoette.',
  },
  // eco-graes options
  {
    id: 'eco-graes-nul',
    scheme_id: 'eco-graes',
    code: 'GRAES-1',
    name: 'Uden goedning og sprojtning',
    description: 'Ekstensivt graes helt uden tilfoersel af goedning og plantebeskyttelsesmidler.',
    payment_rate: 2100,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'permanent graes, omdriftsgraes',
    requirements: 'Ingen goedning. Ingen sprojtning. Min. afgraesning eller slaet.',
    duration_years: 1,
    stacking_rules: 'Kan kombineres med grundbetaling og pleje af naturarealer (dog reduceret sats).',
  },
  {
    id: 'eco-graes-begraenset',
    scheme_id: 'eco-graes',
    code: 'GRAES-2',
    name: 'Med begraenset goedning',
    description: 'Graes med begraenset goedning (max 100 kg N/ha). Ingen sprojtning.',
    payment_rate: 1500,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'permanent graes, omdriftsgraes',
    requirements: 'Max 100 kg N/ha. Ingen sprojtning. Min. afgraesning eller slaet.',
    duration_years: 1,
    stacking_rules: 'Kan kombineres med grundbetaling.',
  },
  // oekologisk-arealtilskud options
  {
    id: 'oeko-omlaegning',
    scheme_id: 'oekologisk-arealtilskud',
    code: 'OEKO-1',
    name: 'Omlaegningstilskud',
    description: 'Tilskud under omlaegningsperioden til oekologisk drift (typisk 2 aar).',
    payment_rate: 1050,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal, permanent graes',
    requirements: 'Under omlaegning til autoriseret oekologisk produktion. 5-aarigt tilsagn.',
    duration_years: 5,
    stacking_rules: 'Kan kombineres med grundbetaling og eco-ordninger.',
  },
  {
    id: 'oeko-opretholdelse',
    scheme_id: 'oekologisk-arealtilskud',
    code: 'OEKO-2',
    name: 'Opretholdelsestilskud',
    description: 'Tilskud til opretholdelse af allerede omlagt oekologisk drift.',
    payment_rate: 870,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal, permanent graes',
    requirements: 'Autoriseret oekologisk produktion. 5-aarigt tilsagn.',
    duration_years: 5,
    stacking_rules: 'Kan kombineres med grundbetaling og eco-ordninger.',
  },
  {
    id: 'oeko-specialafgroeder',
    scheme_id: 'oekologisk-arealtilskud',
    code: 'OEKO-3',
    name: 'Specialafgroeder',
    description: 'Forhojet tilskud til oekologiske specialafgroeder (frugt, groent, baer).',
    payment_rate: 1200,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'omdriftsareal med specialafgroeder',
    requirements: 'Autoriseret oekologisk produktion. Dyrkning af frugt, groentsager eller baer.',
    duration_years: 5,
    stacking_rules: 'Kan kombineres med grundbetaling. Erstatter basis oekologitilskud.',
  },
  // pleje-naturarealer options
  {
    id: 'pleje-afgraesning',
    scheme_id: 'pleje-naturarealer',
    code: 'PLEJE-1',
    name: 'Afgraesning',
    description: 'Tilskud til ekstensiv afgraesning af naturarealer med kvaeg, faar eller heste.',
    payment_rate: 2600,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'naturarealer, permanente graesarealer, Natura 2000',
    requirements: 'Afgraesning min. 1. juni - 15. september. Max belaegningsgrad. Ingen tilskudsfodring.',
    duration_years: 5,
    stacking_rules: 'Kan kombineres med grundbetaling. Reduceret eco-graes-sats ved kombination.',
  },
  {
    id: 'pleje-slaet',
    scheme_id: 'pleje-naturarealer',
    code: 'PLEJE-2',
    name: 'Slaet',
    description: 'Tilskud til aarlig slaet (hoest) af naturarealer med fjernelse af biomasse.',
    payment_rate: 1800,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'naturarealer, permanente graesarealer, engarealer',
    requirements: 'Min. 1 slaet pr. aar. Biomasse skal fjernes fra arealet.',
    duration_years: 5,
    stacking_rules: 'Kan kombineres med grundbetaling.',
  },
  {
    id: 'pleje-saerlig',
    scheme_id: 'pleje-naturarealer',
    code: 'PLEJE-3',
    name: 'Saerlig pleje',
    description: 'Forhojet tilskud til saerlig naturpleje paa saerligt vaerdifulde naturarealer.',
    payment_rate: 3200,
    payment_unit: 'DKK/ha',
    eligible_land_types: 'hoejvaerdige naturarealer, Natura 2000 habitattyper',
    requirements: 'Saerlige plejekrav fastsat af kommunen/Miljostyrelsen. Naturfaglig vurdering paakraevet.',
    duration_years: 5,
    stacking_rules: 'Kan kombineres med grundbetaling. Erstatter basis plejetilskud.',
  },
];

const insertOption = db.instance.prepare(`
  INSERT OR REPLACE INTO scheme_options (id, scheme_id, code, name, description, payment_rate, payment_unit, eligible_land_types, requirements, duration_years, stacking_rules, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'DK')
`);

for (const o of schemeOptions) {
  insertOption.run(o.id, o.scheme_id, o.code, o.name, o.description, o.payment_rate, o.payment_unit, o.eligible_land_types, o.requirements, o.duration_years, o.stacking_rules);
}
console.log(`Inserted ${schemeOptions.length} scheme options.`);

// ---------------------------------------------------------------------------
// 3. CROSS-COMPLIANCE / GLM-KRAV (GAEC 1-9)
// ---------------------------------------------------------------------------

const crossCompliance: {
  id: string;
  requirement: string;
  category: string;
  reference: string;
  description: string;
  applies_to: string;
}[] = [
  {
    id: 'glm-1',
    requirement: 'Opretholdelse af permanent graes',
    category: 'GLM',
    reference: 'GAEC 1 / GLM 1',
    description:
      'Andelen af permanent graes i forhold til det samlede landbrugsareal maa ikke falde mere end 5% i forhold til referenceaaret. ' +
      'Hvis graensen overskrides, kan landbrugere paalaegges at genudlaegge graesarealer.',
    applies_to: 'Alle stoettemodtagere med permanent graes',
  },
  {
    id: 'glm-2',
    requirement: 'Beskyttelse af vaadomraader og toervejorde',
    category: 'GLM',
    reference: 'GAEC 2 / GLM 2',
    description:
      'Forbud mod omlaegning og ploejning af vaadomraader og toervejorde. ' +
      'Beskytter kulstofrige jorde mod CO2-udledning ved draeningsoplaegning.',
    applies_to: 'Alle stoettemodtagere med vaadomraader eller toervejorde',
  },
  {
    id: 'glm-3',
    requirement: 'Forbud mod afbraending af stubmarker',
    category: 'GLM',
    reference: 'GAEC 3 / GLM 3',
    description:
      'Generelt forbud mod afbraending af stub og planterester paa markerne. ' +
      'Undtagelser for froegraes efter hoest, hvor afbraending er tilladt for froegraesmarker.',
    applies_to: 'Alle stoettemodtagere',
  },
  {
    id: 'glm-4',
    requirement: 'Etablering af braemmer langs vandloeb og soeer',
    category: 'GLM',
    reference: 'GAEC 4 / GLM 4',
    description:
      'Krav om etablering af 3-meter braemmer langs vandloeb og soeer. ' +
      'Braemmen maa ikke sproejtes, goedes eller plojes. Beskytter vandmiljoet.',
    applies_to: 'Alle stoettemodtagere med arealer langs vandloeb',
  },
  {
    id: 'glm-5',
    requirement: 'Jordbearbejdning for at begraense erosion',
    category: 'GLM',
    reference: 'GAEC 5 / GLM 5',
    description:
      'Forbud mod ploejning paa skraaninger med haeldning over 12% i vinterperioden (15. oktober - 1. februar). ' +
      'Krav om taet plantedaekke paa erosionsfrolige arealer.',
    applies_to: 'Alle stoettemodtagere med erosionsfrolige arealer',
  },
  {
    id: 'glm-6',
    requirement: 'Minimum jorddaekke i foelsamme perioder',
    category: 'GLM',
    reference: 'GAEC 6 / GLM 6',
    description:
      'Krav om jorddaekke i foelsomme perioder. Kan opfyldes via efterafgroeder, stub, vintersaed eller ' +
      'andre former for plantedaekke. Reducerer kvaelstofudvaskning og erosion.',
    applies_to: 'Alle stoettemodtagere med omdriftsareal',
  },
  {
    id: 'glm-7',
    requirement: 'Saedskifte',
    category: 'GLM',
    reference: 'GAEC 7 / GLM 7',
    description:
      'Krav om saedskifte paa omdriftsarealer. Min. 3 afgroeder, ingen afgroede over 65% af arealet. ' +
      'Fremmer jordkvalitet og reducerer sygdomstryk. Undtagelse for bedrifter under 10 ha omdriftsareal.',
    applies_to: 'Alle stoettemodtagere med omdriftsareal over 10 ha',
  },
  {
    id: 'glm-8',
    requirement: 'Mindst 4% ikke-produktive arealer',
    category: 'GLM',
    reference: 'GAEC 8 / GLM 8',
    description:
      'Krav om mindst 4% ikke-produktive arealer af bedriftens omdriftsareal. ' +
      'Kan opfyldes via brak, landskabselementer, bufferzoner eller levende hegn. ' +
      'Alternativt 7% med eco-ordning (reduceret til 4% krav).',
    applies_to: 'Alle stoettemodtagere med omdriftsareal',
  },
  {
    id: 'glm-9',
    requirement: 'Forbud mod omlaegning af miljofoelsomme permanente graesarealer',
    category: 'GLM',
    reference: 'GAEC 9 / GLM 9',
    description:
      'Forbud mod omlaegning, ploejning og omdannelse af permanente graesarealer i Natura 2000-omraader. ' +
      'Beskytter biodiversitet og habitater udpeget under fuglebeskyttelses- og habitatdirektiverne.',
    applies_to: 'Alle stoettemodtagere med permanent graes i Natura 2000',
  },
];

const insertCompliance = db.instance.prepare(`
  INSERT OR REPLACE INTO cross_compliance (id, requirement, category, reference, description, applies_to, jurisdiction)
  VALUES (?, ?, ?, ?, ?, ?, 'DK')
`);

for (const c of crossCompliance) {
  insertCompliance.run(c.id, c.requirement, c.category, c.reference, c.description, c.applies_to);
}
console.log(`Inserted ${crossCompliance.length} cross-compliance (GLM) requirements.`);

// ---------------------------------------------------------------------------
// 4. FTS5 SEARCH INDEX
// ---------------------------------------------------------------------------

// Clear existing index
db.run('DELETE FROM search_index');

// Index schemes
for (const s of schemes) {
  db.run(
    'INSERT INTO search_index (title, body, scheme_type, jurisdiction) VALUES (?, ?, ?, ?)',
    [s.name, `${s.description} ${s.eligibility_summary}`, s.scheme_type, 'DK']
  );
}

// Index scheme options
for (const o of schemeOptions) {
  const parentScheme = schemes.find(s => s.id === o.scheme_id);
  db.run(
    'INSERT INTO search_index (title, body, scheme_type, jurisdiction) VALUES (?, ?, ?, ?)',
    [
      `${parentScheme?.name ?? o.scheme_id} - ${o.name}`,
      `${o.description} ${o.requirements} ${o.eligible_land_types} ${o.stacking_rules}`,
      parentScheme?.scheme_type ?? 'unknown',
      'DK',
    ]
  );
}

// Index cross-compliance
for (const c of crossCompliance) {
  db.run(
    'INSERT INTO search_index (title, body, scheme_type, jurisdiction) VALUES (?, ?, ?, ?)',
    [
      `${c.reference}: ${c.requirement}`,
      `${c.description} ${c.applies_to}`,
      'cross_compliance',
      'DK',
    ]
  );
}

// Index application calendar as searchable content
const calendarEntries = [
  {
    title: 'Faellesskema - ansogningsperiode',
    body: 'Faellesskema aabner 1. februar. Frist for indsendelse er 25. april. ' +
      'Alle areal- og dyrebaserede tilskud soeges via Faellesskemaet paa lbst.dk. ' +
      'Forudbetaling udbetales i oktober, slutbetaling i december.',
  },
  {
    title: 'Betalingskalender - grundbetaling og eco-ordninger',
    body: 'Forudbetaling (ca. 70%) udbetales i oktober. Slutbetaling udbetales i december. ' +
      'Kontrolresultater kan forsinke betalinger. Betalingsrettigheder skal vaere registreret foer fristens udloeb.',
  },
  {
    title: 'Investeringsstoette - ansogningsrunder',
    body: 'Miljoeteknologi, skovrejsning, minivaadomraader og moderniseringsstoette har loebende ansogningsrunder. ' +
      'Se aktuelle frister paa lbst.dk. Typisk 2-4 runder pr. aar.',
  },
];

for (const entry of calendarEntries) {
  db.run(
    'INSERT INTO search_index (title, body, scheme_type, jurisdiction) VALUES (?, ?, ?, ?)',
    [entry.title, entry.body, 'application_guidance', 'DK']
  );
}

console.log(
  `Built FTS index: ${schemes.length} schemes + ${schemeOptions.length} options + ${crossCompliance.length} GLM + ${calendarEntries.length} calendar entries = ` +
  `${schemes.length + schemeOptions.length + crossCompliance.length + calendarEntries.length} total entries.`
);

// ---------------------------------------------------------------------------
// 5. DB METADATA
// ---------------------------------------------------------------------------

const metaEntries: [string, string][] = [
  ['last_ingest', now],
  ['build_date', now],
  ['schema_version', '1.0'],
  ['mcp_name', 'Denmark Farm Subsidies MCP'],
  ['jurisdiction', 'DK'],
  ['data_source', 'Landbrugsstyrelsen (lbst.dk), CAP Strategisk Plan 2023-2027, EU-Kommissionen'],
  ['scheme_count', String(schemes.length)],
  ['option_count', String(schemeOptions.length)],
  ['cross_compliance_count', String(crossCompliance.length)],
  ['disclaimer', 'Oplysningerne er vejledende. Kontakt Landbrugsstyrelsen eller din landbrugsraadgiver for aktuel information om stoettemuligheder og ansogningsfrister.'],
];

for (const [key, value] of metaEntries) {
  db.run('INSERT OR REPLACE INTO db_metadata (key, value) VALUES (?, ?)', [key, value]);
}

// ---------------------------------------------------------------------------
// 6. COVERAGE FILE
// ---------------------------------------------------------------------------

writeFileSync(
  'data/coverage.json',
  JSON.stringify(
    {
      mcp_name: 'Denmark Farm Subsidies MCP',
      jurisdiction: 'DK',
      build_date: now,
      status: 'populated',
      schemes: schemes.length,
      scheme_options: schemeOptions.length,
      cross_compliance_requirements: crossCompliance.length,
      fts_entries: schemes.length + schemeOptions.length + crossCompliance.length + calendarEntries.length,
      data_sources: [
        'Landbrugsstyrelsen (lbst.dk)',
        'CAP Strategisk Plan 2023-2027 for Danmark',
        'EU-Kommissionen',
      ],
      disclaimer:
        'Oplysningerne er vejledende. Kontakt Landbrugsstyrelsen eller din landbrugsraadgiver for aktuel information om stoettemuligheder og ansogningsfrister.',
    },
    null,
    2
  )
);

db.close();
console.log('Ingestion complete. Database: data/database.db');
