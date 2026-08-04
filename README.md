# Gerador de Quebra-Cabeça Interativo

Uma aplicação web em React + TypeScript + Tailwind CSS para criar, personalizar e gerar jogos de quebra-cabeça interativos que podem ser exportados como arquivos HTML autônomos (standalone).

## 🚀 Como Publicar no GitHub e GitHub Pages

### 1. Criar um Repositório no GitHub
1. Acesse o [GitHub](https://github.com) e crie um novo repositório público (ex: `quebra-cabeca-interativo`).
2. Não inicialize com README se já for enviar este projeto.

### 2. Enviar o Código para o GitHub (Sem usar Terminal)

#### Método 1: Exportar direto do AI Studio (Mais Prático ✨)
1. No menu superior da tela do **Google AI Studio**, clique no botão de exportação / **Export** (ou nas opções do projeto/configurações).
2. Escolha a opção **Export to GitHub** para conectar sua conta e enviar o código diretamente para o seu repositório sem usar linha de comando.
3. Alternativamente, selecione **Download ZIP** para baixar todo o código no seu computador.

#### Método 2: Upload direto pelo site do GitHub
1. Se você baixou o arquivo `.zip`, extraia-o no seu computador.
2. Acesse o seu repositório no [GitHub.com](https://github.com).
3. Clique no botão **Add file** > **Upload files**.
4. Arraste todos os arquivos e pastas descompactados para a tela do GitHub e clique em **Commit changes**.

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
