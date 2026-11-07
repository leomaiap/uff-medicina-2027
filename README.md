# Sites Animados 🚀

Coleção de repositórios, skills e ferramentas de ponta para criação de sites animados, interativos, 3D e experiências web premiadas (estilo Awwwards).

---

## 📦 Skills e Repositórios Instalados

Este projeto está configurado com as principais skills para agentes de IA (Antigravity, Claude Code, Cursor, Codex) e contém os repositórios oficiais completos:

### 1. **Scroll Craft** (`nateherkai/scroll-craft`)
- **Origem**: [https://github.com/nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft)
- **Localização**: `skills/scroll-craft`, `.agents/skills/scroll-craft` e `repos/scroll-craft`
- **Foco**: Criação de landing pages cinematográficas impulsionadas por scroll (estilo Awwwards / Apple), planos visuais independentes, jornadas dimensionais e prevenção de dead scroll.

### 2. **GSAP Skills** (`greensock/gsap-skills`)
- **Origem**: [https://github.com/greensock/gsap-skills](https://github.com/greensock/gsap-skills)
- **Localização**: `skills/gsap-*`, `.agents/skills/gsap-*` e `repos/gsap-skills`
- **Skills incluídas**:
  - `gsap-core`: Fundamentos, tweens, easings, `matchMedia` responsivo.
  - `gsap-scrolltrigger`: Efeitos de pinning, scrub, parallax e scroll-linked animations.
  - `gsap-timeline`: Orquestração e sequenciamento de timelines complexas.
  - `gsap-react`: Hooks e padrões para React/Next.js (`useGSAP`).
  - `gsap-plugins`: Flip, Draggable, ScrollTo, Observer, SplitText.
  - `gsap-performance`: Otimizações para 60fps sem layout thrashing.
  - `gsap-frameworks`: Vue, Svelte e integrações.
  - `gsap-utils`: Interpolação, mapeamento de intervalos e snap.

### 3. **Three.js & WebGL Animation Skills**
- **Origem 1**: [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills)
- **Origem 2**: [iart-ai/webgl-animation-skills](https://github.com/iart-ai/webgl-animation-skills)
- **Localização**: `skills/threejs-*`, `skills/shader-glsl`, `skills/particle-system` e `repos/`
- **Skills incluídas**:
  - `threejs-animation`: Animação de modelos 3D, mixers, actions, morph targets e WebGL.
  - `threejs-fundamentals`: Setup de cenas, câmeras, renderers, loops de animação e resize.
  - `threejs-shaders` / `shader-glsl`: Shaders GLSL, fragment shaders, ruído procedimental e efeitos pós-processamento.
  - `particle-system`: Sistemas de partículas GPU, poeira estelar, constelações e flow-fields.
  - `threejs-postprocessing`: Bloom, profundidade de campo (DoF), aberração cromática.
  - `threejs-lighting`, `threejs-materials`, `threejs-textures`, `threejs-loaders`, etc.

### 4. **Frontend Design** (`anthropics/skills`)
- **Origem**: [https://github.com/anthropics/skills](https://github.com/anthropics/skills)
- **Localização**: `skills/frontend-design`, `.agents/skills/frontend-design` e `repos/anthropic-skills`
- **Foco**: Direção visual intencional, tipografia marcante e eliminação de designs genéricos ou com estética pré-fabricada de IA.

### 5. **Web Design Guidelines** (`vercel-labs/agent-skills`)
- **Origem**: [https://github.com/vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills)
- **Localização**: `skills/web-design-guidelines`, `.agents/skills/web-design-guidelines` e `repos/vercel-agent-skills`
- **Foco**: Auditoria de interface e código contra as diretrizes oficiais de acessibilidade, interação, formulários, tipografia e performance da Vercel.

### 6. **Unslop** (`heydamir/unslop`)
- **Origem**: [https://github.com/heydamir/unslop](https://github.com/heydamir/unslop)
- **Localização**: `skills/unslop`, `.agents/skills/unslop` e `repos/unslop`
- **Foco**: Remoção de vícios visuais de IA ("AI slop", gradientes roxos sem critério, excesso de emojis, espaçamentos inconsistentes), transformando telas vibecodadas em interfaces de design autêntico.

---

## 📁 Estrutura de Pastas

```text
sites-animados/
├── .agents/skills/     # Skills detectadas por agentes (Antigravity, Cursor, etc.)
├── .claude/skills/     # Skills prontas para Claude Code
├── skills/             # Diretório central de skills do projeto
├── repos/              # Código-fonte completo de todos os repositórios clonados
│   ├── anthropic-skills/
│   ├── gsap-skills/
│   ├── scroll-craft/
│   ├── threejs-skills/
│   ├── unslop/
│   ├── vercel-agent-skills/
│   └── webgl-animation-skills/
└── skills-lock.json    # Lockfile de dependências de skills (npx skills)
```

---

## 🛠️ Como Utilizar com Agentes de IA

Todas as skills estão registradas e ativas no assistente Antigravity e nos diretórios padrão de agentes (`.agents/skills`, `.claude/skills`).

Basta solicitar em linguagem natural:
- *"Crie uma landing page no estilo scroll-craft com transições cinematográficas"*
- *"Aplique a skill unslop para limpar a interface e deixá-la profissional"*
- *"Faça a auditoria desta página usando as diretrizes da Vercel (web-design-guidelines)"*
- *"Configure uma timeline complexa com ScrollTrigger e GSAP"*
- *"Adicione um hero 3D com Three.js e shaders GLSL personalizados"*
