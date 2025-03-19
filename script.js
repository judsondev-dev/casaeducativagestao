// Credenciais de teste
const TEST_USER = {
    username: 'admin',
    password: 'admin123'
};

// Estado da aplicação
const state = {
    turmas: [],
    alunos: [],
    currentUser: null,
    escola: {
        nome: 'Casa Educativa',
        logo: 'fa-school'
    }
};

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    loadState();
    setupEventListeners();
    updateDashboardStats();
    updateAtividadesRecentes();
});

// Configuração dos Event Listeners
function setupEventListeners() {
    // Login
    document.getElementById('loginForm').addEventListener('submit', handleLogin);

    // Navegação
    document.querySelectorAll('.nav-links a[data-page]').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = e.currentTarget.dataset.page;
            navigateToPage(page);
        });
    });

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', handleLogout);

    // Turmas
    document.getElementById('addTurmaBtn').addEventListener('click', () => showModal('turmaModal'));
    document.getElementById('turmaForm').addEventListener('submit', handleTurmaSubmit);
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', () => hideModal(btn.closest('.modal')));
    });

    // Alunos
    document.getElementById('addAlunoBtn').addEventListener('click', () => showModal('alunoModal'));
    document.getElementById('alunoForm').addEventListener('submit', handleAlunoSubmit);
}

// Funções de Login/Logout
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    if (username === TEST_USER.username && password === TEST_USER.password) {
        state.currentUser = { username };
        document.querySelector('.login-container').style.display = 'none';
        document.querySelector('.dashboard-container').style.display = 'flex';
        saveState();
        updateAtividadesRecentes();
    } else {
        alert('Usuário ou senha inválidos!');
    }
}

function handleLogout() {
    state.currentUser = null;
    document.querySelector('.dashboard-container').style.display = 'none';
    document.querySelector('.login-container').style.display = 'flex';
    saveState();
}

// Navegação
function navigateToPage(page) {
    document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
    document.getElementById(`${page}-page`).style.display = 'block';
    
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.page === page) {
            link.classList.add('active');
        }
    });

    if (page === 'turmas') {
        updateTurmasList();
    } else if (page === 'alunos') {
        updateAlunosList();
    }
}

// Gestão de Turmas
function handleTurmaSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('turmaNome').value;
    const capacidade = parseInt(document.getElementById('turmaCapacidade').value);

    const novaTurma = {
        id: Date.now(),
        nome,
        capacidade,
        alunos: []
    };

    state.turmas.push(novaTurma);
    saveState();
    updateTurmasList();
    updateDashboardStats();
    hideModal(document.getElementById('turmaModal'));
    e.target.reset();
}

