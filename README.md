# 🎮 Jogo de Adivinhação de Código

Este é um jogo multiplayer onde os jogadores devem adivinhar o código do adversário. O jogo funciona via WebSocket utilizando **Next.js** no frontend e um servidor **Node.js com Socket.IO** no backend.

---

## 🚀 Tecnologias Utilizadas

- **Next.js** - Framework React para o frontend
- **TypeScript** - Tipagem estática para segurança e escalabilidade
- **Socket.IO** - Comunicação em tempo real entre os jogadores
- **Node.js** - Servidor para gerenciar conexões e lógica do jogo

---

## 📦 Instalação

Antes de iniciar, certifique-se de ter **Node.js** e **npm** ou **yarn** instalados em sua máquina.

1. **Clone o repositório**

   ```bash
   git clone https://github.com/seu-usuario/seu-repositorio.git
   cd seu-repositorio
   ```

2. **Instale as dependências**

   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configuração do Ambiente**

   Copie o arquivo `.env.example` para `.env` e ajuste as variáveis conforme necessário:

   ```bash
   cp .env.example .env || copy .env.example .env
   ```

## Edite o arquivo `.env` para configurar suas variáveis de ambiente corretamente.

## ▶️ Executando o Jogo

### 🔧 Modo Desenvolvimento (Frontend + Backend)

Execute o frontend e o servidor de WebSocket em paralelo:

```bash
npm run dev:socket
```

Ou com `yarn`:

```bash
yarn dev:socket
```

Isso iniciará o **Next.js** no modo desenvolvimento e o servidor WebSocket com **ts-node**.

---

## 💡 Como Jogar

1. Entre na página inicial do jogo.
2. Escolha um **nome de usuário** e **insira um código de sala** (ex: `abc-def`).
3. Aguarde outro jogador entrar na mesma sala.
4. Escolha um código secreto de **4 dígitos**.
5. Alternem turnos tentando adivinhar o código do adversário.
6. O primeiro a acertar o código do outro jogador vence! 🎉

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Sinta-se à vontade para usá-lo e modificá-lo como desejar.

---

## 🤝 Contribuindo

Se deseja contribuir para o projeto, sinta-se livre para abrir um pull request ou sugerir melhorias. Você pode modificar as regras do jogo diretamente no código-fonte para personalizar a experiência conforme necessário. Toda ajuda é bem-vinda!
