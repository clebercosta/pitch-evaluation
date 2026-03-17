export const CATEGORIES = [
  { id:"problema", label:"Problema & Oportunidade", weight:0.18, icon:"🎯",
    description:"O problema é real, validado e representa uma oportunidade relevante?",
    questions:[
      {id:"p1",text:"O problema está claramente definido e é urgente para o mercado-alvo?"},
      {id:"p2",text:"O tamanho da oportunidade (TAM/SAM/SOM) é crível e bem embasado?"},
      {id:"p3",text:"Há evidências concretas do problema: dados, entrevistas ou validações com usuários reais?"},
    ]},
  { id:"solucao", label:"Solução & Viabilidade Técnica", weight:0.18, icon:"💡",
    description:"A solução é diferenciada e pode ser construída com a equipe disponível?",
    questions:[
      {id:"s1",text:"Existe diferenciação real em relação a concorrentes ou alternativas existentes?"},
      {id:"s2",text:"Viabilidade técnica: a solução pode ser construída com a tecnologia e equipe atualmente disponíveis?"},
    ]},
  { id:"mercado", label:"Mercado & Facilidade de Venda", weight:0.18, icon:"📈",
    description:"Há demanda validada e um caminho claro e rápido para converter clientes?",
    questions:[
      {id:"m1",text:"Existem clientes reais, pilotos ativos ou LOIs que validam a demanda concretamente?"},
      {id:"m2",text:"Facilidade de vender: o ciclo de venda é curto, com poucos decisores e baixa fricção de adoção?"},
    ]},
  { id:"modelo", label:"Modelo de Negócio & Escalabilidade", weight:0.16, icon:"💰",
    description:"O modelo gera receita recorrente e escala sem crescer proporcionalmente em custos?",
    questions:[
      {id:"n1",text:"O modelo de receita é claro, recorrente e com unit economics defensáveis?"},
      {id:"n2",text:"Escalabilidade: o negócio pode crescer 10x sem aumentar proporcionalmente custos ou complexidade operacional?"},
    ]},
  { id:"time", label:"Time & Execução", weight:0.14, icon:"👥",
    description:"O time tem credibilidade e cobre as competências críticas para executar?",
    questions:[
      {id:"t1",text:"Os fundadores têm experiência relevante comprovada no setor ou em construção de startups?"},
      {id:"t2",text:"O time cobre as competências críticas necessárias (tech, negócio, mercado/vendas)?"},
    ]},
  { id:"viabilidade", label:"Viabilidade de Desenvolvimento", weight:0.10, icon:"⚙️",
    description:"O produto pode ser lançado rapidamente com eficiência de capital?",
    questions:[
      {id:"v1",text:"Custo-retorno: o custo estimado de desenvolvimento é compatível com o potencial de retorno do negócio?"},
      {id:"v2",text:"Tempo de desenvolvimento: é possível ter um MVP funcional em tempo competitivo (até 12 meses)?"},
    ]},
  { id:"financas", label:"Financeiro & Maturidade", weight:0.06, icon:"📊",
    description:"O fundador demonstra maturidade financeira e domínio das premissas do negócio?",
    questions:[
      {id:"f1",text:"O valor solicitado é justificado e coerente com os próximos milestones do projeto?"},
      {id:"f2",text:"As projeções financeiras têm premissas explícitas e são realistas para o estágio apresentado?"},
    ]},
]

export const SCALE = [
  {value:1, label:"1 – Insuficiente",        color:"#ef4444", bg:"#fef2f2"},
  {value:2, label:"2 – Abaixo do esperado",  color:"#f97316", bg:"#fff7ed"},
  {value:3, label:"3 – Adequado",            color:"#eab308", bg:"#fefce8"},
  {value:4, label:"4 – Bom",                 color:"#22c55e", bg:"#f0fdf4"},
  {value:5, label:"5 – Excepcional",         color:"#6366f1", bg:"#eef2ff"},
]

export const STAGES  = ["Ideia","MVP","Tração","Escala","Expansão"]
export const SECTORS = ["Tecnologia","Saúde","Educação","Finanças","Energia","Agronegócio","Varejo","Indústria","Serviços","Outro"]
export const MARKETS = ["Brasil","Canadá","EUA","Brasil + Canadá","Brasil + EUA","América Latina","Global","Outro"]

export const TOTAL_Q = CATEGORIES.reduce((a,c) => a + c.questions.length, 0)

export function getColor(s) {
  if (s >= 4.5) return "#6366f1"
  if (s >= 3.5) return "#22c55e"
  if (s >= 2.5) return "#eab308"
  if (s >= 1.5) return "#f97316"
  return "#ef4444"
}

export function calcCat(scores, catId) {
  const cat = CATEGORIES.find(c => c.id === catId)
  const vals = cat.questions.map(q => scores[q.id] || 0).filter(v => v > 0)
  return vals.length ? vals.reduce((a,b) => a+b, 0) / vals.length : 0
}

export function calcTotal(scores) {
  let n = 0, d = 0
  for (const cat of CATEGORIES) {
    const s = calcCat(scores, cat.id)
    if (s > 0) { n += s * cat.weight; d += cat.weight }
  }
  return d > 0 ? n / d : 0
}

export function countAnswered(scores) {
  return CATEGORIES.reduce((a, cat) => a + cat.questions.filter(q => scores[q.id] > 0).length, 0)
}
