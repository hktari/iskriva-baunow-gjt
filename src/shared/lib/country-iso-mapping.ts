/**
 * Maps country names (as stored in the DB, from PROJECT_COUNTRIES in constants.ts)
 * to ISO 3166-1 numeric codes used in the world-atlas TopoJSON file.
 *
 * Countries that are too small to appear in the 110m resolution TopoJSON
 * (Andorra, Liechtenstein, Luxembourg, Malta, Monaco, San Marino, Vatican City)
 * are mapped to null and will be skipped on the map.
 */
export const COUNTRY_NUMERIC_ISO: Record<string, string | null> = {
  Albania: null, // not EU
  Andorra: null, // too small for 110m resolution
  Armenia: null, // not EU
  Austria: '040',
  Azerbaijan: null, // not EU
  Belarus: null, // not EU
  Belgium: '056',
  'Bosnia and Herzegovina': null, // not EU
  Bulgaria: '100',
  Croatia: '191',
  Cyprus: '196',
  'Czech Republic': '203',
  Denmark: '208',
  Estonia: '233',
  Finland: '246',
  France: '250',
  Georgia: null, // not EU
  Germany: '276',
  Greece: '300',
  Hungary: '348',
  Iceland: null, // not EU
  Ireland: '372',
  Italy: '380',
  Kazakhstan: null, // not EU
  Latvia: '428',
  Liechtenstein: null, // too small for 110m resolution
  Lithuania: '440',
  Luxembourg: '442', // too small for 110m resolution
  Malta: '470', // too small for 110m resolution
  Moldova: null, // not EU
  Monaco: null, // too small for 110m resolution
  Montenegro: null, // not EU
  Netherlands: '528',
  'North Macedonia': null, // not EU
  Norway: null, // not EU
  Poland: '616',
  Portugal: '620',
  Romania: '642',
  Russia: null, // not EU
  'San Marino': null, // too small for 110m resolution
  Serbia: null, // not EU
  Slovakia: '703',
  Slovenia: '705',
  Spain: '724',
  Sweden: '752',
  Switzerland: null, // not EU
  Turkey: null, // not EU
  Ukraine: null, // not EU
  'United Kingdom': null, // not EU
  'Vatican City': null, // too small for 110m resolution
};

/** Reverse lookup: numeric ISO code → country name */
export const NUMERIC_ISO_COUNTRY: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_NUMERIC_ISO)
    .filter(([, code]) => code !== null)
    .map(([name, code]) => [code as string, name])
);

/** EU member country numeric ISO codes - these are the only interactable countries on the map */
export const EU_COUNTRY_CODES = new Set([
  '040', // Austria
  '056', // Belgium
  '100', // Bulgaria
  '191', // Croatia
  '196', // Cyprus
  '203', // Czech Republic
  '208', // Denmark
  '233', // Estonia
  '246', // Finland
  '250', // France
  '276', // Germany
  '300', // Greece
  '348', // Hungary
  '372', // Ireland
  '380', // Italy
  '428', // Latvia
  '440', // Lithuania
  '528', // Netherlands
  '616', // Poland
  '620', // Portugal
  '642', // Romania
  '703', // Slovakia
  '705', // Slovenia
  '724', // Spain
  '752', // Sweden
]);
