// Dados de teste para login
const TEST_USER = {
    username: 'admin',
    password: 'admin123'
};

// Gerenciamento de Estado
let state = {
    turmas: [],
    alunos: [],
    currentUser: null
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    loadFromLocalStorage();
    setupEventListeners();
    updateDashboardStats();
});

// Event Listeners
function setupEventListeners() {
    // Login
    document.getElementById('login-form').addEventListener('submit', handleLogin);
    
    // Navegação
    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToPage(e.target.closest('a').dataset.page);
        });
    });

    // Logout
    document.getElementById('logout').addEventListener('click', handleLogout);

    // Turmas
    document.getElementById('nova-turma-btn').addEventListener('click', () => showModal('modal-turma'));
    document.getElementById('form-turma').addEventListener('submit', handleTurmaSubmit);
    document.getElementById('cancelar-turma').addEventListener('click', () => hideModal('modal-turma'));

    // Alunos
    document.getElementById('form-aluno').addEventListener('submit', handleAlunoSubmit);
    document.getElementById('cancelar-aluno').addEventListener('click', () => hideModal('modal-aluno'));
}

// Funções de Login
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === TEST_USER.username && password === TEST_USER.password) {
        state.currentUser = { username };
        document.getElementById('login-container').classList.add('hidden');
        document.getElementById('dashboard-container').classList.remove('hidden');
        updateDashboardStats();
    } else {
        alert('Usuário ou senha inválidos!');
    }
}

function handleLogout() {
    state.currentUser = null;
    document.getElementById('dashboard-container').classList.add('hidden');
    document.getElementById('login-container').classList.remove('hidden');
}

// Navegação
function navigateToPage(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-links a').forEach(link => link.classList.remove('active'));
    
    document.getElementById(`${pageId}-page`).classList.add('active');
    document.querySelector(`.nav-links a[data-page="${pageId}"]`).classList.add('active');

    if (pageId === 'turmas') {
        updateTurmasList();
    } else if (pageId === 'alunos') {
        updateAlunosList();
    }
}

// Gerenciamento de Turmas
function handleTurmaSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('nome-turma').value;
    
    const novaTurma = {
        id: Date.now(),
        nome,
        alunos: []
    };

    state.turmas.push(novaTurma);
    saveToLocalStorage();
    updateTurmasList();
    hideModal('modal-turma');
    document.getElementById('form-turma').reset();
}

function updateTurmasList() {
    const container = document.getElementById('turmas-list');
    container.innerHTML = '';

    if (state.turmas.length === 0) {
        container.innerHTML = '<p>Nenhuma turma cadastrada.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome da Turma</th>
                <th>Quantidade de Alunos</th>
                <th>Ações</th>
            </tr>
        </thead>
        <tbody>
            ${state.turmas.map(turma => `
                <tr>
                    <td>${turma.nome}</td>
                    <td>${turma.alunos.length}</td>
                    <td>
                        <button class="btn-primary" onclick="adicionarAluno(${turma.id})">Adicionar Aluno</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

// Gerenciamento de Alunos
function adicionarAluno(turmaId) {
    const turma = state.turmas.find(t => t.id === turmaId);
    if (!turma) return;

    document.getElementById('modal-aluno').classList.remove('hidden');
    document.getElementById('form-aluno').dataset.turmaId = turmaId;
}

function handleAlunoSubmit(e) {
    e.preventDefault();
    const turmaId = parseInt(e.target.dataset.turmaId);
    const turma = state.turmas.find(t => t.id === turmaId);
    if (!turma) return;

    const novoAluno = {
        id: Date.now(),
        nome: document.getElementById('nome-aluno').value,
        idade: parseInt(document.getElementById('idade-aluno').value),
        inicioContrato: document.getElementById('inicio-contrato').value,
        fimContrato: document.getElementById('fim-contrato').value,
        valorContrato: parseFloat(document.getElementById('valor-contrato').value),
        turmaId
    };

    turma.alunos.push(novoAluno);
    state.alunos.push(novoAluno);
    saveToLocalStorage();
    updateAlunosList();
    hideModal('modal-aluno');
    e.target.reset();
}

function updateAlunosList() {
    const container = document.getElementById('alunos-list');
    container.innerHTML = '';

    if (state.alunos.length === 0) {
        container.innerHTML = '<p>Nenhum aluno cadastrado.</p>';
        return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
        <thead>
            <tr>
                <th>Nome</th>
                <th>Idade</th>
                <th>Turma</th>
                <th>Início do Contrato</th>
                <th>Fim do Contrato</th>
                <th>Valor do Contrato</th>
            </tr>
        </thead>
        <tbody>
            ${state.alunos.map(aluno => {
                const turma = state.turmas.find(t => t.id === aluno.turmaId);
                return `
                    <tr>
                        <td>${aluno.nome}</td>
                        <td>${aluno.idade}</td>
                        <td>${turma ? turma.nome : 'N/A'}</td>
                        <td>${formatDate(aluno.inicioContrato)}</td>
                        <td>${formatDate(aluno.fimContrato)}</td>
                        <td>R$ ${aluno.valorContrato.toFixed(2)}</td>
                    </tr>
                `;
            }).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

// Utilitários
function showModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function hideModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function updateDashboardStats() {
    document.getElementById('total-turmas').textContent = state.turmas.length;
    document.getElementById('total-alunos').textContent = state.alunos.length;
}

// LocalStorage
function saveToLocalStorage() {
    localStorage.setItem('state', JSON.stringify(state));
}

function loadFromLocalStorage() {
    const savedState = localStorage.getItem('state');
    if (savedState) {
        state = JSON.parse(savedState);
    }
} 