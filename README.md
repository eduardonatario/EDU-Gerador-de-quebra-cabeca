# Gerador de Quebra-Cabeça Interativo

Uma aplicação web em React + TypeScript + Tailwind CSS para criar, personalizar e gerar jogos de quebra-cabeça interativos que podem ser exportados como arquivos HTML autônomos (standalone).

## 🚀 Como Publicar no GitHub e GitHub Pages

### 1. Criar um Repositório no GitHub
1. Acesse o [GitHub](https://github.com) e crie um novo repositório público (ex: `quebra-cabeca-interativo`).
2. Não inicialize com README se já for enviar este projeto.

### 2. Enviar o Código para o GitHub
No terminal da sua máquina local, no diretório do projeto, execute os seguintes comandos:

```bash
git init
git add .
git commit -m "Initial commit - Gerador de Quebra-Cabeça"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

---

### 3. Ativar o GitHub Pages (Duas Opções)

#### Opção A: Automatizado via GitHub Actions (Recomendado)
1. No seu repositório no GitHub, vá em **Settings** > **Pages**.
2. Na seção **Source** (Fonte), selecione **GitHub Actions**.
3. Assim que você fizer um `git push`, a ação **Deploy to GitHub Pages** será executada automaticamente.
4. O link do seu site estará disponível em instantes!

#### Opção B: Publicação Manual via Terminal
Se preferir publicar manualmente via linha de comando, execute:

```bash
npm run deploy
```

Em seguida, nas configurações do seu repositório (**Settings** > **Pages**), escolha a branch `gh-pages` como fonte.

---

## 💻 Desenvolvimento Local

Para rodar o projeto localmente no seu computador:

```bash
# 1. Instalar as dependências
npm install

# 2. Iniciar o servidor de desenvolvimento
npm run dev
```

Acesse `http://localhost:3000` no seu navegador.

## 🛠️ Tecnologias Utilizadas
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Vite**
- **Lucide React**
