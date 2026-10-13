/*
 * Conteúdo da landing da Volts Training Studio.
 *
 * Regra deste arquivo: só entra o que a própria Volts publicou (Instagram @voltsstudio,
 * Linktree e o panfleto da camisa oficial). O que ainda não foi confirmado fica como
 * `null` ou com `provisorio: true`; a página mostra um texto honesto no lugar
 * ("consulte pelo WhatsApp") e o modo revisão (?revisao na URL) destaca cada ponto.
 * A lista completa do que falta está em volts/PENDENCIAS.md.
 */

export const contato = {
  whatsapp: '558132998046', // Linktree oficial (wa.me/558132998046)
  telefone: '(81) 3299-8046',
  telefoneLink: 'tel:+558132998046',
  instagram: 'https://www.instagram.com/voltsstudio/',
  instagramUsuario: '@voltsstudio',
  // "Volts Studio | Agendamento de aulas" no Linktree: sistema que os alunos já usam
  areaDoAluno: 'https://app.nextfit.com.br/login',
  endereco: 'Rua Francisco Ambrosio de Barros Leite, 43',
  cidade: 'Olinda, PE',
  referencia: 'Na rua do antigo prédio da Caixa, de frente para o Olinda Clinical Center.',
  estacionamento: 'Estacionamento amplo e privativo.',
  mapaEmbed:
    'https://www.google.com/maps?q=Rua+Francisco+Ambrosio+de+Barros+Leite,+43,+Olinda,+PE&output=embed',
  rotas:
    'https://www.google.com/maps/dir/?api=1&destination=Rua+Francisco+Ambrosio+de+Barros+Leite%2C+43%2C+Olinda%2C+PE',
  // PENDENTE: horários de funcionamento e das turmas. Enquanto for null, a página orienta a
  // consultar pelo WhatsApp. Formato: [{ dias: 'Segunda a sexta', horas: '5h às 21h' }]
  horarios: null as null | { dias: string; horas: string }[],
}

/** Link do WhatsApp com a mensagem já escrita. */
export function linkWhatsApp(mensagem: string) {
  return `https://wa.me/${contato.whatsapp}?text=${encodeURIComponent(mensagem)}`
}

export const mensagens = {
  experimental: 'Oi, Volts! Vim pelo site e quero agendar uma aula experimental.',
  duvida: 'Oi, Volts! Vim pelo site e queria tirar uma dúvida.',
  horarios: 'Oi, Volts! Vim pelo site e queria saber os horários e os planos.',
  evento: 'Oi, Volts! Vim pelo site e queria saber sobre o espaço para eventos.',
}

export type IdPrograma = 'hybrid' | 'class' | 'ativa' | '220'

export type Programa = {
  id: IdPrograma
  nome: [string, string] // a segunda parte ganha o destaque em amarelo, como nas artes da marca
  tipo: string
  resumo: string
  paraQuem: string
  focos: string[]
  detalhe?: string
  foto: { src: string; alt: string; posicao?: string }
  acao: { rotulo: string; mensagem: string }
}

