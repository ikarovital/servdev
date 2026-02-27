import { expect } from '@playwright/test';

/**
 * Page Object da área de Produtos (Cadastro e Listagem) - Serverest Admin.
 * @param {object} page - Instância do Page do Playwright
 */
export class ProdutoPage {
  constructor(page) {
    this.page = page;

    // Navegação
    this.linkCadastrarProdutos = page.getByTestId('cadastrar-produtos');

    // Formulário de cadastro/edição
    this.inputNome = page.getByTestId('nome');
    this.inputPreco = page.getByTestId('preco');
    this.inputDescricao = page.getByTestId('descricao');
    this.inputQuantidade = page.getByTestId('quantity');
    this.inputImagem = page.getByTestId('imagem');
    this.btnCadastrarProduto = page.getByTestId('cadastarProdutos');

    // Listagem - botões por índice
    this.btnExcluir = (index = 0) =>
      page.getByRole('button', { name: 'Excluir' }).nth(index);
    this.btnEditar = (index = 0) =>
      page.getByRole('button', { name: 'Editar' }).nth(index);

    // Headings para validação
    this.headingListaProdutos = page.getByRole('heading', {
      name: /Lista dos Produtos/i,
    });
    this.headingCadastroProdutos = page.getByRole('heading', {
      name: /Cadastro de Produtos/i,
    });
  }

  /** Acessa a home do admin (requer estar logado). */
  async gotoAdminHome() {
    await this.page.goto('/admin/home', {
      waitUntil: 'domcontentloaded',
      timeout: 60_000,
    });
  }

  /** Abre a tela de cadastro de produtos a partir da listagem. */
  async gotoCadastro() {
    await this.linkCadastrarProdutos.click();
    await this.expectOnCadastroPage();
  }

  /** Abre a listagem de produtos (admin/home já mostra a lista). */
  async gotoListagem() {
    await this.gotoAdminHome();
    await this.page.waitForLoadState('networkidle').catch(() => {});
    await this.expectOnListagemPage();
  }

  /** Preenche o formulário de produto (imagem opcional). */
  async fillProduct({ nome, preco, descricao, quantidade, imagemPath }) {
    if (nome != null) await this.inputNome.fill(String(nome));
    if (preco != null) await this.inputPreco.fill(String(preco));
    if (descricao != null) await this.inputDescricao.fill(String(descricao));
    if (quantidade != null) await this.inputQuantidade.fill(String(quantidade));
    if (imagemPath) await this.inputImagem.setInputFiles(imagemPath);
  }

  /** Submete o formulário de cadastro/edição de produto. */
  async submitProduct() {
    await this.btnCadastrarProduto.click();
  }

  /** Preenche e submete um produto em um fluxo único. */
  async cadastrarProduto(dados, imagemPath) {
    await this.fillProduct({ ...dados, imagemPath });
    await this.submitProduct();
  }

  /** Garante que está na tela de listagem de produtos (área admin de produtos). */
  async expectOnListagemPage() {
    await expect(this.linkCadastrarProdutos).toBeVisible({ timeout: 15_000 });
  }

  /** Garante que está na tela de cadastro de produtos. */
  async expectOnCadastroPage() {
    await expect(this.headingCadastroProdutos).toBeVisible();
  }

  /** Clica em Excluir no índice informado (0 = primeiro). */
  async clickExcluir(index = 0) {
    await this.btnExcluir(index).click();
  }

  /** Clica em Editar no índice informado (0 = primeiro). */
  async clickEditar(index = 0) {
    await this.btnEditar(index).click();
  }

  /** Verifica se existe pelo menos um botão Editar na listagem. */
  async hasProdutosNaLista() {
    await expect(this.page.getByRole('button', { name: 'Editar' }).first()).toBeVisible();
  }

  /** Verifica se o texto aparece na página (lista ou mensagem). */
  async expectVerMensagemOuTexto(texto) {
    await expect(this.page.getByText(texto)).toBeVisible();
  }
}
