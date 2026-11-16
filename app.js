
let produtos = JSON.parse(localStorage.getItem("produtos")) || [];
let clientes = JSON.parse(localStorage.getItem("clientes")) || [];
let pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];

let logado = false;

const usuarioAdmin = "admin";
const senhaAdmin = "123456";

function salvarDados() {
    localStorage.setItem("produtos", JSON.stringify(produtos));
    localStorage.setItem("clientes", JSON.stringify(clientes));
    localStorage.setItem("pedidos", JSON.stringify(pedidos));
}

function gerarId() {
    return Date.now();
}

function dinheiro(valor) {
    return Number(valor).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });
}

function escapar(texto) {
    return String(texto).replace(/[&<>"']/g, letra => {
        return {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#039;"
        }[letra];
    });
}

function mostrarAba(nome) {
    if (nome === "administracao" && !logado) {
        nome = "login";
    }

    document.querySelectorAll(".aba").forEach(aba => {
        aba.hidden = true;
    });

    document.getElementById(nome).hidden = false;
}

function mostrarAdmin(nome) {
    if (!logado) return;

    document.querySelectorAll(".adminAba").forEach(aba => {
        aba.hidden = true;
    });

    document.getElementById(nome).hidden = false;

    atualizarTudo();
}

function sair() {
    logado = false;

    document.getElementById("botaoLogin").hidden = false;
    document.getElementById("botaoSair").hidden = true;

    document.getElementById("formLogin").reset();

    mostrarAba("inicio");
}

document.addEventListener("click", function(event) {
    let botao = event.target.closest("button");

    if (!botao) return;

    if (botao.dataset.aba) {
        mostrarAba(botao.dataset.aba);
    }

    if (botao.dataset.admin) {
        mostrarAdmin(botao.dataset.admin);
    }

    if (botao.dataset.acao === "sair") {
        sair();
    }

    if (botao.dataset.editar === "produto") {
        editarProduto(Number(botao.dataset.id));
    }

    if (botao.dataset.excluir === "produto") {
        excluirProduto(Number(botao.dataset.id));
    }

    if (botao.dataset.editar === "cliente") {
        editarCliente(Number(botao.dataset.id));
    }

    if (botao.dataset.excluir === "cliente") {
        excluirCliente(Number(botao.dataset.id));
    }

    if (botao.dataset.editar === "pedido") {
        editarPedido(Number(botao.dataset.id));
    }

    if (botao.dataset.excluir === "pedido") {
        excluirPedido(Number(botao.dataset.id));
    }
});

document.getElementById("formLogin").addEventListener("submit", function(event) {
    event.preventDefault();

    let usuario = document.getElementById("usuario").value;
    let senha = document.getElementById("senha").value;

    if (usuario === usuarioAdmin && senha === senhaAdmin) {
        logado = true;

        document.getElementById("botaoLogin").hidden = true;
        document.getElementById("botaoSair").hidden = false;

        document.getElementById("mensagemLogin").textContent =
            "Login realizado com sucesso!";

        mostrarAba("administracao");
        atualizarTudo();

    } else {
        document.getElementById("mensagemLogin").textContent =
            "Usuário ou senha incorretos.";
    }
});

document.getElementById("formProduto").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!logado) return;

    let id = document.getElementById("produtoId").value;
    let nome = document.getElementById("produtoNome").value.trim();
    let preco = Number(document.getElementById("produtoPreco").value);

    if (!nome || !Number.isFinite(preco) || preco < 0) {
        alert("Preencha os dados corretamente.");
        return;
    }

    if (id) {
        let produto = produtos.find(p => p.id === Number(id));

        if (produto) {
            produto.nome = nome;
            produto.preco = preco;
        }

    } else {
        produtos.push({
            id: gerarId(),
            nome: nome,
            preco: preco
        });
    }

    salvarDados();
    limparProduto();
    atualizarTudo();

    alert("Produto salvo com sucesso!");
});

