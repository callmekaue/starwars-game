// Baralhos de personagens por lado da Força.
// Cada personagem usa a imagem images/<id>.jpg.
// Se a imagem ainda não existir, o jogo mostra uma carta holográfica com as iniciais.

const DECKS = {
  // heróis da República (The Clone Wars) e rebeldes (Rebels)
  jedi: [
    { id: 'anakin',     name: 'Anakin Skywalker', series: 'Clone Wars' },
    { id: 'obi-wan',    name: 'Obi-Wan Kenobi',   series: 'Clone Wars' },
    { id: 'ahsoka',     name: 'Ahsoka Tano',      series: 'Clone Wars' },
    { id: 'yoda',       name: 'Mestre Yoda',      series: 'Clone Wars' },
    { id: 'padme',      name: 'Padmé Amidala',    series: 'Clone Wars' },
    { id: 'rex',        name: 'Capitão Rex',      series: 'Clone Wars' },
    { id: 'c3po',       name: 'C-3PO',            series: 'Clone Wars' },
    { id: 'jar-jar',    name: 'Jar Jar Binks',    series: 'Clone Wars' },
    { id: 'r2d2',       name: 'R2-D2',            series: 'Clone Wars' },
    { id: 'mace-windu', name: 'Mace Windu',       series: 'Clone Wars' },
    { id: 'plo-koon',   name: 'Plo Koon',         series: 'Clone Wars' },
    { id: 'kit-fisto',  name: 'Kit Fisto',        series: 'Clone Wars' },
    { id: 'cody',       name: 'Comandante Cody',  series: 'Clone Wars' },
    { id: 'echo',       name: 'Echo',             series: 'Clone Wars' },
    { id: 'kanan',      name: 'Kanan Jarrus',     series: 'Rebels' },
    { id: 'ezra',       name: 'Ezra Bridger',     series: 'Rebels' },
    { id: 'hera',       name: 'Hera Syndulla',    series: 'Rebels' },
    { id: 'sabine',     name: 'Sabine Wren',      series: 'Rebels' },
    { id: 'zeb',        name: 'Zeb Orrelios',     series: 'Rebels' },
    { id: 'chopper',    name: 'Chopper',          series: 'Rebels' }
  ],

  // Sith, separatistas e Império
  sith: [
    { id: 'maul',               name: 'Darth Maul',         series: 'Clone Wars' },
    { id: 'sidious',            name: 'Darth Sidious',      series: 'Clone Wars' },
    { id: 'dooku',              name: 'Conde Dookan',       series: 'Clone Wars' },
    { id: 'ventress',           name: 'Asajj Ventress',     series: 'Clone Wars' },
    { id: 'grievous',           name: 'General Grievous',   series: 'Clone Wars' },
    { id: 'savage',             name: 'Savage Opress',      series: 'Clone Wars' },
    { id: 'talzin',             name: 'Mãe Talzin',         series: 'Clone Wars' },
    { id: 'cad-bane',           name: 'Cad Bane',           series: 'Clone Wars' },
    { id: 'barris',             name: 'Barriss Offee',      series: 'Clone Wars' },
    { id: 'pre-vizsla',         name: 'Pre Vizsla',         series: 'Clone Wars' },
    { id: 'vader',              name: 'Darth Vader',        series: 'Rebels' },
    { id: 'grande-inquisidor',  name: 'Grande Inquisidor',  series: 'Rebels' },
    { id: 'setima-irma',        name: 'Sétima Irmã',        series: 'Rebels' },
    { id: 'quinto-irmao',       name: 'Quinto Irmão',       series: 'Rebels' },
    { id: 'thrawn',             name: 'Grande Almirante Thrawn', series: 'Rebels' },
    { id: 'tarkin',             name: 'Governador Tarkin',  series: 'Rebels' }
  ]
};
