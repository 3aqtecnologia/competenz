# 🎓 Competenz | Gestão Educacional

**Competenz** é um sistema moderno de gestão educacional focado em simplificar processos administrativos e pedagógicos. Construído com uma arquitetura leve e responsiva, o sistema oferece uma experiência de usuário fluida e intuitiva.

![Status do Projeto](https://img.shields.io/badge/status-em_desenvolvimento-yellow)
![Tech Stack](https://img.shields.io/badge/stack-HTML_|_CSS_|_JS-blue)
![Backend](https://img.shields.io/badge/backend-Supabase-green)

---

## 🚀 Funcionalidades

O sistema é dividido em módulos estratégicos para atender diferentes áreas da instituição:

- **📊 Dashboard**: Visão geral com indicadores chave de desempenho.
- **📝 Secretaria**: Gestão de matrículas, turmas e documentos (Em breve).
- **🎓 Pedagógico**: Controle de notas, frequências e planos de ensino (Em breve).
- **📅 Planejamento**: Ferramentas para organização de calendário e carga horária.
- **⚙️ Configurações**: Gerenciamento de parâmetros do sistema.

## 🛠️ Tecnologias Utilizadas

O projeto utiliza uma stack tecnológica moderna e leve, sem necessidade de transpilação complexa:

### Frontend

- **HTML5 & CSS3**: Estrutura semântica e estilização moderna (CSS Variables, Flexbox/Grid).
- **JavaScript (ES6+)**: Lógica da aplicação utilizando Módulos ES.
- **[Phosphor Icons](https://phosphoricons.com/)**: Biblioteca de ícones consistente e flexível.
- **[Day.js](https://day.js.org/)**: Manipulação leve de datas.
- **[IMask](https://imask.js.org/)**: Máscaras de input para melhor UX.

### Backend & Infraestrutura

- **[Supabase](https://supabase.com/)**: Backend as a Service (BaaS) fornecendo:
  - Banco de dados Postgres.
  - Autenticação.
  - APIs em tempo real.

## 🎨 Design System e UX

O projeto segue um rigoroso guia de estilos e melhores práticas de UX, documentado em `docs/UX-UI-GUIDE.md`. Principais diretrizes:

- **Hierarquia Visual Clara**: Uso consistente de tipografia e cores.
- **Feedback Imediato**: Respostas visuais para todas as interações do usuário.
- **Acessibilidade**: Foco em contraste, navegação por teclado e semântica.
- **Design Responsivo**: Adaptável para desktop e dispositivos móveis.

## 📁 Estrutura do Projeto

```
sgp/
├── assets/
│   ├── css/            # Estilos (app.css, componentes)
│   └── js/             # Lógica (app.js, módulos, serviços)
├── database/           # Scripts SQL e migrações
├── docs/               # Documentação técnica e de design
└── index.html          # Ponto de entrada da aplicação
```

## 🚀 Como Executar Localmente

Como o projeto é construído com tecnologias web padrão, você precisa apenas de um servidor estático para rodá-lo.

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/competenz.git
   cd competenz
   ```

2. **Configure o Ambient**
   Certifique-se de que as credenciais do Supabase estão configuradas corretamente em `assets/js/services/supabase.js`.

3. **Inicie o Servidor**
   Você pode usar qualquer servidor estático. Exemplos:

   **Usando Python:**

   ```bash
   python -m http.server 8000
   ```

   **Usando Node.js (npx):**

   ```bash
   npx serve .
   ```

   **VS Code:**
   Instale a extensão "Live Server" e clique em "Go Live".

4. **Acesse**
   Abra `http://localhost:8000` (ou a porta indicada) no seu navegador.

## 🤝 Contribuição

Contribuições são bem-vindas! Por favor, leia o guia de contribuição antes de enviar um Pull Request.

1. Faça um Fork do projeto
2. Crie sua Feature Branch (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona: MinhaFeature'`)
4. Push para a Branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).