function listarProdutos() {
    let tabela = document.getElementById("tabelaProdutos");

    if (produtos.length === 0) {
        tabela.innerHTML = "<p>Nenhum produto cadastrado.</p>";
        return;
    }

    tabela.innerHTML = `
        <table>
            <tr>
                <th>Nome</th>
                <th>Preço</th>
                <th>Ações</th>
            </tr>

            ${produtos.map(p => `
                <tr>
                    <td>${escapar(p.nome)}</td>
                    <td>${dinheiro(p.preco)}</td>
                    <td>
                        <button data-editar="produto" data-id="${p.id}">Editar</button>
                        <button data-excluir="produto" data-id="${p.id}">Excluir</button>
                    </td>
                </tr>
            `).join("")}
        </table>
    `;
}

function listarCatalogo() {
    let catalogo = document.getElementById("listaCatalogo");

    if (produtos.length === 0) {
        catalogo.innerHTML = "<p>Nenhum produto disponível.</p>";
        return;
    }

    catalogo.innerHTML = produtos.map(p => `
        <div class="produto">
            <h3>${escapar(p.nome)}</h3>
            <p>Preço: ${dinheiro(p.preco)}</p>
        </div>
    `).join("");
}

function editarProduto(id) {
    if (!logado) return;

    let produto = produtos.find(p => p.id === id);

    if (!produto) return;

    document.getElementById("produtoId").value = produto.id;
    document.getElementById("produtoNome").value = produto.nome;
    document.getElementById("produtoPreco").value = produto.preco;

    mostrarAdmin("produtos");
}

function excluirProduto(id) {
    if (!logado) return;

    if (pedidos.some(p => p.produtoId === id)) {
        alert("Este produto possui pedidos cadastrados. Exclua os pedidos primeiro.");
        return;
    }

    if (!confirm("Deseja excluir este produto?")) return;

    produtos = produtos.filter(p => p.id !== id);

    salvarDados();
    atualizarTudo();
}

function limparProduto() {
    document.getElementById("formProduto").reset();
    document.getElementById("produtoId").value = "";
}

document.getElementById("limparProduto").addEventListener("click", limparProduto);

document.getElementById("formCliente").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!logado) return;

    let id = document.getElementById("clienteId").value;
    let nome = document.getElementById("clienteNome").value.trim();
    let contato = document.getElementById("clienteContato").value.trim();

    if (!nome || !contato) {
        alert("Preencha os dados do cliente.");
        return;
    }

    if (id) {
        let cliente = clientes.find(c => c.id === Number(id));

        if (cliente) {
            cliente.nome = nome;
            cliente.contato = contato;
        }

    } else {
        clientes.push({
            id: gerarId(),
            nome: nome,
            contato: contato
        });
    }

    salvarDados();
    limparCliente();
    atualizarTudo();

    alert("Cliente salvo com sucesso!");
});

function listarClientes() {
    let tabela = document.getElementById("tabelaClientes");

    if (clientes.length === 0) {
        tabela.innerHTML = "<p>Nenhum cliente cadastrado.</p>";
        return;
    }

    tabela.innerHTML = `
        <table>
            <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Ações</th>
            </tr>

            ${clientes.map(c => `
                <tr>
                    <td>${escapar(c.nome)}</td>
                    <td>${escapar(c.contato)}</td>
                    <td>
                        <button data-editar="cliente" data-id="${c.id}">Editar</button>
                        <button data-excluir="cliente" data-id="${c.id}">Excluir</button>
                    </td>
                </tr>
            `).join("")}
        </table>
    `;
}

function editarCliente(id) {
    if (!logado) return;

    let cliente = clientes.find(c => c.id === id);

    if (!cliente) return;

    document.getElementById("clienteId").value = cliente.id;
    document.getElementById("clienteNome").value = cliente.nome;
    document.getElementById("clienteContato").value = cliente.contato;

    mostrarAdmin("clientes");
}

function excluirCliente(id) {
    if (!logado) return;

    if (pedidos.some(p => p.clienteId === id)) {
        alert("Este cliente possui pedidos cadastrados. Exclua os pedidos primeiro.");
        return;
    }

    if (!confirm("Deseja excluir este cliente?")) return;

    clientes = clientes.filter(c => c.id !== id);

    salvarDados();
    atualizarTudo();
}

function limparCliente() {
    document.getElementById("formCliente").reset();
    document.getElementById("clienteId").value = "";
}

