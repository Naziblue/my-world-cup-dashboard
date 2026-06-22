const FIFA_TO_ISO2: Record<string, string> = {
  MEX:'mx',KOR:'kr',CZE:'cz',RSA:'za',CAN:'ca',SUI:'ch',BIH:'ba',QAT:'qa',
  BRA:'br',MAR:'ma',SCO:'gb-sct',HAI:'ht',USA:'us',AUS:'au',PAR:'py',TUR:'tr',
  GER:'de',CIV:'ci',ECU:'ec',CUW:'cw',NED:'nl',JPN:'jp',SWE:'se',TUN:'tn',
  EGY:'eg',IRN:'ir',BEL:'be',NZL:'nz',ESP:'es',URU:'uy',CPV:'cv',KSA:'sa',
  NOR:'no',FRA:'fr',SEN:'sn',IRQ:'iq',ARG:'ar',AUT:'at',JOR:'jo',ALG:'dz',
  COL:'co',COD:'cd',POR:'pt',UZB:'uz',ENG:'gb-eng',GHA:'gh',PAN:'pa',CRO:'hr',
};

export function getFlagUrl(code: string, width = 640): string {
  const iso = FIFA_TO_ISO2[code];
  return iso ? `https://flagcdn.com/w${width}/${iso}.png` : '';
}

const NATIONAL_COLORS: Record<string, string[]> = {
  MEX: ['#006847','#FFFFFF','#CE1126'],
  KOR: ['#CD2E3A','#FFFFFF','#0047A0'],
  CZE: ['#FFFFFF','#D7141A','#11457E'],
  RSA: ['#007749','#FFB81C','#000000','#DE3831','#002395'],
  CAN: ['#FF0000','#FFFFFF','#FF0000'],
  SUI: ['#FF0000','#FFFFFF','#FF0000'],
  BIH: ['#002395','#FECB00','#FFFFFF'],
  QAT: ['#8A1538','#FFFFFF','#8A1538'],
  BRA: ['#009C3B','#FFDF00','#002776'],
  MAR: ['#C1272D','#006233','#C1272D'],
  SCO: ['#003399','#FFFFFF','#003399'],
  HAI: ['#00209F','#D21034'],
  USA: ['#B31942','#FFFFFF','#0A3161'],
  AUS: ['#00008B','#FFFFFF','#FF0000'],
  PAR: ['#D52B1E','#FFFFFF','#0038A8'],
  TUR: ['#E30A17','#FFFFFF','#E30A17'],
  GER: ['#000000','#DD0000','#FFCC00'],
  CIV: ['#FF8200','#FFFFFF','#009A44'],
  ECU: ['#FFD100','#034EA2','#CE1126'],
  CUW: ['#002B7F','#F9E814','#002B7F'],
  NED: ['#AE1C28','#FFFFFF','#21468B'],
  JPN: ['#FFFFFF','#BC002D','#FFFFFF'],
  SWE: ['#006AA7','#FECC02','#006AA7'],
  TUN: ['#E70013','#FFFFFF','#E70013'],
  EGY: ['#CE1126','#FFFFFF','#000000'],
  IRN: ['#239F40','#FFFFFF','#DA0000'],
  BEL: ['#000000','#FAE042','#ED2939'],
  NZL: ['#00247D','#FFFFFF','#CC142B'],
  ESP: ['#AA151B','#F1BF00','#AA151B'],
  URU: ['#0038A8','#FFFFFF','#0038A8'],
  CPV: ['#003893','#F7D116','#CF2027'],
  KSA: ['#006C35','#FFFFFF','#006C35'],
  NOR: ['#EF2B2D','#FFFFFF','#002868'],
  FRA: ['#002395','#FFFFFF','#ED2939'],
  SEN: ['#00853F','#FDEF42','#E31B23'],
  IRQ: ['#CE1126','#FFFFFF','#007A3D'],
  ARG: ['#74ACDF','#FFFFFF','#74ACDF'],
  AUT: ['#ED2939','#FFFFFF','#ED2939'],
  JOR: ['#000000','#FFFFFF','#007A3D','#CE1126'],
  ALG: ['#006233','#FFFFFF','#D21034'],
  COL: ['#FCD116','#003893','#CE1126'],
  COD: ['#007FFF','#F7D618','#CE1021'],
  POR: ['#006600','#FF0000'],
  UZB: ['#0099B5','#FFFFFF','#1EB53A','#CE1126'],
  ENG: ['#FFFFFF','#CF081F','#FFFFFF'],
  GHA: ['#EF3340','#FCD116','#009739'],
  PAN: ['#005293','#FFFFFF','#D21034'],
  CRO: ['#FF0000','#FFFFFF','#171796'],
};

export function getNationalColors(code: string): string[] {
  return NATIONAL_COLORS[code] ?? ['#333','#666','#999'];
}
