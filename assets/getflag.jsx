const getFlagEmoji = (countryCode) => {
  
  const countryCodeMap = {
    USA: 'US',
    CAN: 'CA',
    SWE: 'SE',
    FIN: 'FI',
    RUS: 'RU',
    CZE: 'CZ',
    SVK: 'SK',
    GER: 'DE',
    SUI: 'CH',
    DNK: 'DK',
    SLO: 'SI',
    AUT: 'AT',
    AUS: 'AU',
    BLR: 'BY',
    NET: 'NL',
    LAT: 'LV',
    NOR: 'NO',
    FRA: 'FR',
    JAM: 'JM'
  };

  const twoLetterCode = countryCodeMap[countryCode.toUpperCase()] || countryCode.slice(0, 2);
  return twoLetterCode
    .toUpperCase()
    .replace(/./g, char => String.fromCodePoint(127397 + char.charCodeAt(0)));
};

export default getFlagEmoji