document.getElementById("limparCliente").addEventListener("click", limparCliente);

function atualizarSelects() {
    let selectCliente = document.getElementById("pedidoCliente");
    let selectProduto = document.getElementById("pedidoProduto");

    let clienteAtual = selectCliente.value;
    let produtoAtual = selectProduto.value;

    selectCliente.innerHTML = `
        <option value="">Selecione um cliente</option>
        ${clientes.map(c => `
            <option value="${c.id}">${escapar(c.nome)}</option>
        `).join("")}
    `;

    selectProduto.innerHTML = `
        <option value="">Selecione um produto</option>
        ${produtos.map(p => `
            <option value="${p.id}">${escapar(p.nome)}</option>
        `).join("")}
    `;

    selectCliente.value = clienteAtual;
    selectProduto.value = produtoAtual;
}

document.getElementById("formPedido").addEventListener("submit", function(event) {
    event.preventDefault();

    if (!logado) return;

    let id = document.getElementById("pedidoId").value;
    let clienteId = Number(document.getElementById("pedidoCliente").value);
    let produtoId = Number(document.getElementById("pedidoProduto").value);
    let quantidade = Number(document.getElementById("pedidoQuantidade").value);

    let cliente = clientes.find(c => c.id === clienteId);
    let produto = produtos.find(p => p.id === produtoId);

    if (!cliente || !produto || !Number.isInteger(quantidade) || quantidade < 1) {
        alert("Preencha os dados do pedido corretamente.");
        return;
    }

    let pedido = {
        id: id ? Number(id) : gerarId(),
        clienteId: clienteId,
        produtoId: produtoId,
        quantidade: quantidade,
        total: Number((produto.preco * quantidade).toFixed(2))
    };

    if (id) {
        pedidos = pedidos.map(p => p.id === Number(id) ? pedido : p);
    } else {
        pedidos.push(pedido);
    }

    salvarDados();
    limparPedido();
    atualizarTudo();

    alert("Pedido salvo com sucesso!");
});

function listarPedidos() {
    let tabela = document.getElementById("tabelaPedidos");

    if (pedidos.length === 0) {
        tabela.innerHTML = "<p>Nenhum pedido cadastrado.</p>";
        return;
    }

    tabela.innerHTML = `
        <table>
            <tr>
                <th>Cliente</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Total</th>
                <th>Ações</th>
            </tr>

            ${pedidos.map(p => {
                let cliente = clientes.find(c => c.id === p.clienteId);
                let produto = produtos.find(pr => pr.id === p.produtoId);

                return `
                    <tr>
                        <td>${escapar(cliente ? cliente.nome : "Não encontrado")}</td>
                        <td>${escapar(produto ? produto.nome : "Não encontrado")}</td>
                        <td>${p.quantidade}</td>
                        <td>${dinheiro(p.total)}</td>
                        <td>
                            <button data-editar="pedido" data-id="${p.id}">Editar</button>
                            <button data-excluir="pedido" data-id="${p.id}">Excluir</button>
                        </td>
                    </tr>
                `;
            }).join("")}
        </table>
    `;
}

function editarPedido(id) {
    if (!logado) return;

    let pedido = pedidos.find(p => p.id === id);

    if (!pedido) return;

    document.getElementById("pedidoId").value = pedido.id;

    atualizarSelects();

    document.getElementById("pedidoCliente").value = pedido.clienteId;
    document.getElementById("pedidoProduto").value = pedido.produtoId;
    document.getElementById("pedidoQuantidade").value = pedido.quantidade;

    mostrarAdmin("pedidos");
}

function excluirPedido(id) {
    if (!logado) return;

    if (!confirm("Deseja excluir este pedido?")) return;

    pedidos = pedidos.filter(p => p.id !== id);

    salvarDados();
    atualizarTudo();
}

function limparPedido() {
    document.getElementById("formPedido").reset();
    document.getElementById("pedidoId").value = "";
}

document.getElementById("limparPedido").addEventListener("click", limparPedido);

function atualizarTudo() {
    listarProdutos();
    listarClientes();
    listarPedidos();
    listarCatalogo();
    atualizarSelects();
}

atualizarTudo();
