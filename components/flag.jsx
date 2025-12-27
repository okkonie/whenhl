import { Text } from 'react-native';

const countryFlags = {
  FIN: '🇫🇮',
  USA: '🇺🇸',
  CAN: '🇨🇦',
  SWE: '🇸🇪',
  NOR: '🇳🇴',
  CZE: '🇨🇿',
  SLO: '🇸🇮',
  SVK: '🇸🇰',
  DEN: '🇩🇰',
  RUS: '🇷🇺',
  DEU: '🇩🇪',
  GER: '🇩🇪',
  CHE: '🇨🇭',
  SUI: '🇨🇭',
  AUT: '🇦🇹',
  LVA: '🇱🇻',
  LAT: '🇱🇻',
  BLR: '🇧🇾',
  GBR: '🇬🇧',
  FRA: '🇫🇷',
  SVN: '🇸🇮',
};

export default function Flag({ country, style }) {
  const flag = countryFlags[country] || '🏳️';
  return <Text style={style}>{flag}</Text>;
}
