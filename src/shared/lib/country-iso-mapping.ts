/**
 * Maps country names (as stored in the DB, from PROJECT_COUNTRIES in constants.ts)
 * to ISO 3166-1 numeric codes used in the world-atlas TopoJSON file.
 *
 * Countries that are too small to appear in the 110m resolution TopoJSON
 * (Andorra, Liechtenstein, Luxembourg, Malta, Monaco, San Marino, Vatican City)
 * are mapped to null and will be skipped on the map.
 */
export const COUNTRY_NUMERIC_ISO: Record<string, string | null> = {
  Albania: '008',
  Andorra: null, // too small for 110m resolution
  Armenia: '051',
  Austria: '040',
  Azerbaijan: '031',
  Belarus: '112',
  Belgium: '056',
  'Bosnia and Herzegovina': '070',
  Bulgaria: '100',
  Croatia: '191',
  Cyprus: '196',
  'Czech Republic': '203',
  Denmark: '208',
  Estonia: '233',
  Finland: '246',
  France: '250',
  Georgia: '268',
  Germany: '276',
  Greece: '300',
  Hungary: '348',
  Iceland: '352',
  Ireland: '372',
  Italy: '380',
  Kazakhstan: '398',
  Latvia: '428',
  Liechtenstein: null, // too small for 110m resolution
  Lithuania: '440',
  Luxembourg: null, // too small for 110m resolution
  Malta: null, // too small for 110m resolution
  Moldova: '498',
  Monaco: null, // too small for 110m resolution
  Montenegro: '499',
  Netherlands: '528',
  'North Macedonia': '807',
  Norway: '578',
  Poland: '616',
  Portugal: '620',
  Romania: '642',
  Russia: '643',
  'San Marino': null, // too small for 110m resolution
  Serbia: '688',
  Slovakia: '703',
  Slovenia: '705',
  Spain: '724',
  Sweden: '752',
  Switzerland: '756',
  Turkey: '792',
  Ukraine: '804',
  'United Kingdom': '826',
  'Vatican City': null, // too small for 110m resolution
};

/** Reverse lookup: numeric ISO code → country name */
export const NUMERIC_ISO_COUNTRY: Record<string, string> = Object.fromEntries(
  Object.entries(COUNTRY_NUMERIC_ISO)
    .filter(([, code]) => code !== null)
    .map(([name, code]) => [code as string, name])
);