function updateTurmasList() {
    const tbody = document.getElementById('turmasList');
    tbody.innerHTML = '';

    state.turmas.forEach(turma => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${turma.nome}</td>
            <td>${turma.capacidade}</td>
            <td>${turma.alunos.length}</td>
            <td>
                <button class="btn btn-primary" onclick="editarTurma(${turma.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-primary" onclick="excluirTurma(${turma.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Gestão de Alunos
function handleAlunoSubmit(e) {
    e.preventDefault();
    const nome = document.getElementById('alunoNome').value;
    const turmaId = parseInt(document.getElementById('alunoTurma').value);
    const dataNascimento = document.getElementById('alunoDataNascimento').value;

    const turma = state.turmas.find(t => t.id === turmaId);
    if (!turma) {
        alert('Turma não encontrada!');
        return;
    }

    if (turma.alunos.length >= turma.capacidade) {
        alert('Turma está cheia!');
        return;
    }

    const novoAluno = {
        id: Date.now(),
        nome,
        turmaId,
        dataNascimento
    };

    turma.alunos.push(novoAluno);
    state.alunos.push(novoAluno);
    saveState();
    updateAlunosList();
    updateDashboardStats();
    hideModal(document.getElementById('alunoModal'));
    e.target.reset();
}

function updateAlunosList() {
    const tbody = document.getElementById('alunosList');
    tbody.innerHTML = '';

    state.alunos.forEach(aluno => {
        const turma = state.turmas.find(t => t.id === aluno.turmaId);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${aluno.nome}</td>
            <td>${turma ? turma.nome : 'Sem turma'}</td>
            <td>${formatDate(aluno.dataNascimento)}</td>
            <td>
                <button class="btn btn-primary" onclick="editarAluno(${aluno.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-primary" onclick="excluirAluno(${aluno.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Funções de Utilidade
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.classList.add('active');
}

function hideModal(modal) {
    modal.classList.remove('active');
}

function formatDate(dateString) {
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    return new Date(dateString).toLocaleDateString('pt-BR', options);
}

function updateDashboardStats() {
    document.getElementById('totalTurmas').textContent = state.turmas.length;
    document.getElementById('totalAlunos').textContent = state.alunos.length;
}

function updateAtividadesRecentes() {
    const atividades = [];
    
    // Adicionar últimas turmas criadas
    const ultimasTurmas = state.turmas
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
    
    ultimasTurmas.forEach(turma => {
        atividades.push({
            tipo: 'turma',
            mensagem: `Nova turma "${turma.nome}" foi criada`,
            data: new Date(turma.id)
        });
    });
    
    // Adicionar últimos alunos cadastrados
    const ultimosAlunos = state.alunos
        .sort((a, b) => b.id - a.id)
        .slice(0, 3);
    
    ultimosAlunos.forEach(aluno => {
        const turma = state.turmas.find(t => t.id === aluno.turmaId);
        atividades.push({
            tipo: 'aluno',
            mensagem: `Novo aluno "${aluno.nome}" foi cadastrado na turma "${turma ? turma.nome : 'Sem turma'}"`,
            data: new Date(aluno.id)
        });
    });
    
    // Ordenar por data e pegar as 5 mais recentes
    const atividadesOrdenadas = atividades
        .sort((a, b) => b.data - a.data)
        .slice(0, 5);
    
    const listContent = document.querySelector('.list-content');
    if (atividadesOrdenadas.length === 0) {
        listContent.innerHTML = '<div class="list-item"><span>Nenhuma atividade recente</span></div>';
        return;
    }
    
    listContent.innerHTML = atividadesOrdenadas.map(atividade => `
        <div class="list-item">
            <i class="fas ${atividade.tipo === 'turma' ? 'fa-users' : 'fa-user-graduate'}"></i>
            <span>${atividade.mensagem}</span>
            <small>${formatDate(atividade.data)}</small>
        </div>
    `).join('');
}

// Persistência de Dados
function saveState() {
    localStorage.setItem('schoolState', JSON.stringify(state));
}

function loadState() {
    const savedState = localStorage.getItem('schoolState');
    if (savedState) {
        Object.assign(state, JSON.parse(savedState));
    }
}

// Funções de Edição e Exclusão
function editarTurma(id) {
    const turma = state.turmas.find(t => t.id === id);
    if (!turma) return;

    document.getElementById('turmaNome').value = turma.nome;
    document.getElementById('turmaCapacidade').value = turma.capacidade;
    showModal('turmaModal');

    // Modificar o formulário para atualizar em vez de criar
    const form = document.getElementById('turmaForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        turma.nome = document.getElementById('turmaNome').value;
        turma.capacidade = parseInt(document.getElementById('turmaCapacidade').value);
        saveState();
        updateTurmasList();
        updateDashboardStats();
        hideModal(document.getElementById('turmaModal'));
        form.reset();
        form.onsubmit = handleTurmaSubmit; // Restaurar o handler original
    };
}

function excluirTurma(id) {
    if (confirm('Tem certeza que deseja excluir esta turma?')) {
        state.turmas = state.turmas.filter(t => t.id !== id);
        state.alunos = state.alunos.filter(a => a.turmaId !== id);
        saveState();
        updateTurmasList();
        updateAlunosList();
        updateDashboardStats();
    }
}

function editarAluno(id) {
    const aluno = state.alunos.find(a => a.id === id);
    if (!aluno) return;

    document.getElementById('alunoNome').value = aluno.nome;
    document.getElementById('alunoTurma').value = aluno.turmaId;
    document.getElementById('alunoDataNascimento').value = aluno.dataNascimento;
    showModal('alunoModal');

    // Modificar o formulário para atualizar em vez de criar
    const form = document.getElementById('alunoForm');
    form.onsubmit = (e) => {
        e.preventDefault();
        aluno.nome = document.getElementById('alunoNome').value;
        aluno.turmaId = parseInt(document.getElementById('alunoTurma').value);
        aluno.dataNascimento = document.getElementById('alunoDataNascimento').value;
        saveState();
        updateAlunosList();
        updateDashboardStats();
        hideModal(document.getElementById('alunoModal'));
        form.reset();
        form.onsubmit = handleAlunoSubmit; // Restaurar o handler original
    };
}

function excluirAluno(id) {
    if (confirm('Tem certeza que deseja excluir este aluno?')) {
        const aluno = state.alunos.find(a => a.id === id);
        if (aluno) {
            const turma = state.turmas.find(t => t.id === aluno.turmaId);
            if (turma) {
                turma.alunos = turma.alunos.filter(a => a.id !== id);
            }
        }
        state.alunos = state.alunos.filter(a => a.id !== id);
        saveState();
        updateAlunosList();
        updateDashboardStats();
    }
} 