// Textos das artes oficiais "Conheça nossas modalidades" (post de 03/10/2026)
export const programas: Programa[] = [
  {
    id: 'hybrid',
    nome: ['Hybrid', 'Volts'],
    tipo: 'Corrida + treino funcional',
    resumo:
      'Um programa completo que une corrida, exercícios funcionais e ergômetros para desenvolver força, resistência, condicionamento e performance.',
    paraQuem: 'Para quem quer ganhar força e resistência e evoluir em performance.',
    focos: ['Força', 'Resistência', 'Condicionamento', 'Performance'],
    foto: { src: 'equipamentos', alt: 'Cordas, elásticos e anilhas na área de treino funcional da Volts', posicao: '30% 40%' },
    acao: { rotulo: 'Quero experimentar', mensagem: 'Oi, Volts! Vim pelo site e quero agendar uma aula experimental de HybridVolts.' },
  },
  {
    id: 'class',
    nome: ['Volts', 'Class'],
    tipo: 'Treinamento personalizado em grupos reduzidos',
    resumo: 'Treino individualizado de acordo com seus objetivos e necessidades, com até 4 alunos por horário.',
    paraQuem: 'Para quem quer acompanhamento próximo e um treino montado para o próprio objetivo.',
    focos: ['Emagrecimento', 'Força', 'Hipertrofia', 'Condicionamento', 'Saúde e qualidade de vida'],
    detalhe: 'Acompanhamento próximo e toda a estrutura da Volts para a sua evolução.',
    foto: { src: 'professores', alt: 'Professores da Volts com a camisa preta do estúdio', posicao: '50% 30%' },
    acao: { rotulo: 'Quero experimentar', mensagem: 'Oi, Volts! Vim pelo site e quero agendar uma aula experimental de VoltsClass.' },
  },
  {
    id: 'ativa',
    nome: ['Ativa', '+'],
    tipo: 'Treinamento para o público 50+',
    resumo:
      'Aulas adaptadas ao seu ritmo, com acompanhamento profissional e foco no seu bem-estar. Mais saúde, autonomia e qualidade de vida para você continuar em movimento.',
    paraQuem: 'Para quem tem 50 anos ou mais e quer cuidar do corpo com segurança e autonomia.',
    focos: ['Mobilidade', 'Força', 'Equilíbrio', 'Coordenação', 'Condicionamento físico'],
    foto: { src: 'ativa', alt: 'Aluna do Ativa+ durante o treino na Volts', posicao: '35% 30%' },
    acao: { rotulo: 'Quero experimentar', mensagem: 'Oi, Volts! Vim pelo site e quero agendar uma aula experimental do Ativa+.' },
  },
  {
    id: '220',
    nome: ['220', 'Volts'],
    tipo: 'Planilha de corrida',
    resumo: 'Um plano de corrida que se encaixa no seu nível, do mais iniciante ao corredor mais experiente.',
    paraQuem: 'Para quem quer começar a correr ou evoluir na corrida com planejamento.',
    focos: ['Evolução na corrida', 'Plano por nível', 'Do iniciante ao experiente'],
    foto: { src: 'corrida', alt: 'Aluna da Volts correndo ao nascer do sol com a camisa do estúdio', posicao: '50% 25%' },
    acao: { rotulo: 'Quero saber mais', mensagem: 'Oi, Volts! Vim pelo site e quero saber mais sobre a 220Volts.' },
  },
]

// "Qual VOLTS combina com você?" (pergunta da própria Volts no reel de 07/10/2026).
// Cada objetivo aponta só para programas cujas artes oficiais citam esse foco.
export const objetivos: { id: string; rotulo: string; programas: IdPrograma[]; frase: string }[] = [
  { id: 'forca', rotulo: 'Ganhar força', programas: ['hybrid', 'class'], frase: 'ganhar força' },
  { id: 'emagrecer', rotulo: 'Emagrecer', programas: ['class'], frase: 'emagrecer' },
  { id: 'condicionamento', rotulo: 'Melhorar o condicionamento', programas: ['hybrid', 'class', 'ativa'], frase: 'melhorar o condicionamento' },
  { id: 'correr', rotulo: 'Correr mais e melhor', programas: ['220', 'hybrid'], frase: 'correr mais e melhor' },
  { id: 'saude', rotulo: 'Saúde e autonomia 50+', programas: ['ativa'], frase: 'cuidar da saúde e da autonomia' },
  { id: 'performance', rotulo: 'Performance', programas: ['hybrid'], frase: 'buscar performance' },
]

export const tambemNaVolts = [
  {
    titulo: 'Yoga',
    texto: 'Também faz parte das atividades da Volts. Pergunte pelos horários no WhatsApp.',
    provisorio: true, // PENDENTE: descrição e horários do Yoga
  },
  {
    titulo: 'Corrida Volts',
    texto: 'Corridas em grupo saindo do estúdio. Todos os níveis são bem-vindos.',
  },
  {
    titulo: 'Espaço para eventos',
    texto: 'Aniversários, confraternizações e comemorações depois de um treino ou de uma corrida.',
  },
]

