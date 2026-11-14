export const INITIAL_DEVICES = [
  {
    id: 'RB-A',
    tipus: 'Portàtil',
    model: 'Gaming PC Compacte Mini-ITX',
    estat: 'En prova',
    specs: {
      cpu: 'Intel i5-10400F',
      gpu: 'GTX 1660 Super',
      ram: '16GB Dual Channel',
      disc: '500GB SSD M.2',
    },
  },
  {
    id: 'RB-B',
    tipus: 'Portàtil',
    model: 'Gaming PC Tower Alpha',
    estat: 'Apte',
    specs: {
      cpu: 'Ryzen 5 3600',
      gpu: 'RTX 2060 6GB',
      ram: '16GB DDR4 3200',
      disc: '512GB NVMe SSD',
    },
  },
  {
    id: 'RB-C',
    tipus: 'Portàtil',
    model: 'Consola PS4 Pro Modding Custom',
    estat: 'Diagnosi',
    specs: {
      cpu: 'APU AMD Jaguar 8C',
      gpu: 'Thermal Paste OK',
      ram: '8GB GDDR5',
      disc: 'SSD 1TB Crucial MX',
    },
  },
];

export const TIPUS_EQUIP = [
  'Portàtil',
  'Ordinador de sobretaula',
  'Servidor',
  'Tauleta',
  'Monitor',
];

export const ESTATS_DISPONIBLES = [
  'En prova',
  'Apte',
  'Diagnosi',
];
