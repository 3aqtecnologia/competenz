# 📅 Feriados Nacionais Brasileiros

Este documento lista todos os feriados nacionais brasileiros considerados pelo **Gerador de Cronograma** do módulo de Turmas.

## 🗓️ Feriados Fixos

Os seguintes feriados ocorrem sempre na mesma data todos os anos:

| Data | Feriado |
|------|---------|
| 01/01 | Ano Novo |
| 21/04 | Tiradentes |
| 01/05 | Dia do Trabalho |
| 07/09 | Independência do Brasil |
| 12/10 | Nossa Senhora Aparecida (Padroeira do Brasil) |
| 02/11 | Finados |
| 15/11 | Proclamação da República |
| 25/12 | Natal |

## � Feriados Estaduais (Ceará)

Os seguintes feriados do estado do Ceará foram adicionados:

| Data | Feriado |
|------|---------|
| 19/03 | Dia de São José (Padroeiro do Ceará) |
| 25/03 | Data Magna do Ceará |

## �🌙 Feriados Móveis

Estes feriados dependem da data da **Páscoa** (calculada pelo algoritmo de Meeus/Jones/Butcher):

| Feriado | Cálculo |
|---------|---------|
| **Carnaval** (Segunda e Terça) | 47 dias antes da Páscoa |
| **Sexta-feira Santa** | 2 dias antes da Páscoa |
| **Corpus Christi** | 60 dias depois da Páscoa |

## 🔍 Como Funciona

Quando você clica em **"Gerar Datas"** no módulo de Turmas, o sistema:

1. ✅ Verifica os **dias de aula** selecionados (ex: Segunda a Sexta)
2. ✅ Calcula quantos dias são necessários para cada UC baseado na **carga horária** e **horas/dia**
3. ✅ **Pula automaticamente** todos os feriados nacionais (fixos e móveis)
4. ✅ Gera o cronograma completo com datas de início e fim para cada UC

## 💡 Exemplo Prático

**Configuração:**

- Data de Início: 03/02/2025 (Segunda-feira)
- Dias de Aula: Segunda a Sexta
- Horas/Dia: 4 horas
- UC: "Fundamentos de Enfermagem" (80 horas)

**Cálculo:**

- Dias necessários: 80h ÷ 4h/dia = 20 dias
- O sistema conta apenas dias úteis (Seg-Sex)
- **Pula automaticamente** o Carnaval (03/03 e 04/03/2025)
- Resultado: Início em 03/02, Fim em 05/03 (considerando o pulo do Carnaval)

## 🚀 Benefícios

- ⏱️ **Economia de Tempo**: Não é necessário verificar manualmente o calendário
- ✅ **Precisão**: Evita agendamento de aulas em feriados
- 📊 **Planejamento Realista**: Cronogramas mais precisos e executáveis
- 🔄 **Automático**: Funciona para qualquer ano (2025, 2026, etc.)

## 📝 Notas Importantes

- ⚠️ **Feriados Municipais** não são considerados (apenas nacionais e Ceará)
- ⚠️ **Recessos Escolares** devem ser configurados manualmente
- ⚠️ **Pontos Facultativos** não são incluídos automaticamente

## 🔧 Personalização Futura

Em versões futuras, planejamos adicionar:

- [ ] Configuração de feriados municipais/estaduais
- [ ] Cadastro de recessos escolares personalizados
- [ ] Pontos facultativos configuráveis
- [ ] Calendário acadêmico completo

---

**Última atualização:** Dezembro/2025  
**Versão do Sistema:** v1.3
