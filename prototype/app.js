// HumanUnity - Main Application Logic

// ============================================
// STATE MANAGEMENT
// ============================================
const state = {
    currentScreen: 'login',
    isAuthenticated: false,
    userRole: 'student', // 'student' | 'referent'
    user: null,
    reportData: {
        episodeType: '',
        description: '',
        educationalContext: '',
        date: '',
        time: '',
        involvedRoles: [],
        isAnonymous: true,
        contactChannels: [],
        email: '',
        phone: ''
    },
    savedReports: [],
    currentReportId: null,
    caseCode: '',
    chatMessages: [],
    chatStep: 0,
    referentCases: [
        {
            id: '1',
            caseCode: 'HU-A3B7D9K2',
            status: 'new',
            openedDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            context: 'Matematica',
            isAnonymous: true,
            episodeType: 'Commenti offensivi',
            description: 'Durante la lezione il docente ha fatto commenti inappropriati sulla capacità delle studentesse.',
            location: 'Aula Magna',
            date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            reporterRole: 'Direttamente coinvolta'
        },
        {
            id: '2',
            caseCode: 'HU-X9Y2K5L8',
            status: 'evaluation',
            openedDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            context: 'Fisica',
            isAnonymous: false,
            episodeType: 'Esclusione',
            description: 'Studente escluso sistematicamente dai lavori di gruppo.',
            location: 'Laboratorio di Fisica',
            date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            reporterRole: 'Testimone'
        }
    ],
    selectedCaseId: null
};

// ============================================
// UTILITY FUNCTIONS
// ============================================
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div>${message}</div>
    `;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

function generateCaseCode() {
    return 'HU-' + Math.random().toString(36).substring(2, 10).toUpperCase();
}

function formatDate(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('it-IT');
}

function navigate(screen) {
    state.currentScreen = screen;
    render();
}

// ============================================
// COMPONENTS
// ============================================

// Navigation Bar Component
function NavigationBar() {
    if (!state.isAuthenticated || ['login', 'register', 'forgotPassword'].includes(state.currentScreen)) {
        return '';
    }
    
    const isHome = ['home', 'homeSketch', 'dashboard'].includes(state.currentScreen);
    const isCases = state.currentScreen === 'reportsList';
    const isHelp = state.currentScreen === 'help';
    
    return `
        <nav class="navbar">
            <div class="navbar-content">
                <div class="navbar-logo">
                    <img src="logo.png" alt="HumanUnity" style="width: 40px; height: 40px; object-fit: contain;" onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
                    <span style="font-size: 2rem; display: none;">🤝</span>
                    <span>HumanUnity</span>
                </div>
                <div class="navbar-nav">
                    <button class="nav-btn ${isHome ? 'active' : ''}" onclick="navigate('homeSketch')">
                        🏠 Home
                    </button>
                    <button class="nav-btn ${isCases ? 'active' : ''}" onclick="navigate('reportsList')">
                        📋 I tuoi casi
                    </button>
                    <button class="nav-btn ${isHelp ? 'active' : ''}" onclick="navigate('help')">
                        ❓ Aiuto
                    </button>
                    <button class="nav-btn btn-logout" onclick="handleLogout()">
                        🚪 Esci
                    </button>
                </div>
            </div>
        </nav>
    `;
}

// Login Component
function LoginScreen() {
    return `
        <div class="auth-container fade-in">
            <div class="card auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <img src="logo.png" alt="HumanUnity" style="width: 80px; height: 80px; object-fit: contain;" onerror="this.outerHTML='<span style=\'font-size: 4rem;\'>🤝</span>';">
                    </div>
                    <h1>HumanUnity</h1>
                    <p class="text-gray-600">Accedi alla piattaforma</p>
                </div>
                
                <form onsubmit="handleLogin(event)" class="slide-up">
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="loginEmail" required placeholder="tu@esempio.it">
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" id="loginPassword" required placeholder="••••••••">
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Accedi
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p class="text-sm text-gray-600">
                        <a href="#" onclick="navigate('forgotPassword')" class="auth-link">Password dimenticata?</a>
                    </p>
                    <p class="text-sm text-gray-600 mt-2">
                        Non hai un account? 
                        <a href="#" onclick="navigate('register')" class="auth-link">Registrati</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Register Component
function RegisterScreen() {
    return `
        <div class="auth-container fade-in">
            <div class="card auth-card">
                <div class="auth-header">
                    <div class="auth-logo">
                        <img src="logo.png" alt="HumanUnity" style="width: 80px; height: 80px; object-fit: contain;" onerror="this.outerHTML='<span style=\'font-size: 4rem;\'>🤝</span>';">
                    </div>
                    <h1>Registrati</h1>
                    <p class="text-gray-600">Crea il tuo account HumanUnity</p>
                </div>
                
                <form onsubmit="handleRegister(event)" class="slide-up">
                    <div class="form-group">
                        <label class="form-label">Nome</label>
                        <input type="text" class="form-input" id="registerName" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Email</label>
                        <input type="email" class="form-input" id="registerEmail" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Password</label>
                        <input type="password" class="form-input" id="registerPassword" required>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Registrati
                    </button>
                </form>
                
                <div class="auth-footer">
                    <p class="text-sm text-gray-600">
                        Hai già un account? 
                        <a href="#" onclick="navigate('login')" class="auth-link">Accedi</a>
                    </p>
                </div>
            </div>
        </div>
    `;
}

// Home Screen
function HomeScreen() {
    const incompleteCount = state.savedReports.filter(r => r.status === 'incomplete').length;
    
    return `
        <div class="home-container fade-in">
            <div class="home-header">
                <h1 class="home-title">Cosa ti è successo?</h1>
                <p class="home-subtitle">Scegli come vuoi procedere</p>
            </div>
            
            ${incompleteCount > 0 ? `
                <div class="alert alert-warning mb-6">
                    ⚠️ Hai ${incompleteCount} segnalazione${incompleteCount > 1 ? 'i' : ''} incompleta${incompleteCount > 1 ? 'e' : ''}. 
                    <a href="#" onclick="navigate('reportsList')" class="auth-link">Completa ora</a>
                </div>
            ` : ''}
            
            <div class="home-options">
                <button class="btn btn-primary btn-large btn-full" onclick="navigate('reportTypeChoice')">
                    📝 Segnala un episodio
                    <span class="text-sm" style="opacity: 0.9;">Compila un modulo guidato</span>
                </button>
                
                <button class="btn btn-secondary btn-large btn-full" onclick="navigate('chatAssistant')">
                    💬 Parla con l'assistente
                    <span class="text-sm" style="opacity: 0.9;">Racconta in modo conversazionale</span>
                </button>
                
                <button class="btn btn-outline btn-large btn-full" onclick="navigate('recognizeEpisode')">
                    🤔 Non so se è discriminazione
                    <span class="text-sm">Ti aiutiamo a capirlo</span>
                </button>
                
                <button class="btn btn-outline btn-full" onclick="navigate('immediateAdvice')">
                    🆘 Ho bisogno di aiuto immediato
                </button>
            </div>
        </div>
    `;
}