// "Aqui você encontra": diferenciais citados pela própria Volts nos posts e reels
export const diferenciais = [
  {
    titulo: 'Acompanhamento de perto',
    texto: 'Cada treino é acompanhado por professores preparados, com técnica e cuidado do começo ao fim.',
    foto: 'professores',
    alt: 'Três professores da Volts',
    resumo: 'Professores em cada treino',
    posicao: '50% 30%',
  },
  {
    titulo: 'Grupos reduzidos',
    texto: 'Na VoltsClass são até 4 alunos por horário, com o treino montado para o objetivo de cada um.',
    foto: 'salao',
    alt: 'Salão da Volts com o teto de luz neon',
    resumo: 'Até 4 alunos por horário',
    posicao: '50% 34%',
  },
  {
    titulo: 'Treino do seu jeito',
    texto: 'Do treino funcional à corrida, do cuidado com a saúde à busca por performance: cada programa respeita o seu nível.',
    foto: 'ativa',
    alt: 'Aluna do Ativa+ treinando',
    resumo: 'Do funcional à corrida',
    posicao: '35% 30%',
  },
  {
    titulo: 'Estrutura completa',
    texto: 'Um espaço pensado para objetivos diferentes, com ergômetros e equipamentos de treino funcional.',
    foto: 'equipamentos',
    alt: 'Equipamentos de treino funcional na parede da Volts',
    resumo: 'Ergômetros e treino funcional',
    posicao: '30% 40%',
  },
  {
    titulo: 'Comunidade',
    texto: 'Corridas em grupo, eventos e alunos levando a energia da Volts para as provas da cidade.',
    foto: 'meia-maratona',
    alt: 'Atletas da Volts na Meia Maratona Eu Amo Recife',
    resumo: 'Corridas em grupo e provas',
    posicao: '50% 38%',
  },
  {
    titulo: 'Fácil de chegar',
    texto: 'Estacionamento amplo e privativo, de frente para o Olinda Clinical Center.',
    foto: 'fachada',
    alt: 'Fachada da Volts Training Studio',
    resumo: 'Estacionamento privativo',
    posicao: '50% 50%',
  },
]

export const perguntas = [
  {
    p: 'Nunca treinei. Posso começar na Volts?',
    r: 'Pode. Os programas têm propostas para níveis diferentes. Na 220Volts, por exemplo, o plano de corrida vai do mais iniciante ao corredor mais experiente. Na aula experimental você conhece o treino na prática.',
  },
  {
    p: 'Como agendo a aula experimental?',
    r: 'Pelo WhatsApp. Toque em "Agendar aula experimental", envie a mensagem que já vem escrita e a equipe combina o melhor dia com você.',
  },
  {
    p: 'Tenho mais de 50 anos. Existe um treino para mim?',
    r: 'Existe. O Ativa+ é o treinamento da Volts para o público 50+, com aulas adaptadas ao seu ritmo e foco em mobilidade, força, equilíbrio, coordenação e condicionamento.',
  },
  {
    p: 'Quantas pessoas treinam junto na VoltsClass?',
    r: 'Até 4 alunos por horário, com o treino individualizado de acordo com o objetivo e as necessidades de cada um.',
  },
  {
    p: 'Tem estacionamento?',
    r: 'Tem. O estacionamento é amplo e privativo, na própria Volts.',
  },
  {
    p: 'Quais são os valores e os horários?',
    r: 'Os planos e os horários das turmas são informados pela equipe. Chame no WhatsApp e diga qual programa te interessa.',
  },
  {
    p: 'Já sou aluno. Onde agendo minhas aulas?',
    r: 'Na área do aluno, no sistema de agendamento da Volts. O link está no rodapé desta página.',
  },
]

// Depoimentos: a seção só aparece quando houver depoimentos reais e autorizados.
// Formato: { nome: 'Nome Sobrenome', programa: 'VoltsClass', texto: '...' }
export const depoimentos: { nome: string; programa: string; texto: string }[] = []

export const camisa = {
  nome: 'Camisa oficial',
  slogan: 'Treine com foco. Vista sua evolução.',
  preco: 80,
  formulario:
    'https://docs.google.com/forms/d/e/1FAIpQLSd4XF05yxkm-Xj9WPiPp5W_mIffiKQL7x7XGFU6YwEoxOhz1w/viewform',
  qualidades: [
    { titulo: 'Conforto', texto: 'Para o seu treino.', icone: 'haltere' as const },
    { titulo: 'Tecido premium', texto: 'Leve e respirável.', icone: 'vento' as const },
    { titulo: 'Durabilidade', texto: 'Feita para acompanhar você em todos os desafios.', icone: 'escudo' as const },
  ],
  passos: [
    { titulo: 'Envie seu nome', icone: 'pessoa' as const },
    { titulo: 'Informe o tamanho', icone: 'camisa' as const },
    { titulo: 'Envie o comprovante do pagamento da entrada', icone: 'recibo' as const },
  ],
  // PENDENTE: tamanhos disponíveis e tabela de medidas. Enquanto for null, a aba explica
  // que o tamanho é informado no formulário.
  tamanhos: null as null | string[],
}

export const fotosEstrutura = [
  { src: 'salao', alt: 'Salão principal da Volts com o teto de quadros de neon verde e branco', legenda: 'Salão principal' },
  { src: 'equipamentos', alt: 'Cordas, elásticos, barras e anilhas na parede verde da Volts', legenda: 'Treino funcional' },
  { src: 'fachada-raio', alt: 'Entrada da Volts com o grande raio amarelo pintado na fachada', legenda: 'A entrada' },
]