// Report Type Choice
function ReportTypeChoice() {
    return `
        <div class="home-container fade-in">
            <button class="btn btn-outline" onclick="navigate('homeSketch')" style="margin-bottom: 2rem;">
                ← Indietro
            </button>
            
            <div class="home-header">
                <h1 class="home-title">Come vuoi segnalare?</h1>
                <p class="home-subtitle">Scegli il tipo di segnalazione</p>
            </div>
            
            <div class="home-options">
                <button class="btn btn-primary btn-large btn-full" onclick="navigate('step1')">
                    📋 Segnalazione Completa
                    <span class="text-sm" style="opacity: 0.9;">Wizard guidato in 4 passaggi</span>
                </button>
                
                <button class="btn btn-secondary btn-large btn-full" onclick="navigate('quickReport')">
                    ⚡ Segnalazione Rapida (Panic Button)
                    <span class="text-sm" style="opacity: 0.9;">Salva le info base e completa dopo</span>
                </button>
            </div>
        </div>
    `;
}

// Quick Report (Panic Button)
function QuickReport() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 600px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('reportTypeChoice')">
                    ← Indietro
                </button>
                
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">⚡</div>
                    <h2>Segnalazione Rapida</h2>
                    <p class="text-gray-600">Salva velocemente le info essenziali</p>
                </div>
                
                <form onsubmit="handleQuickReport(event)">
                    <div class="form-group">
                        <label class="form-label">Cosa è successo?</label>
                        <select class="form-select" id="quickEpisodeType" required>
                            <option value="">Seleziona...</option>
                            <option value="Commenti offensivi">Commenti offensivi</option>
                            <option value="Esclusione">Esclusione</option>
                            <option value="Minacce">Minacce</option>
                            <option value="Altro">Altro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Dove?</label>
                        <input type="text" class="form-input" id="quickLocation" placeholder="Es. Aula 3, Online..." required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Vuoi essere ricontattato/a?</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="quickContact" value="no" checked>
                                <span>No, preferisco rimanere anonimo/a</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="quickContact" value="yes">
                                <span>Sì, lascio un contatto</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="alert alert-info mb-4">
                        💡 Potrai completare la segnalazione con più dettagli in seguito
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        💾 Salva segnalazione
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Wizard Step 1
function WizardStep1() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('reportTypeChoice')">
                    ← Indietro
                </button>
                
                <div class="progress-bar">
                    <div class="progress-step active">
                        <div class="progress-circle">1</div>
                        <span class="text-sm">Episodio</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-circle">2</div>
                        <span class="text-sm">Contesto</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-circle">3</div>
                        <span class="text-sm">Persone</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-circle">4</div>
                        <span class="text-sm">Privacy</span>
                    </div>
                </div>
                
                <h2 class="mb-4">Cosa è successo?</h2>
                
                <form onsubmit="handleStep1(event)">
                    <div class="form-group">
                        <label class="form-label">Tipo di episodio</label>
                        <select class="form-select" id="episodeType" required>
                            <option value="">Seleziona...</option>
                            <option value="Commenti offensivi">Commenti offensivi</option>
                            <option value="Esclusione">Esclusione</option>
                            <option value="Minacce o intimidazioni">Minacce o intimidazioni</option>
                            <option value="Contenuti online inappropriati">Contenuti online inappropriati</option>
                            <option value="Altro">Altro</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Descrizione (facoltativa in questo step)</label>
                        <textarea class="form-textarea" id="description" placeholder="Racconta cosa è successo con le tue parole...">${state.reportData.description}</textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Avanti →
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Wizard Step 2
function WizardStep2() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('step1')">
                    ← Indietro
                </button>
                
                <div class="progress-bar">
                    <div class="progress-step completed">
                        <div class="progress-circle">✓</div>
                        <span class="text-sm">Episodio</span>
                    </div>
                    <div class="progress-step active">
                        <div class="progress-circle">2</div>
                        <span class="text-sm">Contesto</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-circle">3</div>
                        <span class="text-sm">Persone</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-circle">4</div>
                        <span class="text-sm">Privacy</span>
                    </div>
                </div>
                
                <h2 class="mb-4">Dove e quando è successo?</h2>
                
                <form onsubmit="handleStep2(event)">
                    <div class="form-group">
                        <label class="form-label">Contesto educativo</label>
                        <input type="text" class="form-input" id="educationalContext" 
                               value="${state.reportData.educationalContext}" 
                               placeholder="Es. Aula 3, Laboratorio, Piattaforma Teams..." required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Data</label>
                        <input type="date" class="form-input" id="date" 
                               value="${state.reportData.date}" required>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Ora (opzionale)</label>
                        <input type="time" class="form-input" id="time" 
                               value="${state.reportData.time}">
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Avanti →
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Wizard Step 3
function WizardStep3() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('step2')">
                    ← Indietro
                </button>
                
                <div class="progress-bar">
                    <div class="progress-step completed">
                        <div class="progress-circle">✓</div>
                        <span class="text-sm">Episodio</span>
                    </div>
                    <div class="progress-step completed">
                        <div class="progress-circle">✓</div>
                        <span class="text-sm">Contesto</span>
                    </div>
                    <div class="progress-step active">
                        <div class="progress-circle">3</div>
                        <span class="text-sm">Persone</span>
                    </div>
                    <div class="progress-step">
                        <div class="progress-circle">4</div>
                        <span class="text-sm">Privacy</span>
                    </div>
                </div>
                
                <h2 class="mb-4">Chi era coinvolto?</h2>
                
                <form onsubmit="handleStep3(event)">
                    <div class="form-group">
                        <label class="form-label">Il tuo ruolo</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="role" value="vittima" 
                                       ${state.reportData.involvedRoles.includes('vittima') ? 'checked' : ''}>
                                <span>Direttamente coinvolto/a</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="role" value="testimone"
                                       ${state.reportData.involvedRoles.includes('testimone') ? 'checked' : ''}>
                                <span>Testimone</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="role" value="altro"
                                       ${state.reportData.involvedRoles.includes('altro') ? 'checked' : ''}>
                                <span>Preferisco non specificare</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Altre persone coinvolte (opzionale)</label>
                        <textarea class="form-textarea" id="otherInvolved" 
                                  placeholder="Descrivi brevemente chi altro era presente o coinvolto..."></textarea>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Avanti →
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Wizard Step 4
function WizardStep4() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('step3')">
                    ← Indietro
                </button>
                
                <div class="progress-bar">
                    <div class="progress-step completed">
                        <div class="progress-circle">✓</div>
                        <span class="text-sm">Episodio</span>
                    </div>
                    <div class="progress-step completed">
                        <div class="progress-circle">✓</div>
                        <span class="text-sm">Contesto</span>
                    </div>
                    <div class="progress-step completed">
                        <div class="progress-circle">✓</div>
                        <span class="text-sm">Persone</span>
                    </div>
                    <div class="progress-step active">
                        <div class="progress-circle">4</div>
                        <span class="text-sm">Privacy</span>
                    </div>
                </div>
                
                <h2 class="mb-4">Privacy e contatti</h2>
                
                <form onsubmit="handleStep4(event)">
                    <div class="form-group">
                        <label class="form-label">Vuoi rimanere anonimo/a?</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="anonymous" value="yes" 
                                       ${state.reportData.isAnonymous ? 'checked' : ''}>
                                <span>Sì, voglio rimanere anonimo/a</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="anonymous" value="no"
                                       ${!state.reportData.isAnonymous ? 'checked' : ''}>
                                <span>No, il mio nome può apparire</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">Come preferisci essere ricontattato/a?</label>
                        <div class="checkbox-group">
                            <label class="checkbox-item">
                                <input type="checkbox" name="contactChannel" value="email"
                                       ${state.reportData.contactChannels.includes('email') ? 'checked' : ''}>
                                <span>📧 Email</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" name="contactChannel" value="phone"
                                       ${state.reportData.contactChannels.includes('phone') ? 'checked' : ''}>
                                <span>📱 Telefono</span>
                            </label>
                            <label class="checkbox-item">
                                <input type="checkbox" name="contactChannel" value="none"
                                       ${state.reportData.contactChannels.includes('none') ? 'checked' : ''}>
                                <span>🚫 Preferisco non essere ricontattato/a</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Rivedi riepilogo →
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Summary
function Summary() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('step4')">
                    ← Indietro
                </button>
                
                <h2 class="mb-4">📋 Riepilogo segnalazione</h2>
                
                <div class="alert alert-info mb-6">
                    Verifica che tutte le informazioni siano corrette prima di inviare
                </div>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div class="card" style="background: var(--orange-50); border-left: 4px solid var(--orange-500);">
                        <h3>Tipo di episodio</h3>
                        <p>${state.reportData.episodeType}</p>
                        <button class="btn btn-outline text-sm mt-2" onclick="navigate('step1')">Modifica</button>
                    </div>
                    
                    <div class="card" style="background: var(--blue-50); border-left: 4px solid var(--blue-500);">
                        <h3>Descrizione</h3>
                        <p>${state.reportData.description || 'Non fornita'}</p>
                        <button class="btn btn-outline text-sm mt-2" onclick="navigate('step1')">Modifica</button>
                    </div>
                    
                    <div class="card" style="background: var(--green-50); border-left: 4px solid var(--green-500);">
                        <h3>Dove e quando</h3>
                        <p><strong>Luogo:</strong> ${state.reportData.educationalContext}</p>
                        <p><strong>Data:</strong> ${formatDate(state.reportData.date)}</p>
                        <p><strong>Ora:</strong> ${state.reportData.time || 'Non specificata'}</p>
                        <button class="btn btn-outline text-sm mt-2" onclick="navigate('step2')">Modifica</button>
                    </div>
                    
                    <div class="card" style="background: var(--purple-50); border-left: 4px solid var(--purple-500);">
                        <h3>Privacy</h3>
                        <p><strong>Anonimato:</strong> ${state.reportData.isAnonymous ? 'Sì' : 'No'}</p>
                        <p><strong>Contatto:</strong> ${state.reportData.contactChannels.join(', ') || 'Nessuno'}</p>
                        <button class="btn btn-outline text-sm mt-2" onclick="navigate('step4')">Modifica</button>
                    </div>
                </div>
                
                <button class="btn btn-success btn-full mt-6" onclick="handleSubmit()">
                    ✅ Invia segnalazione
                </button>
            </div>
        </div>
    `;
}

// Confirmation
function Confirmation() {
    return `
        <div class="auth-container fade-in">
            <div class="card auth-card" style="text-align: center;">
                <div style="font-size: 5rem; margin-bottom: 1rem;">✅</div>
                <h1 style="color: var(--green-600); margin-bottom: 1rem;">Segnalazione inviata!</h1>
                
                <div class="card" style="background: var(--green-50); padding: 1.5rem; margin-bottom: 2rem;">
                    <p class="text-sm text-gray-600 mb-2">Il tuo codice caso:</p>
                    <h2 style="font-size: 2rem; color: var(--green-700); font-family: monospace;">
                        ${state.caseCode}
                    </h2>
                    <p class="text-xs text-gray-600 mt-2">Conserva questo codice per seguire la tua segnalazione</p>
                </div>
                
                <div class="alert alert-success mb-4" style="text-align: left;">
                    <strong>Cosa succede ora?</strong><br>
                    Il team di HumanUnity esaminerà la tua segnalazione. 
                    Riceverai aggiornamenti ${state.reportData.contactChannels.length > 0 ? 'tramite i canali che hai indicato' : 'sul tuo account'}.
                </div>
                
                <button class="btn btn-primary btn-full" onclick="navigate('homeSketch')">
                    🏠 Torna alla home
                </button>
            </div>
        </div>
    `;
}

// Chat Assistant
function ChatAssistant() {
    const messages = state.chatMessages;
    
    return `
        <div class="chat-container fade-in">
            <div class="chat-header">
                <button class="btn btn-outline" onclick="navigate('homeSketch')" style="margin-bottom: 1rem;">
                    ← Indietro
                </button>
                <div class="flex items-center gap-3">
                    <div style="width: 3rem; height: 3rem; border-radius: 50%; background: linear-gradient(135deg, var(--purple-400), var(--blue-500)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                        HU
                    </div>
                    <div>
                        <h3>Assistente HumanUnity</h3>
                        <p class="text-sm text-gray-600">🟢 Online</p>
                    </div>
                </div>
            </div>
            
            <div class="chat-messages" id="chatMessages">
                ${messages.map(msg => `
                    <div class="chat-message ${msg.sender}">
                        ${msg.sender === 'bot' ? `
                            <div class="chat-avatar bot">HU</div>
                            <div class="chat-bubble bot">${msg.text}</div>
                        ` : `
                            <div class="chat-bubble user">${msg.text}</div>
                            <div class="chat-avatar user">Tu</div>
                        `}
                    </div>
                `).join('')}
            </div>
            
            <div class="chat-input-area">
                <form onsubmit="handleChatMessage(event)" id="chatForm">
                    <div class="chat-input-wrapper">
                        <input type="text" class="chat-input" id="chatInput" 
                               placeholder="Scrivi un messaggio..." autocomplete="off">
                        <button type="submit" class="btn btn-primary">Invia</button>
                    </div>
                </form>
                
                ${state.chatStep < 5 ? `
                    <div class="quick-replies">
                        ${getQuickReplies().map(reply => `
                            <button class="quick-reply-btn" onclick="handleQuickReply('${reply}')">${reply}</button>
                        `).join('')}
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

// Reports List
function ReportsList() {
    const reports = state.savedReports;
    
    return `
        <div class="container" style="padding: 2rem 1rem;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('homeSketch')">
                    ← Indietro
                </button>
                
                <h1 class="mb-6">📋 I tuoi casi</h1>
                
                ${reports.length === 0 ? `
                    <div class="alert alert-info">
                        Non hai ancora segnalazioni salvate.
                        <br><br>
                        <button class="btn btn-primary" onclick="navigate('reportTypeChoice')">
                            Crea una segnalazione
                        </button>
                    </div>
                ` : `
                    <div class="reports-grid">
                        ${reports.map(report => `
                            <div class="report-card ${report.status}">
                                <div class="report-header">
                                    <div>
                                        <h3>${report.episodeType}</h3>
                                        <p class="text-sm text-gray-600">${report.location}</p>
                                    </div>
                                    <span class="badge badge-${report.status === 'incomplete' ? 'warning' : 'success'}">
                                        ${report.status === 'incomplete' ? 'Incompleta' : 'Completa'}
                                    </span>
                                </div>
                                <div class="flex justify-between items-center mt-4">
                                    <span class="text-sm text-gray-600">
                                        ${formatDate(report.createdAt)}
                                    </span>
                                    ${report.status === 'incomplete' ? `
                                        <button class="btn btn-primary text-sm" onclick="completeReport('${report.id}')">
                                            Completa
                                        </button>
                                    ` : `
                                        <span class="text-sm" style="font-family: monospace; color: var(--green-700);">
                                            ${report.caseCode}
                                        </span>
                                    `}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `}
            </div>
        </div>
    `;
}

// Help Page (Simplified)
function HelpPage() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('homeSketch')">
                    ← Indietro
                </button>
                
                <h1 class="mb-6">❓ Aiuto</h1>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div class="card" style="background: var(--blue-50);">
                        <h3>📖 Come funziona HumanUnity?</h3>
                        <p>HumanUnity è una piattaforma sicura per segnalare episodi di discriminazione in ambito educativo. 
                        Puoi scegliere tra diverse modalità di segnalazione in base alle tue esigenze.</p>
                    </div>
                    
                    <div class="card" style="background: var(--green-50);">
                        <h3>🔒 La mia privacy è protetta?</h3>
                        <p>Sì, puoi scegliere di rimanere completamente anonimo/a. Le tue informazioni sono protette 
                        e gestite secondo le normative sulla privacy.</p>
                    </div>
                    
                    <div class="card" style="background: var(--orange-50);">
                        <h3>⚡ Cos'è la segnalazione rapida?</h3>
                        <p>È una funzione "panic button" che ti permette di salvare velocemente le informazioni essenziali 
                        dell'episodio. Potrai completarla con più dettagli quando ti senti pronto/a.</p>
                    </div>
                    
                    <div class="card" style="background: var(--purple-50);">
                        <h3>💬 Come funziona l'assistente conversazionale?</h3>
                        <p>L'assistente ti guida attraverso una conversazione naturale, ponendoti domande per raccogliere 
                        tutte le informazioni necessarie per la segnalazione.</p>
                    </div>
                    
                    <div class="card" style="background: var(--yellow-50);">
                        <h3>🆘 Ho bisogno di aiuto immediato</h3>
                        <p><strong>Telefono Azzurro:</strong> 19696<br>
                        <strong>Numero Anti-Discriminazione:</strong> 800 90 10 10<br>
                        <strong>Emergenze:</strong> 112</p>
                    </div>
                    
                    <div class="card" style="background: var(--gray-100);">
                        <h3>📧 Contatti</h3>
                        <p><strong>Email:</strong> supporto@humanunity.it<br>
                        <strong>Orari:</strong> Lun-Ven 9:00-18:00</p>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Recognize Episode
function RecognizeEpisode() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('homeSketch')">
                    ← Indietro
                </button>
                
                <h2 class="mb-4">🤔 Riconoscere la discriminazione</h2>
                
                <div class="alert alert-info mb-6">
                    Rispondi ad alcune domande per capire se quello che hai vissuto può essere considerato discriminazione
                </div>
                
                <form onsubmit="handleRecognize(event)">
                    <div class="form-group">
                        <label class="form-label">1. Il trattamento era basato su caratteristiche personali?</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="q1" value="yes" required>
                                <span>Sì (genere, etnia, religione, orientamento, disabilità...)</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="q1" value="no">
                                <span>No</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="q1" value="unsure">
                                <span>Non sono sicuro/a</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">2. Ti sei sentito/a trattato/a diversamente dagli altri?</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="q2" value="yes" required>
                                <span>Sì, in modo evidente</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="q2" value="maybe">
                                <span>Forse</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="q2" value="no">
                                <span>No</span>
                            </label>
                        </div>
                    </div>
                    
                    <div class="form-group">
                        <label class="form-label">3. L'episodio ti ha causato disagio o conseguenze negative?</label>
                        <div class="radio-group">
                            <label class="radio-item">
                                <input type="radio" name="q3" value="yes" required>
                                <span>Sì, significativo</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="q3" value="some">
                                <span>In parte</span>
                            </label>
                            <label class="radio-item">
                                <input type="radio" name="q3" value="no">
                                <span>No</span>
                            </label>
                        </div>
                    </div>
                    
                    <button type="submit" class="btn btn-primary btn-full">
                        Vedi risultato
                    </button>
                </form>
            </div>
        </div>
    `;
}

// Immediate Advice
function ImmediateAdvice() {
    return `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('homeSketch')">
                    ← Indietro
                </button>
                
                <div style="text-align: center; margin-bottom: 2rem;">
                    <div style="font-size: 4rem; margin-bottom: 1rem;">🆘</div>
                    <h2>Aiuto immediato</h2>
                </div>
                
                <div class="alert alert-warning mb-6">
                    <strong>⚠️ Se sei in pericolo immediato, chiama il 112</strong>
                </div>
                
                <div style="display: grid; gap: 1.5rem;">
                    <div class="card" style="background: var(--red-50); border-left: 4px solid var(--red-500);">
                        <h3>📞 Telefono Azzurro</h3>
                        <p class="mb-3">Ascolto e sostegno per bambini e adolescenti</p>
                        <a href="tel:19696" class="btn btn-primary">Chiama: 19696</a>
                    </div>
                    
                    <div class="card" style="background: var(--blue-50); border-left: 4px solid var(--blue-500);">
                        <h3>🛡️ Numero Anti-Discriminazione</h3>
                        <p class="mb-3">UNAR - Ufficio Nazionale Antidiscriminazioni Razziali</p>
                        <a href="tel:800901010" class="btn btn-primary">Chiama: 800 90 10 10</a>
                    </div>
                    
                    <div class="card" style="background: var(--green-50); border-left: 4px solid var(--green-500);">
                        <h3>💚 Supporto Psicologico</h3>
                        <p class="mb-3">Servizio di ascolto e supporto psicologico</p>
                        <p><strong>Tel:</strong> 02 96969</p>
                    </div>
                    
                    <div class="card" style="background: var(--orange-50); border-left: 4px solid var(--orange-500);">
                        <h3>📧 Contatta il team HumanUnity</h3>
                        <p class="mb-3">Per supporto non urgente</p>
                        <p><strong>Email:</strong> urgenze@humanunity.it</p>
                    </div>
                </div>
                
                <button class="btn btn-success btn-full mt-6" onclick="navigate('reportTypeChoice')">
                    Procedi con la segnalazione
                </button>
            </div>
        </div>
    `;
}

// ============================================
// EVENT HANDLERS
// ============================================
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    state.isAuthenticated = true;
    state.user = { email };
    
    // Check if referent
    if (email.includes('referente') || email.includes('rossi')) {
        state.userRole = 'referent';
        navigate('referentDashboard');
    } else {
        state.userRole = 'student';
        navigate('homeSketch');
    }
    
    showToast('Accesso effettuato con successo!', 'success');
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    
    state.isAuthenticated = true;
    state.user = { name, email };
    navigate('homeSketch');
    
    showToast('Registrazione completata!', 'success');
}

function handleLogout() {
    state.isAuthenticated = false;
    state.user = null;
    state.currentScreen = 'login';
    render();
    showToast('Disconnesso', 'info');
}

function handleQuickReport(event) {
    event.preventDefault();
    
    const episodeType = document.getElementById('quickEpisodeType').value;
    const location = document.getElementById('quickLocation').value;
    const wantContact = document.querySelector('input[name="quickContact"]:checked').value === 'yes';
    
    const caseCode = generateCaseCode();
    state.caseCode = caseCode;
    
    const report = {
        id: Date.now().toString(),
        type: 'quick',
        status: 'incomplete',
        caseCode: caseCode,
        episodeType: episodeType,
        location: location,
        date: '',
        createdAt: new Date()
    };
    
    state.savedReports.push(report);
    state.currentReportId = report.id;
    
    navigate('confirmation');
    showToast('Segnalazione rapida salvata!', 'success');
}

function handleStep1(event) {
    event.preventDefault();
    state.reportData.episodeType = document.getElementById('episodeType').value;
    state.reportData.description = document.getElementById('description').value;
    navigate('step2');
}

function handleStep2(event) {
    event.preventDefault();
    state.reportData.educationalContext = document.getElementById('educationalContext').value;
    state.reportData.date = document.getElementById('date').value;
    state.reportData.time = document.getElementById('time').value;
    navigate('step3');
}

function handleStep3(event) {
    event.preventDefault();
    const role = document.querySelector('input[name="role"]:checked').value;
    state.reportData.involvedRoles = [role];
    navigate('step4');
}

function handleStep4(event) {
    event.preventDefault();
    const isAnonymous = document.querySelector('input[name="anonymous"]:checked').value === 'yes';
    state.reportData.isAnonymous = isAnonymous;
    
    const channels = Array.from(document.querySelectorAll('input[name="contactChannel"]:checked'))
        .map(cb => cb.value);
    state.reportData.contactChannels = channels;
    
    navigate('summary');
}

function handleSubmit() {
    const caseCode = generateCaseCode();
    state.caseCode = caseCode;
    
    const report = {
        id: Date.now().toString(),
        type: 'detailed',
        status: 'complete',
        caseCode: caseCode,
        episodeType: state.reportData.episodeType,
        location: state.reportData.educationalContext,
        date: state.reportData.date,
        createdAt: new Date()
    };
    
    state.savedReports.push(report);
    navigate('confirmation');
    showToast('Segnalazione inviata con successo!', 'success');
}

function handleChatMessage(event) {
    event.preventDefault();
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    
    if (text) {
        addChatMessage('user', text);
        input.value = '';
        
        setTimeout(() => {
            processChatStep(text);
        }, 500);
    }
}

function handleQuickReply(reply) {
    addChatMessage('user', reply);
    setTimeout(() => {
        processChatStep(reply);
    }, 500);
}

function addChatMessage(sender, text) {
    state.chatMessages.push({ sender, text });
    render();
    
    setTimeout(() => {
        const messagesDiv = document.getElementById('chatMessages');
        if (messagesDiv) {
            messagesDiv.scrollTop = messagesDiv.scrollHeight;
        }
    }, 100);
}

function processChatStep(userInput) {
    const step = state.chatStep;
    
    if (step === 0) {
        // Save episode type
        state.reportData.episodeType = userInput;
        addChatMessage('bot', 'Grazie per avermelo detto. Mi dispiace che tu abbia vissuto questa situazione. Dove è successo?');
        state.chatStep = 1;
    } else if (step === 1) {
        // Save location
        state.reportData.educationalContext = userInput;
        addChatMessage('bot', 'Capisco. Puoi dirmi quando è successo? (anche una data approssimativa va bene)');
        state.chatStep = 2;
    } else if (step === 2) {
        // Save date
        state.reportData.date = userInput;
        addChatMessage('bot', 'Grazie. Eri direttamente coinvolto/a o eri testimone di quello che è successo?');
        state.chatStep = 3;
    } else if (step === 3) {
        // Save role
        state.reportData.involvedRoles = [userInput.toLowerCase().includes('testimone') ? 'testimone' : 'vittima'];
        addChatMessage('bot', 'Vuoi che la tua segnalazione rimanga anonima o il tuo nome può apparire?');
        state.chatStep = 4;
    } else if (step === 4) {
        // Save privacy
        state.reportData.isAnonymous = userInput.toLowerCase().includes('anoni');
        addChatMessage('bot', 'Perfetto! Ho raccolto tutte le informazioni necessarie. Posso generare la tua segnalazione.');
        state.chatStep = 5;
        
        setTimeout(() => {
            const caseCode = generateCaseCode();
            state.caseCode = caseCode;
            
            const report = {
                id: Date.now().toString(),
                type: 'chat',
                status: 'complete',
                caseCode: caseCode,
                episodeType: state.reportData.episodeType,
                location: state.reportData.educationalContext,
                date: state.reportData.date,
                createdAt: new Date()
            };
            
            state.savedReports.push(report);
            
            addChatMessage('bot', `✅ Segnalazione completata con successo! Il tuo codice caso è: ${caseCode}`);
            
            setTimeout(() => {
                navigate('confirmation');
            }, 2000);
        }, 1000);
    }
    
    render();
}

function getQuickReplies() {
    const step = state.chatStep;
    
    if (step === 0) {
        return ['Commenti offensivi', 'Esclusione', 'Minacce'];
    } else if (step === 1) {
        return ['In aula', 'Online', 'In corridoio'];
    } else if (step === 2) {
        return ['Oggi', 'Questa settimana', 'Questo mese'];
    } else if (step === 3) {
        return ['Ero coinvolto/a', 'Ero testimone'];
    } else if (step === 4) {
        return ['Sì, anonima', 'No, può apparire il mio nome'];
    }
    
    return [];
}

function completeReport(reportId) {
    const report = state.savedReports.find(r => r.id === reportId);
    if (report) {
        state.currentReportId = reportId;
        state.reportData = {
            episodeType: report.episodeType,
            description: '',
            educationalContext: report.location || '',
            date: report.date || '',
            time: '',
            involvedRoles: [],
            isAnonymous: true,
            contactChannels: []
        };
        navigate('step1');
    }
}

function handleRecognize(event) {
    event.preventDefault();
    const q1 = document.querySelector('input[name="q1"]:checked').value;
    const q2 = document.querySelector('input[name="q2"]:checked').value;
    const q3 = document.querySelector('input[name="q3"]:checked').value;
    
    // Simple logic to determine likelihood
    let score = 0;
    if (q1 === 'yes') score += 2;
    else if (q1 === 'unsure') score += 1;
    
    if (q2 === 'yes') score += 2;
    else if (q2 === 'maybe') score += 1;
    
    if (q3 === 'yes') score += 2;
    else if (q3 === 'some') score += 1;
    
    // Show result
    let resultHtml = '';
    if (score >= 5) {
        resultHtml = `
            <div class="card" style="background: var(--red-50); border-left: 4px solid var(--red-500);">
                <h2 style="color: var(--red-700); margin-bottom: 1rem;">⚠️ Probabile discriminazione</h2>
                <p>Sulla base delle tue risposte, quello che hai vissuto potrebbe costituire discriminazione. 
                Ti consigliamo di procedere con una segnalazione formale.</p>
                <button class="btn btn-primary mt-4" onclick="navigate('reportTypeChoice')">
                    Procedi con la segnalazione
                </button>
            </div>
        `;
    } else if (score >= 3) {
        resultHtml = `
            <div class="card" style="background: var(--yellow-50); border-left: 4px solid var(--yellow-500);">
                <h2 style="color: var(--yellow-800); margin-bottom: 1rem;">⚠️ Possibile discriminazione</h2>
                <p>La situazione che hai descritto presenta alcuni elementi che potrebbero configurare discriminazione. 
                Potresti considerare di fare una segnalazione o chiedere un parere.</p>
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-primary" onclick="navigate('reportTypeChoice')">
                        Fai una segnalazione
                    </button>
                    <button class="btn btn-outline" onclick="navigate('immediateAdvice')">
                        Chiedi aiuto
                    </button>
                </div>
            </div>
        `;
    } else {
        resultHtml = `
            <div class="card" style="background: var(--blue-50); border-left: 4px solid var(--blue-500);">
                <h2 style="color: var(--blue-700); margin-bottom: 1rem;">ℹ️ Situazione da valutare</h2>
                <p>Sulla base delle tue risposte, la situazione non sembra configurare chiaramente discriminazione, 
                ma se ti senti a disagio puoi comunque parlarne con qualcuno o fare una segnalazione.</p>
                <div class="flex gap-2 mt-4">
                    <button class="btn btn-primary" onclick="navigate('immediateAdvice')">
                        Chiedi aiuto
                    </button>
                    <button class="btn btn-outline" onclick="navigate('homeSketch')">
                        Torna alla home
                    </button>
                </div>
            </div>
        `;
    }
    
    document.getElementById('app').innerHTML = `
        <div class="container" style="padding: 2rem 1rem; max-width: 800px; margin: 0 auto;">
            <div class="card fade-in">
                <button class="btn btn-outline mb-4" onclick="navigate('homeSketch')">
                    ← Indietro
                </button>
                
                <h2 class="mb-4">🔍 Risultato valutazione</h2>
                
                ${resultHtml}
            </div>
        </div>
    `;
}

// Referent Dashboard (simplified)
function ReferentDashboard() {
    const cases = state.referentCases;
    
    const statusLabels = {
        'new': 'Nuovo',
        'evaluation': 'In valutazione',
        'mediation': 'Mediazione',
        'closed': 'Chiuso'
    };
    
    return `
        <div class="container" style="padding: 2rem 1rem;">
            <div class="card fade-in">
                <div class="flex justify-between items-center mb-6">
                    <h1>👩‍🏫 Dashboard Referente</h1>
                    <button class="btn btn-outline" onclick="handleLogout()">
                        Esci
                    </button>
                </div>
                
                <div class="alert alert-info mb-6">
                    Benvenuta Prof.ssa Rossi. Hai ${cases.filter(c => c.status === 'new').length} nuov${cases.filter(c => c.status === 'new').length === 1 ? 'o' : 'i'} cas${cases.filter(c => c.status === 'new').length === 1 ? 'o' : 'i'} da gestire.
                </div>
                
                <div>
                    ${cases.map(c => `
                        <div class="case-card ${c.status}" onclick="viewCase('${c.id}')">
                            <div class="flex justify-between items-start mb-3">
                                <div>
                                    <span class="badge badge-${c.status}">${statusLabels[c.status]}</span>
                                    <h3 class="mt-2">${c.episodeType}</h3>
                                </div>
                                <span style="font-family: monospace; color: var(--gray-600);">${c.caseCode}</span>
                            </div>
                            <p class="text-sm text-gray-600 mb-2">${c.description.substring(0, 100)}...</p>
                            <div class="flex justify-between text-xs text-gray-500">
                                <span>📍 ${c.location}</span>
                                <span>📅 ${formatDate(c.date)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;
}

function viewCase(caseId) {
    state.selectedCaseId = caseId;
    navigate('caseDetail');
}

// ============================================
// CASE DETAIL PAGE FOR REFERENT
// ============================================
function CaseDetail() {
    const caseData = state.referentCases.find(c => c.id === state.selectedCaseId);
    
    if (!caseData) {
        return `<div class="container"><p>Caso non trovato</p></div>`;
    }
    
    const statusLabels = {
        'new': 'Nuovo',
        'evaluation': 'In valutazione',
        'mediation': 'In mediazione',
        'closed': 'Chiuso'
    };
    
    const statusColors = {
        'new': 'badge-new',
        'evaluation': 'badge-evaluation',
        'mediation': 'badge-mediation',
        'closed': 'badge-closed'
    };
    
    return `
        <div class="container" style="padding: 2rem 1rem;">
            <div class="fade-in">
                <!-- Header -->
                <div class="card mb-4">
                    <div class="flex justify-between items-center mb-4">
                        <button class="btn btn-outline" onclick="navigate('referentDashboard')">
                            ← Indietro
                        </button>
                        <span class="badge ${statusColors[caseData.status]}">${statusLabels[caseData.status]}</span>
                    </div>
                    <div>
                        <h1>Caso ${caseData.caseCode}</h1>
                        <p class="text-sm text-gray-600">Aperto il ${formatDate(caseData.openedDate)}</p>
                    </div>
                </div>
                
                <!-- Summary Section -->
                <div class="card mb-4">
                    <h2 class="text-orange-900 mb-4">📋 Riepilogo segnalazione</h2>
                    
                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 1.5rem;">
                        <div>
                            <label class="form-label">Tipo di episodio</label>
                            <p class="text-gray-900">${caseData.episodeType}</p>
                        </div>
                        <div>
                            <label class="form-label">Contesto</label>
                            <p class="text-gray-900">${caseData.context}</p>
                        </div>
                        <div>
                            <label class="form-label">Luogo</label>
                            <p class="text-gray-900">${caseData.location || 'Non specificato'}</p>
                        </div>
                        <div>
                            <label class="form-label">Data episodio</label>
                            <p class="text-gray-900">${formatDate(caseData.date)}</p>
                        </div>
                        <div>
                            <label class="form-label">Orario</label>
                            <p class="text-gray-900">${caseData.time || 'Non specificato'}</p>
                        </div>
                        <div>
                            <label class="form-label">Privacy</label>
                            <span class="badge ${caseData.isAnonymous ? 'badge-purple' : 'badge-gray'}">
                                ${caseData.isAnonymous ? '🔒 Riservata' : 'Pubblica'}
                            </span>
                        </div>
                    </div>
                    
                    <div style="border-top: 1px solid var(--gray-200); padding-top: 1.5rem; margin-top: 1.5rem;">
                        <label class="form-label">Descrizione</label>
                        <p class="text-gray-900" style="white-space: pre-wrap;">${caseData.description}</p>
                    </div>
                    
                    ${!caseData.isAnonymous && caseData.reporterName ? `
                        <div style="border-top: 1px solid var(--gray-200); padding-top: 1.5rem; margin-top: 1.5rem;">
                            <label class="form-label">Contatti segnalante</label>
                            <p class="text-gray-900"><strong>Nome:</strong> ${caseData.reporterName}</p>
                            ${caseData.reporterEmail ? `<p class="text-gray-900"><strong>Email:</strong> ${caseData.reporterEmail}</p>` : ''}
                        </div>
                    ` : ''}
                </div>
                
                <!-- Status Change Section -->
                <div class="card mb-4" style="background: var(--blue-50); border-color: var(--blue-200);">
                    <h3 class="text-blue-900 mb-3">🔄 Cambia stato del caso</h3>
                    <p class="text-sm text-gray-600 mb-4">Aggiorna lo stato in base all'avanzamento della gestione</p>
                    
                    <form onsubmit="updateCaseStatus(event, '${caseData.id}')" style="display: flex; gap: 1rem; align-items: end; flex-wrap: wrap;">
                        <div class="form-group" style="flex: 1; min-width: 200px; margin: 0;">
                            <label class="form-label">Nuovo stato</label>
                            <select class="form-input" id="newStatus" required>
                                <option value="new" ${caseData.status === 'new' ? 'selected' : ''}>Nuovo</option>
                                <option value="evaluation" ${caseData.status === 'evaluation' ? 'selected' : ''}>In valutazione</option>
                                <option value="mediation" ${caseData.status === 'mediation' ? 'selected' : ''}>In mediazione</option>
                                <option value="closed" ${caseData.status === 'closed' ? 'selected' : ''}>Chiuso</option>
                            </select>
                        </div>
                        <button type="submit" class="btn btn-primary">
                            💾 Salva stato
                        </button>
                    </form>
                </div>
                
                <!-- Actions Checklist -->
                <div class="card mb-4" style="background: var(--orange-50); border-color: var(--orange-200);">
                    <h3 class="text-orange-900 mb-3">✓ Azioni da intraprendere</h3>
                    
                    <div class="space-y-3">
                        <div class="action-item">
                            <label class="checkbox-label">
                                <input type="checkbox" onchange="toggleCaseAction(this, '${caseData.id}', 'contact_reporter')">
                                <span>Contatta la persona segnalante</span>
                            </label>
                        </div>
                        <div class="action-item">
                            <label class="checkbox-label">
                                <input type="checkbox" onchange="toggleCaseAction(this, '${caseData.id}', 'contact_involved')">
                                <span>Contatta il docente/persona coinvolta</span>
                            </label>
                        </div>
                        <div class="action-item">
                            <label class="checkbox-label">
                                <input type="checkbox" onchange="toggleCaseAction(this, '${caseData.id}', 'mediation')">
                                <span>Proponi mediazione</span>
                            </label>
                        </div>
                        <div class="action-item">
                            <label class="checkbox-label">
                                <input type="checkbox" onchange="toggleCaseAction(this, '${caseData.id}', 'legal')">
                                <span>Attiva ufficio legale (se necessario)</span>
                            </label>
                        </div>
                        <div class="action-item">
                            <label class="checkbox-label">
                                <input type="checkbox" onchange="toggleCaseAction(this, '${caseData.id}', 'followup')">
                                <span>Pianifica follow-up</span>
                            </label>
                        </div>
                    </div>
                </div>
                
                <!-- Timeline -->
                <div class="card mb-4" style="background: var(--green-50); border-color: var(--green-200);">
                    <h3 class="text-green-900 mb-4">📅 Timeline delle attività</h3>
                    
                    <div class="timeline">
                        <div class="timeline-item">
                            <div class="timeline-marker">📩</div>
                            <div class="timeline-content">
                                <h4>Caso aperto</h4>
                                <p class="text-sm text-gray-600">${formatDate(caseData.openedDate)}</p>
                                <p class="text-sm">Segnalazione ricevuta tramite piattaforma</p>
                            </div>
                        </div>
                        ${caseData.status !== 'new' ? `
                            <div class="timeline-item">
                                <div class="timeline-marker">👁️</div>
                                <div class="timeline-content">
                                    <h4>Caso in valutazione</h4>
                                    <p class="text-sm text-gray-600">Prof.ssa Rossi</p>
                                    <p class="text-sm">Inizio analisi del caso</p>
                                </div>
                            </div>
                        ` : ''}
                        ${caseData.status === 'mediation' || caseData.status === 'closed' ? `
                            <div class="timeline-item">
                                <div class="timeline-marker">🤝</div>
                                <div class="timeline-content">
                                    <h4>Mediazione avviata</h4>
                                    <p class="text-sm text-gray-600">Prof.ssa Rossi</p>
                                    <p class="text-sm">Processo di mediazione in corso</p>
                                </div>
                            </div>
                        ` : ''}
                        ${caseData.status === 'closed' ? `
                            <div class="timeline-item">
                                <div class="timeline-marker">✅</div>
                                <div class="timeline-content">
                                    <h4>Caso chiuso</h4>
                                    <p class="text-sm text-gray-600">${formatDate(caseData.closedDate || new Date().toISOString())}</p>
                                    <p class="text-sm">${caseData.resolution || 'Caso risolto con successo'}</p>
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
                
                <!-- Notes Section -->
                <div class="card mb-4">
                    <h3 class="mb-3">📝 Note interne</h3>
                    <form onsubmit="addCaseNote(event, '${caseData.id}')">
                        <div class="form-group">
                            <textarea 
                                id="caseNote" 
                                class="form-input" 
                                rows="4" 
                                placeholder="Aggiungi note private sul caso (visibili solo ai referenti)..."
                            ></textarea>
                        </div>
                        <button type="submit" class="btn btn-outline">
                            💬 Aggiungi nota
                        </button>
                    </form>
                    
                    <div id="caseNotes" class="mt-4">
                        <!-- Notes will be added here dynamically -->
                    </div>
                </div>
                
                <!-- Close Case Section -->
                ${caseData.status !== 'closed' ? `
                    <div class="card" style="background: var(--red-50); border: 2px solid var(--red-200);">
                        <h3 class="text-red-900 mb-3">⚠️ Chiudi il caso</h3>
                        <p class="text-sm text-red-700 mb-4">
                            Completa tutte le azioni necessarie prima di chiudere definitivamente il caso
                        </p>
                        
                        <form onsubmit="closeCaseWithResolution(event, '${caseData.id}')">
                            <div class="form-group">
                                <label class="form-label">Riepilogo finale e risoluzione</label>
                                <textarea 
                                    id="caseResolution" 
                                    class="form-input" 
                                    rows="4" 
                                    required
                                    placeholder="Es. Caso risolto tramite mediazione. Il docente ha riconosciuto il comportamento inappropriato e si è scusato. Follow-up programmato tra 2 mesi."
                                ></textarea>
                            </div>
                            <button type="submit" class="btn" style="background: var(--red-600); color: white;">
                                ✓ Conferma chiusura caso
                            </button>
                        </form>
                    </div>
                ` : `
                    <div class="card" style="background: var(--green-50); border: 2px solid var(--green-200);">
                        <h3 class="text-green-900 mb-3">✅ Caso Chiuso</h3>
                        <p class="text-sm text-green-700">
                            Questo caso è stato chiuso il ${formatDate(caseData.closedDate || new Date().toISOString())}
                        </p>
                        ${caseData.resolution ? `
                            <div class="mt-3 p-3" style="background: white; border-radius: 0.5rem;">
                                <strong>Risoluzione:</strong><br>
                                ${caseData.resolution}
                            </div>
                        ` : ''}
                    </div>
                `}
            </div>
        </div>
    `;
}

// Case management functions
function updateCaseStatus(event, caseId) {
    event.preventDefault();
    const newStatus = document.getElementById('newStatus').value;
    
    const caseIndex = state.referentCases.findIndex(c => c.id === caseId);
    if (caseIndex !== -1) {
        state.referentCases[caseIndex].status = newStatus;
        showToast(`Stato aggiornato a: ${newStatus}`, 'success');
        render();
    }
}

function toggleCaseAction(checkbox, caseId, actionType) {
    // In a real app, this would save to a database
    showToast(checkbox.checked ? 'Azione completata ✓' : 'Azione riaperta', 'info');
}

function addCaseNote(event, caseId) {
    event.preventDefault();
    const noteText = document.getElementById('caseNote').value;
    
    if (!noteText.trim()) return;
    
    // In a real app, this would save to a database
    const notesContainer = document.getElementById('caseNotes');
    const noteHtml = `
        <div class="card" style="background: var(--gray-50); padding: 1rem; margin-top: 0.75rem;">
            <div class="flex justify-between items-start mb-2">
                <strong class="text-sm">Prof.ssa Rossi</strong>
                <span class="text-xs text-gray-500">${new Date().toLocaleString('it-IT')}</span>
            </div>
            <p class="text-sm">${noteText}</p>
        </div>
    `;
    notesContainer.innerHTML = noteHtml + notesContainer.innerHTML;
    
    document.getElementById('caseNote').value = '';
    showToast('Nota aggiunta con successo', 'success');
}

function closeCaseWithResolution(event, caseId) {
    event.preventDefault();
    const resolution = document.getElementById('caseResolution').value;
    
    if (!resolution.trim()) {
        showToast('Inserisci un riepilogo finale', 'error');
        return;
    }
    
    const caseIndex = state.referentCases.findIndex(c => c.id === caseId);
    if (caseIndex !== -1) {
        state.referentCases[caseIndex].status = 'closed';
        state.referentCases[caseIndex].closedDate = new Date().toISOString();
        state.referentCases[caseIndex].resolution = resolution;
        
        showToast('Caso chiuso con successo!', 'success');
        setTimeout(() => navigate('referentDashboard'), 1500);
    }
}

// ============================================
// RENDER FUNCTION
// ============================================
function render() {
    const app = document.getElementById('app');
    let content = '';
    
    // Add navigation bar if authenticated
    content += NavigationBar();
    
    // Render current screen
    switch (state.currentScreen) {
        case 'login':
            content += LoginScreen();
            break;
        case 'register':
            content += RegisterScreen();
            break;
        case 'homeSketch':
        case 'home':
            content += HomeScreen();
            break;
        case 'reportTypeChoice':
            content += ReportTypeChoice();
            break;
        case 'quickReport':
            content += QuickReport();
            break;
        case 'step1':
            content += WizardStep1();
            break;
        case 'step2':
            content += WizardStep2();
            break;
        case 'step3':
            content += WizardStep3();
            break;
        case 'step4':
            content += WizardStep4();
            break;
        case 'summary':
            content += Summary();
            break;
        case 'confirmation':
            content += Confirmation();
            break;
        case 'chatAssistant':
            content += ChatAssistant();
            // Initialize chat if empty
            if (state.chatMessages.length === 0) {
                state.chatMessages = [
                    { sender: 'bot', text: 'Ciao! Sono l\'assistente di HumanUnity. Sono qui per aiutarti a segnalare l\'episodio.' },
                    { sender: 'bot', text: 'Raccontami con calma: che tipo di episodio hai vissuto?' }
                ];
            }
            break;
        case 'reportsList':
            content += ReportsList();
            break;
        case 'help':
            content += HelpPage();
            break;
        case 'recognizeEpisode':
            content += RecognizeEpisode();
            break;
        case 'immediateAdvice':
            content += ImmediateAdvice();
            break;
        case 'referentDashboard':
            content += ReferentDashboard();
            break;
        case 'caseDetail':
            content += CaseDetail();
            break;
        default:
            content += HomeScreen();
    }
    
    app.innerHTML = content;
}

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    render();
});
