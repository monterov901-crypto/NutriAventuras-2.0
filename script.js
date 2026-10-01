/* ==========================================
   NUTRIAVENTURAS - LÓGICA DE LA APLICACIÓN
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {
    // ESTADO DE LA APLICACIÓN
    const savedProfile = JSON.parse(localStorage.getItem('nutri-profile') || 'null');
    const savedAvatar = JSON.parse(localStorage.getItem('nutri-avatar') || 'null');
    const savedEvidence = JSON.parse(localStorage.getItem('nutri-mission-evidence') || '{}');
    const savedMissions = JSON.parse(localStorage.getItem('nutri-missions') || '[]');
    const state = {
        studentName: savedProfile?.name || 'Aventurero/a',
        studentGrade: savedProfile?.grade || 'Primero B',
        gender: savedProfile?.gender || 'neutral',
        age: savedProfile?.age || '8',
        goal: savedProfile?.goal || 'explore',
        avatar: { gender: savedProfile?.gender || 'neutral', skin: 'light', hair: 'short', hairColor: 'brown', clothing: 'tee', shirt: 'blue', pants: 'navy', accessory: 'none', ...savedAvatar },
        points: Number(localStorage.getItem('nutri-points') || 0),
        completedMissions: savedMissions.filter(missionId => Number(missionId) < 3 || savedEvidence[missionId]),
        missionEvidence: savedEvidence,
        unlockedBadges: [1],
        plateItems: []
    };

    // NIVELES DE PUNTOS
    const TOTAL_MISSIONS = 10;
    const MAX_POINTS = 15;
    const LEVELS = {
        0: 'Explorador Saludable',
        5: 'Amigo de las Frutas',
        10: 'Héroe del Agua',
        15: 'Campeón Saludable'
    };

    /* ==========================================
       1. REGISTRO DE ESTUDIANTE (MODAL)
       ========================================== */
    const modalRegister = document.getElementById('modal-register');
    const formRegister = document.getElementById('form-register');
    const userGreeting = document.getElementById('user-greeting');
    const userGradeTag = document.getElementById('user-grade-tag');
    const btnEditProfile = document.getElementById('btn-edit-profile');
    const headerAvatar = document.getElementById('header-avatar');

    function getAvatar(gender, skin = 'light') {
        const skinIndex = { light: 0, sand: 1, medium: 2, brown: 3, deep: 4 }[skin] ?? 0;
        const faces = {
            female: ['👧🏻', '👧🏼', '👧🏽', '👧🏾', '👧🏿'],
            male: ['👦🏻', '👦🏼', '👦🏽', '👦🏾', '👦🏿'],
            neutral: ['🧑🏻', '🧑🏼', '🧑🏽', '🧑🏾', '🧑🏿']
        };
        return faces[gender]?.[skinIndex] || faces.neutral[skinIndex];
    }

    function updateProfileUI() {
        userGreeting.textContent = `Hola, ${state.studentName}`;
        userGradeTag.textContent = state.studentGrade;
        headerAvatar.textContent = getAvatar(state.avatar.gender, state.avatar.skin);
        document.getElementById('avatar-preview-name').textContent = state.studentName;
        document.getElementById('student-name').value = state.studentName === 'Aventurero/a' ? '' : state.studentName;
        document.getElementById('student-grade').value = state.studentGrade;
        document.getElementById('student-gender').value = state.gender;
        document.getElementById('student-age').value = state.age;
        document.getElementById('student-goal').value = state.goal;
    }

    const backgroundMusic = document.getElementById('background-music');
    const backgroundScene = document.querySelector('.nutri-bg');
    if (backgroundScene) {
        const resetBackgroundParallax = () => {
            ['--bg-cloud-x', '--bg-sun-x', '--bg-mountains-x', '--bg-water-x', '--bg-hills-x', '--bg-grass-x', '--bg-vertical-y'].forEach(property => backgroundScene.style.setProperty(property, '0px'));
        };
        document.addEventListener('pointermove', event => {
            const horizontal = event.clientX / Math.max(window.innerWidth, 1) - 0.5;
            const vertical = event.clientY / Math.max(window.innerHeight, 1) - 0.5;
            backgroundScene.style.setProperty('--bg-cloud-x', `${horizontal * -18}px`);
            backgroundScene.style.setProperty('--bg-sun-x', `${horizontal * 9}px`);
            backgroundScene.style.setProperty('--bg-mountains-x', `${horizontal * 12}px`);
            backgroundScene.style.setProperty('--bg-water-x', `${horizontal * -14}px`);
            backgroundScene.style.setProperty('--bg-hills-x', `${horizontal * 23}px`);
            backgroundScene.style.setProperty('--bg-grass-x', `${horizontal * 34}px`);
            backgroundScene.style.setProperty('--bg-vertical-y', `${vertical * 7}px`);
        });
        document.addEventListener('pointerout', event => {
            if (!event.relatedTarget) resetBackgroundParallax();
        });
        window.addEventListener('blur', resetBackgroundParallax);
    }

    if (backgroundMusic) {
        backgroundMusic.volume = 0.35;
        backgroundMusic.play().catch(() => {
            document.addEventListener('pointerdown', () => backgroundMusic.play().catch(() => {}), { once: true });
        });
    }

    updateProfileUI();

    formRegister.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('student-name').value.trim();
        const gradeInput = document.getElementById('student-grade').value;
        const genderInput = document.getElementById('student-gender').value;
        const ageInput = document.getElementById('student-age').value;
        const goalInput = document.getElementById('student-goal').value;
        const avatarChoice = document.querySelector('input[name="avatar-choice"]:checked').value;

        if (nameInput) {
            state.studentName = nameInput;
            state.studentGrade = gradeInput;
            state.gender = avatarChoice === 'auto' ? genderInput : avatarChoice;
            state.age = ageInput;
            state.goal = goalInput;
            localStorage.setItem('nutri-profile', JSON.stringify({ name: state.studentName, grade: state.studentGrade, gender: state.gender, age: state.age, goal: state.goal }));
            updateProfileUI();

            updateUI();

            modalRegister.classList.add('hidden');
            showToast(`¡Hola, ${state.studentName}! Tu aventura está lista.`);
        }
    });

    btnEditProfile.addEventListener('click', () => {
        modalRegister.classList.remove('hidden');
    });

    const closeModal = document.getElementById('close-modal');
    if (closeModal) closeModal.addEventListener('click', () => modalRegister.classList.add('hidden'));
    modalRegister.classList.add('hidden');


    /* ==========================================
       2. NAVEGACIÓN ENTRE PESTAÑAS
       ========================================== */
    const navButtons = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.content-section');

    function openSection(targetId) {
        if (!document.getElementById(targetId)) return;
        navButtons.forEach(button => button.classList.toggle('active', button.dataset.target === targetId));
        sections.forEach(section => section.classList.toggle('active', section.id === targetId));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => openSection(btn.dataset.target));
    });
    document.querySelectorAll('[data-open-section]').forEach(button => button.addEventListener('click', () => openSection(button.dataset.openSection)));
    document.getElementById('btn-edit-avatar').addEventListener('click', () => openSection('sec-avatar'));
    document.querySelectorAll('[data-open-game]').forEach(button => button.addEventListener('click', () => {
        openSection('sec-juegos');
        document.getElementById(button.dataset.openGame)?.click();
    }));

    const interactiveLandscape = document.getElementById('interactive-landscape');
    interactiveLandscape.addEventListener('pointermove', event => {
        const bounds = interactiveLandscape.getBoundingClientRect();
        const horizontal = (event.clientX - bounds.left) / bounds.width - 0.5;
        const vertical = (event.clientY - bounds.top) / bounds.height - 0.5;
        interactiveLandscape.style.setProperty('--scene-x', `${horizontal * 12}px`);
        interactiveLandscape.style.setProperty('--scene-y', `${vertical * 8}px`);
    });
    interactiveLandscape.addEventListener('pointerleave', () => {
        interactiveLandscape.style.setProperty('--scene-x', '0px');
        interactiveLandscape.style.setProperty('--scene-y', '0px');
    });
    interactiveLandscape.querySelectorAll('[data-scene-item]').forEach(item => item.addEventListener('click', () => {
        item.classList.remove('scene-pop');
        void item.offsetWidth;
        item.classList.add('scene-pop');
        window.setTimeout(() => item.classList.remove('scene-pop'), 650);
    }));

    const avatarPreview = document.getElementById('avatar-preview');
    const avatarSkinTones = { light: '#f5d4bd', sand: '#e8b995', medium: '#c98d67', brown: '#9b6247', deep: '#694334' };
    const avatarHairTones = { brown: '#51372b', black: '#28272b', blonde: '#d8a94f', auburn: '#9c5036' };
    const avatarAccessories = { none: '', cap: '🧢', glasses: '👓', bow: '🎀', backpack: '🎒' };
    function renderAvatar() {
        document.getElementById('avatar-preview-accessory').textContent = avatarAccessories[state.avatar.accessory] || '';
        avatarPreview.style.setProperty('--skin-tone', avatarSkinTones[state.avatar.skin] || avatarSkinTones.light);
        avatarPreview.style.setProperty('--hair-tone', avatarHairTones[state.avatar.hairColor] || avatarHairTones.brown);
        avatarPreview.dataset.shirt = state.avatar.shirt;
        avatarPreview.dataset.pants = state.avatar.pants;
        avatarPreview.dataset.gender = state.avatar.gender;
        avatarPreview.dataset.hair = state.avatar.hair;
        avatarPreview.dataset.hairColor = state.avatar.hairColor;
        avatarPreview.dataset.clothing = state.avatar.clothing;
        avatarPreview.dataset.accessory = state.avatar.accessory;
        headerAvatar.textContent = getAvatar(state.avatar.gender, state.avatar.skin);
        document.querySelectorAll('[data-avatar-gender]').forEach(button => button.classList.toggle('selected', button.dataset.avatarGender === state.avatar.gender));
        document.querySelectorAll('.avatar-skin').forEach(button => button.classList.toggle('selected', button.dataset.skin === state.avatar.skin));
        document.querySelectorAll('[data-hair]').forEach(button => button.classList.toggle('selected', button.dataset.hair === state.avatar.hair));
        document.querySelectorAll('.hair-color-choice').forEach(button => button.classList.toggle('selected', button.dataset.hairColor === state.avatar.hairColor));
        document.querySelectorAll('[data-clothing]').forEach(button => button.classList.toggle('selected', button.dataset.clothing === state.avatar.clothing));
        document.querySelectorAll('.shirt-choice').forEach(button => button.classList.toggle('selected', button.dataset.shirt === state.avatar.shirt));
        document.querySelectorAll('.avatar-pants-choice').forEach(button => button.classList.toggle('selected', button.dataset.pants === state.avatar.pants));
        document.querySelectorAll('[data-accessory]').forEach(button => button.classList.toggle('selected', button.dataset.accessory === state.avatar.accessory));
    }
    document.querySelectorAll('[data-avatar-gender]').forEach(button => button.addEventListener('click', () => { state.avatar.gender = button.dataset.avatarGender; renderAvatar(); }));
    document.querySelectorAll('.avatar-skin').forEach(button => button.addEventListener('click', () => { state.avatar.skin = button.dataset.skin; renderAvatar(); }));
    document.querySelectorAll('[data-hair]').forEach(button => button.addEventListener('click', () => { state.avatar.hair = button.dataset.hair; renderAvatar(); }));
    document.querySelectorAll('.hair-color-choice').forEach(button => button.addEventListener('click', () => { state.avatar.hairColor = button.dataset.hairColor; renderAvatar(); }));
    document.querySelectorAll('[data-clothing]').forEach(button => button.addEventListener('click', () => { state.avatar.clothing = button.dataset.clothing; renderAvatar(); }));
    document.querySelectorAll('.shirt-choice').forEach(button => button.addEventListener('click', () => { state.avatar.shirt = button.dataset.shirt; renderAvatar(); }));
    document.querySelectorAll('.avatar-pants-choice').forEach(button => button.addEventListener('click', () => { state.avatar.pants = button.dataset.pants; renderAvatar(); }));
    document.querySelectorAll('[data-accessory]').forEach(button => button.addEventListener('click', () => { state.avatar.accessory = button.dataset.accessory; renderAvatar(); }));
    document.getElementById('save-avatar').addEventListener('click', () => {
        localStorage.setItem('nutri-avatar', JSON.stringify(state.avatar));
        headerAvatar.textContent = getAvatar(state.avatar.gender, state.avatar.skin);
        document.getElementById('avatar-save-feedback').textContent = '¡Tu avatar quedó guardado!';
        showToast('¡Avatar guardado!');
    });
    document.getElementById('btn-profile-modal').addEventListener('click', () => modalRegister.classList.remove('hidden'));
    renderAvatar();


    /* ==========================================
       3. SISTEMA DE PUNTOS Y LOGROS
       ========================================== */
    const totalPointsDisplay = document.getElementById('total-points');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressText = document.getElementById('progress-text');
    const currentLevelTitle = document.getElementById('current-level-title');

    function addPoints(amount) {
        state.points += amount;
        localStorage.setItem('nutri-points', state.points);
        updateUI();
        checkBadges();

        // Lanzar efecto de confeti al ganar puntos
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { y: 0.7 }
            });
        }
    }

    function updateUI() {
        // Actualizar contador
        totalPointsDisplay.textContent = state.points;
        const gamesPoints = document.getElementById('games-points');
        if (gamesPoints) gamesPoints.textContent = state.points;

        // Actualizar barra de progreso
        const percentage = Math.min((state.points / MAX_POINTS) * 100, 100);
        progressBarFill.style.width = `${percentage}%`;
        progressText.textContent = `${state.points} / ${MAX_POINTS} puntos para el nivel máximo`;

        // Actualizar título de nivel según puntos
        if (state.points >= 15) {
            currentLevelTitle.textContent = LEVELS[15];
        } else if (state.points >= 10) {
            currentLevelTitle.textContent = LEVELS[10];
        } else if (state.points >= 5) {
            currentLevelTitle.textContent = LEVELS[5];
        } else {
            currentLevelTitle.textContent = LEVELS[0];
        }
        completeMissionBtns.forEach(btn => {
            const missionId = btn.getAttribute('data-mission');
            if (state.completedMissions.includes(missionId)) {
                btn.textContent = 'Completado ✓';
                btn.disabled = true;
                btn.classList.add('completed');
            } else {
                btn.textContent = '¡Completar!';
                const missionCard = document.getElementById(`mission-${missionId}`);
                const evidenceText = missionCard?.querySelector('.evidence-text')?.value.trim();
                const evidenceFile = missionCard?.querySelector('.evidence-file')?.files.length > 0;
                btn.disabled = missionId === '2' && waterCount < 4 || Number(missionId) >= 3 && !evidenceText && !evidenceFile;
                btn.classList.remove('completed');
            }
        });
        Object.entries(state.missionEvidence).forEach(([missionId, evidence]) => {
            const evidenceText = document.querySelector(`#mission-${missionId} .evidence-text`);
            if (evidenceText && evidence.text) evidenceText.value = evidence.text;
        });
        localStorage.setItem('nutri-missions', JSON.stringify(state.completedMissions));
        updateMissionProgress();
    }

    function checkBadges() {
        if (state.points >= 5 && !state.unlockedBadges.includes(2)) {
            unlockBadge(2);
        }
        if (state.points >= 10 && !state.unlockedBadges.includes(3)) {
            unlockBadge(3);
        }
        if (state.points >= 15 && !state.unlockedBadges.includes(4)) {
            unlockBadge(4);
        }
    }

    function unlockBadge(badgeId) {
        state.unlockedBadges.push(badgeId);
        const badgeCard = document.getElementById(`badge-${badgeId}`);
        if (badgeCard) {
            badgeCard.classList.remove('locked');
            badgeCard.classList.add('unlocked');
        }
    }

    function showToast(message, icon = '✓') {
        const toast = document.getElementById('toast');
        if (!toast) return;
        document.getElementById('toast-message').textContent = message;
        document.getElementById('toast-icon').textContent = icon;
        toast.classList.add('visible');
        window.setTimeout(() => toast.classList.remove('visible'), 2800);
    }

    function showMissionsComplete() {
        const celebrationModal = document.getElementById('missions-complete-modal');
        if (!celebrationModal) return;
        celebrationModal.classList.add('visible-modal');
        if (typeof confetti === 'function') {
            confetti({ particleCount: 130, spread: 90, origin: { y: 0.62 }, colors: ['#20afe4', '#55cfa0', '#ffd343', '#ff8b8b'] });
        }
    }

    function closeMissionsComplete() {
        document.getElementById('missions-complete-modal')?.classList.remove('visible-modal');
    }

    document.getElementById('close-celebration')?.addEventListener('click', closeMissionsComplete);
    document.getElementById('celebration-ok')?.addEventListener('click', closeMissionsComplete);

    function updateMissionProgress() {
        const count = state.completedMissions.length;
        const percent = Math.round((count / TOTAL_MISSIONS) * 100);
        const countDisplay = document.getElementById('mission-count');
        const summaryNumber = document.getElementById('mission-summary-number');
        if (countDisplay) countDisplay.textContent = `${count}/3`;
        if (summaryNumber) summaryNumber.textContent = count;
        document.querySelectorAll('#mission-progress, #mission-summary-fill').forEach(bar => bar.style.width = `${percent}%`);
        const summaryPercent = document.getElementById('mission-summary-percent');
        if (summaryPercent) summaryPercent.textContent = `${percent}%`;
    }


    /* ==========================================
       4. INTERACTIVIDAD DE MISIONES
       ========================================== */
    // Misión 1: Seleccionar fruta
    const selectFruit = document.getElementById('select-fruit');
    let fruitSelected = false;

    selectFruit.addEventListener('change', () => {
        fruitSelected = selectFruit.value !== "";
    });

    // Misión 2: Contador de agua
    const waterBtns = document.querySelectorAll('.btn-water');
    let waterCount = 0;
    const mission2Btn = document.querySelector('[data-mission="2"]');

    waterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (!btn.classList.contains('selected')) {
                btn.classList.add('selected');
                waterCount++;

                if (waterCount >= 4) {
                    mission2Btn.removeAttribute('disabled');
                }
            }
        });
    });

    // Botones para completar misiones
    const completeMissionBtns = document.querySelectorAll('.btn-complete-mission');

    document.querySelectorAll('.evidence-text, .evidence-file').forEach(field => {
        field.addEventListener(field.classList.contains('evidence-text') ? 'input' : 'change', updateUI);
    });

    completeMissionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const missionId = btn.getAttribute('data-mission');
            const pointsToAdd = parseInt(btn.getAttribute('data-points'), 10);

            // Validar Misión 1
            if (missionId === '1' && !fruitSelected) {
                alert('¡Por favor selecciona una fruta antes de completar la misión!');
                return;
            }

            if (Number(missionId) >= 3) {
                const missionCard = document.getElementById(`mission-${missionId}`);
                const evidenceText = missionCard.querySelector('.evidence-text').value.trim();
                const evidenceFile = missionCard.querySelector('.evidence-file').files.length > 0;
                if (!evidenceText && !evidenceFile) {
                    alert('Escribe una explicación o sube una foto como prueba antes de completar la misión.');
                    return;
                }
                state.missionEvidence[missionId] = {
                    text: evidenceText,
                    fileName: evidenceFile ? missionCard.querySelector('.evidence-file').files[0].name : ''
                };
                localStorage.setItem('nutri-mission-evidence', JSON.stringify(state.missionEvidence));
            }

            if (!state.completedMissions.includes(missionId)) {
                state.completedMissions.push(missionId);
                addPoints(pointsToAdd);

                // Deshabilitar botón completado
                btn.textContent = 'Completado ✓';
                btn.classList.add('completed');
                btn.disabled = true;
                showToast(`Misión completada: +${pointsToAdd} puntos`);
                if (state.completedMissions.length === TOTAL_MISSIONS) {
                    showMissionsComplete();
                }
            }
        });
    });


    /* ==========================================
       5. MINIJUEGO: ARMA EL PLATO SALUDABLE
       ========================================== */
    const foodButtons = document.querySelectorAll('.food-btn');
    const slots = document.querySelectorAll('.slot');
    const btnCheckPlate = document.getElementById('btn-check-plate');
    const btnResetPlate = document.getElementById('btn-reset-plate');

    foodButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const foodName = btn.getAttribute('data-name');
            const isHealthy = btn.getAttribute('data-healthy') === 'true';

            if (btn.classList.contains('selected')) {
                // Deseleccionar
                btn.classList.remove('selected');
                state.plateItems = state.plateItems.filter(item => item.name !== foodName);
            } else {
                // Seleccionar (hasta un máximo de 4 items)
                if (state.plateItems.length < 4) {
                    btn.classList.add('selected');
                    state.plateItems.push({ name: foodName, healthy: isHealthy });
                } else {
                    alert('¡Tu plato ya tiene 4 alimentos! Presiona "¡Listo!" o reinicia.');
                }
            }
            renderPlate();
        });
    });

    function renderPlate() {
        slots.forEach((slot, index) => {
            if (state.plateItems[index]) {
                slot.textContent = state.plateItems[index].name;
                slot.classList.add('filled');
            } else {
                const defaultTexts = ['Fruta/Verdura', 'Proteína', 'Acompañamiento', 'Vegetales'];
                slot.textContent = defaultTexts[index];
                slot.classList.remove('filled');
            }
        });
    }

    btnCheckPlate.addEventListener('click', () => {
        if (state.plateItems.length < 3) {
            alert('¡Agrega más alimentos a tu plato para que sea una comida completa!');
            return;
        }

        const hasUnhealthy = state.plateItems.some(item => !item.healthy);

        if (hasUnhealthy) {
            alert('⚠️ ¡Cuidado! Has incluido alimentos poco saludables en tu plato. Intenta cambiarlos por opciones nutritivas.');
        } else {
            alert('🎉 ¡Excelente trabajo! Has creado un plato súper saludable y balanceado.');
            addPoints(5);
            resetPlate();
        }
    });

    btnResetPlate.addEventListener('click', resetPlate);

    function resetPlate() {
        state.plateItems = [];
        foodButtons.forEach(btn => btn.classList.remove('selected'));
        renderPlate();
    }

    /* Juegos extra: semáforo, memoria y trivia */
    const trafficFoods = [
        { emoji: '🥕', name: 'Zanahoria', answer: 'green' }, { emoji: '🍭', name: 'Caramelo', answer: 'red' },
        { emoji: '🍞', name: 'Pan integral', answer: 'yellow' }, { emoji: '🍎', name: 'Manzana', answer: 'green' },
        { emoji: '🍟', name: 'Papas fritas', answer: 'red' }, { emoji: '🥛', name: 'Leche', answer: 'yellow' }
    ];
    let trafficIndex = 0;
    let trafficScore = 0;
    const trafficButtons = document.querySelectorAll('.traffic-btn');
    trafficButtons.forEach(button => button.addEventListener('click', () => {
        const item = trafficFoods[trafficIndex];
        const feedback = document.getElementById('traffic-feedback');
        if (button.dataset.traffic === item.answer) {
            trafficScore++;
            feedback.textContent = '¡Correcto! Muy buena elección.';
            feedback.className = 'game-feedback success';
        } else {
            feedback.textContent = `Casi. ${item.name} va en otra categoría.`;
            feedback.className = 'game-feedback error';
        }
        trafficIndex++;
        if (trafficIndex >= trafficFoods.length) {
            showToast(`Semáforo terminado: ${trafficScore}/${trafficFoods.length} correctas`);
            trafficIndex = 0; trafficScore = 0;
        }
        window.setTimeout(renderTraffic, 650);
    }));

    function renderTraffic() {
        const item = trafficFoods[trafficIndex];
        document.getElementById('traffic-food').textContent = item.emoji;
        document.getElementById('traffic-name').textContent = item.name;
        document.getElementById('traffic-counter').textContent = `Alimento ${trafficIndex + 1} de ${trafficFoods.length}`;
        document.getElementById('traffic-feedback').textContent = '';
    }

    const memoryIcons = ['🍎', '🥦', '💧', '🥕'];
    let memoryState = { first: null, lock: false, moves: 0, pairs: 0 };
    function setupMemory() {
        const board = document.getElementById('memory-board');
        if (!board) return;
        memoryState = { first: null, lock: false, moves: 0, pairs: 0 };
        const cards = [...memoryIcons, ...memoryIcons].sort(() => Math.random() - 0.5);
        board.innerHTML = cards.map((icon, index) => `<button class="memory-card" data-icon="${icon}" data-index="${index}"><span>?</span><b>${icon}</b></button>`).join('');
        board.querySelectorAll('.memory-card').forEach(card => card.addEventListener('click', () => flipMemory(card)));
        updateMemoryText();
    }
    function flipMemory(card) {
        if (memoryState.lock || card.classList.contains('matched') || card === memoryState.first) return;
        card.classList.add('revealed');
        if (!memoryState.first) { memoryState.first = card; return; }
        memoryState.moves++;
        if (memoryState.first.dataset.icon === card.dataset.icon) { card.classList.add('matched'); memoryState.first.classList.add('matched'); memoryState.pairs++; memoryState.first = null; updateMemoryText(); if (memoryState.pairs === memoryIcons.length) { addPoints(4); unlockBadge(5); showToast('¡Memoria completada! +4 puntos', '🧠'); } return; }
        memoryState.lock = true;
        window.setTimeout(() => { card.classList.remove('revealed'); memoryState.first.classList.remove('revealed'); memoryState.first = null; memoryState.lock = false; updateMemoryText(); }, 700);
        updateMemoryText();
    }
    function updateMemoryText() { document.getElementById('memory-moves').textContent = `Movimientos: ${memoryState.moves}`; document.getElementById('memory-pairs').textContent = `Parejas: ${memoryState.pairs}/4`; }
    document.getElementById('btn-reset-memory')?.addEventListener('click', setupMemory);
    setupMemory();

    const quizQuestions = [{ question: '¿Cuál de estos alimentos nos ayuda a hidratarnos?', options: ['Agua', 'Caramelo', 'Galleta'], answer: 'Agua' }, { question: '¿Qué grupo debe ocupar buena parte de nuestro plato?', options: ['Frutas y verduras', 'Dulces', 'Refrescos'], answer: 'Frutas y verduras' }, { question: '¿Qué hábito ayuda a tener energía?', options: ['Dormir y comer variado', 'Saltar comidas', 'No beber agua'], answer: 'Dormir y comer variado' }, { question: '¿Cuántos vasos de agua propone nuestra misión?', options: ['2', '4', '10'], answer: '4' }];
    let quizIndex = 0;
    function renderQuiz() { const quizNumber = document.getElementById('quiz-number'); const quizQuestion = document.getElementById('quiz-question'); const quizFeedback = document.getElementById('quiz-feedback'); const nextQuiz = document.getElementById('btn-next-quiz'); const quizOptions = document.getElementById('quiz-options'); if (!quizNumber || !quizQuestion || !quizFeedback || !nextQuiz || !quizOptions) return; const q = quizQuestions[quizIndex]; quizNumber.textContent = `PREGUNTA ${quizIndex + 1} DE ${quizQuestions.length}`; quizQuestion.textContent = q.question; quizFeedback.textContent = ''; nextQuiz.hidden = true; quizOptions.innerHTML = q.options.map(option => `<button class="quiz-option" data-answer="${option}">${option}</button>`).join(''); document.querySelectorAll('.quiz-option').forEach(option => option.addEventListener('click', answerQuiz)); }
    function answerQuiz(event) { const q = quizQuestions[quizIndex]; const feedback = document.getElementById('quiz-feedback'); document.querySelectorAll('.quiz-option').forEach(option => option.disabled = true); if (event.currentTarget.dataset.answer === q.answer) { event.currentTarget.classList.add('correct'); feedback.textContent = '¡Respuesta correcta!'; feedback.className = 'game-feedback success'; } else { event.currentTarget.classList.add('wrong'); feedback.textContent = `La respuesta era: ${q.answer}`; feedback.className = 'game-feedback error'; } document.getElementById('btn-next-quiz').hidden = false; }
    document.getElementById('btn-next-quiz')?.addEventListener('click', () => { quizIndex++; if (quizIndex >= quizQuestions.length) { quizIndex = 0; addPoints(5); unlockBadge(6); showToast('¡Trivia completada! +5 puntos', '💡'); } renderQuiz(); });
    renderQuiz();

    document.querySelectorAll('.game-tab').forEach(tab => tab.addEventListener('click', () => {
        document.querySelectorAll('.game-tab').forEach(item => {
            const isActive = item === tab;
            item.classList.toggle('active', isActive);
            item.setAttribute('aria-selected', String(isActive));
        });
        document.querySelectorAll('.game-panel').forEach(panel => panel.classList.toggle('active', panel.id === tab.dataset.game));
    }));

    const characterGameTabs = { Manzanita: 'tab-memory', 'Brócolín': 'tab-traffic', Gotita: 'tab-quiz', Zanahorín: 'tab-plate' };
    document.querySelectorAll('[data-character-game]').forEach(button => button.addEventListener('click', () => {
        openSection('sec-juegos');
        document.getElementById(characterGameTabs[button.dataset.characterGame])?.click();
    }));

    const mazeGrid = document.getElementById('maze-grid');
    const mazePanel = document.getElementById('game-maze');
    const mazeMovesDisplay = document.getElementById('maze-moves');
    const mazeFruitDisplay = document.getElementById('maze-fruits');
    const mazeFeedback = document.getElementById('maze-feedback');
    const mazeDirections = {
        up: [-1, 0],
        down: [1, 0],
        left: [0, -1],
        right: [0, 1]
    };
    const MAZE_FRUIT_TOTAL = 3;
    const mazeRewardKey = 'nutri-maze-completed-v2';
    let mazeCellCount = 9;
    let mazeLayout = [];
    let mazePosition = { row: 1, column: 1 };
    let mazeMoves = 0;
    let mazeFruitCount = 0;
    let mazeWon = false;
    let mazeCompleted = localStorage.getItem(mazeRewardKey) === 'true';

    function createMaze(cellCount) {
        const dimension = cellCount * 2 + 1;
        const layout = Array.from({ length: dimension }, () => Array(dimension).fill('#'));
        const visited = new Set(['0,0']);
        const stack = [{ row: 0, column: 0 }];
        layout[1][1] = 'S';

        while (stack.length) {
            const current = stack[stack.length - 1];
            const options = Object.values(mazeDirections).map(([rowChange, columnChange]) => ({
                row: current.row + rowChange,
                column: current.column + columnChange,
                rowChange,
                columnChange
            })).filter(next => next.row >= 0 && next.column >= 0 && next.row < cellCount && next.column < cellCount && !visited.has(`${next.row},${next.column}`));

            if (!options.length) {
                stack.pop();
                continue;
            }

            const next = options[Math.floor(Math.random() * options.length)];
            layout[current.row * 2 + 1 + next.rowChange][current.column * 2 + 1 + next.columnChange] = '.';
            layout[next.row * 2 + 1][next.column * 2 + 1] = '.';
            visited.add(`${next.row},${next.column}`);
            stack.push(next);
        }

        const start = { row: 1, column: 1 };
        const logicalDistances = new Map([['0,0', 0]]);
        const logicalQueue = [{ row: 0, column: 0 }];
        for (let index = 0; index < logicalQueue.length; index++) {
            const current = logicalQueue[index];
            const distance = logicalDistances.get(`${current.row},${current.column}`);
            for (const [rowChange, columnChange] of Object.values(mazeDirections)) {
                const row = current.row + rowChange;
                const column = current.column + columnChange;
                const key = `${row},${column}`;
                const bridgeRow = current.row * 2 + 1 + rowChange;
                const bridgeColumn = current.column * 2 + 1 + columnChange;
                if (row < 0 || column < 0 || row >= cellCount || column >= cellCount || layout[bridgeRow][bridgeColumn] === '#' || logicalDistances.has(key)) continue;
                logicalDistances.set(key, distance + 1);
                logicalQueue.push({ row, column });
            }
        }

        let exitRoom = null;
        let exitDistance = -1;
        for (let row = 0; row < cellCount; row++) {
            for (let column = 0; column < cellCount; column++) {
                const degree = Object.values(mazeDirections).filter(([rowChange, columnChange]) => {
                    const nextRow = row + rowChange;
                    const nextColumn = column + columnChange;
                    if (nextRow < 0 || nextColumn < 0 || nextRow >= cellCount || nextColumn >= cellCount) return false;
                    return layout[row * 2 + 1 + rowChange][column * 2 + 1 + columnChange] !== '#';
                }).length;
                const distance = logicalDistances.get(`${row},${column}`) ?? -1;
                if ((row !== 0 || column !== 0) && degree === 1 && distance > exitDistance) {
                    exitRoom = { row, column };
                    exitDistance = distance;
                }
            }
        }

        const goal = { row: exitRoom.row * 2 + 1, column: exitRoom.column * 2 + 1 };
        const startKey = `${start.row},${start.column}`;
        const goalKey = `${goal.row},${goal.column}`;
        layout[goal.row][goal.column] = 'E';

        const previous = new Map([[startKey, null]]);
        const queue = [start];
        for (let index = 0; index < queue.length && !previous.has(goalKey); index++) {
            const current = queue[index];
            for (const [rowChange, columnChange] of Object.values(mazeDirections)) {
                const row = current.row + rowChange;
                const column = current.column + columnChange;
                const key = `${row},${column}`;
                if (!layout[row]?.[column] || layout[row][column] === '#' || previous.has(key)) continue;
                previous.set(key, `${current.row},${current.column}`);
                queue.push({ row, column });
            }
        }

        const route = [];
        let cursor = goalKey;
        while (cursor && cursor !== startKey) {
            const [row, column] = cursor.split(',').map(Number);
            route.unshift({ row, column });
            cursor = previous.get(cursor);
        }
        const mainRoute = new Set(route.map(cell => `${cell.row},${cell.column}`));
        const branches = [];
        for (let row = 1; row < dimension - 1; row += 2) {
            for (let column = 1; column < dimension - 1; column += 2) {
                const key = `${row},${column}`;
                if (layout[row][column] === '.' && !mainRoute.has(key)) branches.push({ row, column });
            }
        }
        branches.sort(() => Math.random() - 0.5);
        const fruitCells = branches.length >= MAZE_FRUIT_TOTAL
            ? branches.slice(0, MAZE_FRUIT_TOTAL)
            : [0.2, 0.5, 0.8].map(fraction => route[Math.min(route.length - 2, Math.floor(route.length * fraction))]).filter(Boolean);
        fruitCells.forEach(fruit => { layout[fruit.row][fruit.column] = 'F'; });
        return layout;
    }

    function renderMaze() {
        mazeGrid.style.setProperty('--maze-columns', mazeLayout.length);
        mazeGrid.innerHTML = mazeLayout.map((row, rowIndex) => [...row].map((cell, columnIndex) => {
            const isPlayer = mazePosition.row === rowIndex && mazePosition.column === columnIndex;
            const tileName = cell === '#' ? 'pared' : cell === 'E' ? 'meta' : cell === 'S' ? 'inicio' : cell === 'F' ? 'fruta' : 'camino';
            const tileContent = isPlayer ? getAvatar(state.avatar.gender, state.avatar.skin) : cell === 'E' ? '★' : cell === 'F' ? '🍎' : cell === 'S' ? '⚑' : '';
            return `<span class="maze-cell ${cell === '#' ? 'wall' : 'path'} ${cell === 'E' ? 'exit' : ''} ${cell === 'F' ? 'fruit' : ''} ${isPlayer ? 'player' : ''}" role="gridcell" data-row="${rowIndex}" data-column="${columnIndex}" data-cell="${cell}" aria-label="${isPlayer ? 'Explorador' : tileName}">${tileContent}</span>`;
        }).join('')).join('');
        mazeMovesDisplay.textContent = mazeMoves;
        mazeFruitDisplay.textContent = `${mazeFruitCount} / ${MAZE_FRUIT_TOTAL}`;
    }

    function moveMaze(direction) {
        if (mazeWon) return;
        const [rowChange, columnChange] = mazeDirections[direction];
        const nextRow = mazePosition.row + rowChange;
        const nextColumn = mazePosition.column + columnChange;
        const nextCell = mazeLayout[nextRow]?.[nextColumn];
        if (!nextCell || nextCell === '#') {
            mazeFeedback.textContent = '¡Hay una pared! Prueba otra dirección.';
            mazeFeedback.classList.remove('success');
            return;
        }
        if (nextCell === 'E' && mazeFruitCount < MAZE_FRUIT_TOTAL) {
            mazeFeedback.textContent = `Te faltan ${MAZE_FRUIT_TOTAL - mazeFruitCount} frutas para abrir la salida.`;
            mazeFeedback.classList.remove('success');
            return;
        }

        mazePosition = { row: nextRow, column: nextColumn };
        mazeMoves++;
        if (nextCell === 'F') {
            mazeFruitCount++;
            mazeLayout[nextRow][nextColumn] = '.';
        }
        renderMaze();
        if (nextCell === 'E') {
            mazeWon = true;
            mazeFeedback.classList.add('success');
            if (mazeCompleted) {
                mazeFeedback.textContent = '¡Desafío completado! Ya ganaste los puntos de este laberinto.';
            } else {
                mazeCompleted = true;
                localStorage.setItem(mazeRewardKey, 'true');
                mazeFeedback.textContent = '¡Desafío completado! Ganaste 5 puntos.';
                addPoints(5);
                showToast('¡Laberinto completado! +5 puntos', '🗺️');
            }
            return;
        }
        mazeFeedback.textContent = nextCell === 'F' ? `¡Fruta recogida! ${mazeFruitCount} de ${MAZE_FRUIT_TOTAL}.` : '¡Buen camino! Sigue avanzando.';
        mazeFeedback.classList.remove('success');
    }

    function resetMaze() {
        mazeLayout = createMaze(mazeCellCount);
        mazePosition = { row: 1, column: 1 };
        mazeMoves = 0;
        mazeFruitCount = 0;
        mazeWon = false;
        mazeFeedback.textContent = 'Recoge las frutas y encuentra la salida.';
        mazeFeedback.classList.remove('success');
        renderMaze();
    }

    document.querySelectorAll('[data-maze-move]').forEach(button => button.addEventListener('click', () => moveMaze(button.dataset.mazeMove)));
    document.getElementById('btn-reset-maze').addEventListener('click', resetMaze);
    document.querySelectorAll('[data-maze-size]').forEach(button => button.addEventListener('click', () => {
        mazeCellCount = Number(button.dataset.mazeSize);
        document.querySelectorAll('[data-maze-size]').forEach(level => {
            const isSelected = level === button;
            level.classList.toggle('selected', isSelected);
            level.setAttribute('aria-pressed', String(isSelected));
        });
        resetMaze();
    }));
    document.addEventListener('keydown', event => {
        if (!document.getElementById('sec-juegos').classList.contains('active') || !mazePanel.classList.contains('active')) return;
        const keyDirections = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
        const direction = keyDirections[event.key] || keyDirections[event.key.toLowerCase()];
        if (direction) {
            event.preventDefault();
            moveMaze(direction);
        }
    });
    resetMaze();

    /* Pregunta diaria: cambia automáticamente según la fecha local */
    const dailyQuestions = [
        { category: 'HIDRATACIÓN', illustration: '💧', question: '¿Qué bebida es la mejor opción para hidratar nuestro cuerpo?', options: ['Agua', 'Refresco con azúcar', 'Bebida energética'], answer: 'Agua', explanation: 'El agua ayuda a nuestro cuerpo a funcionar y no tiene azúcar añadida.' },
        { category: 'FRUTAS', illustration: '🍎', question: '¿Qué nos aportan principalmente las frutas?', options: ['Vitaminas y fibra', 'Solo azúcar', 'Muchísima sal'], answer: 'Vitaminas y fibra', explanation: 'Las frutas aportan vitaminas, minerales, agua y fibra para crecer fuertes.' },
        { category: 'VERDURAS', illustration: '🥦', question: '¿Cuál es una buena forma de comer verduras?', options: ['Variar sus colores', 'Comer siempre la misma', 'No lavarlas'], answer: 'Variar sus colores', explanation: 'Los distintos colores suelen aportar diferentes nutrientes.' },
        { category: 'ENERGÍA', illustration: '⚡', question: '¿Qué hábito nos ayuda a tener energía durante el día?', options: ['Comer variado', 'Saltar todas las comidas', 'Dormir muy poco'], answer: 'Comer variado', explanation: 'Una alimentación variada aporta energía y nutrientes que el cuerpo necesita.' },
        { category: 'PLATO SALUDABLE', illustration: '🍽️', question: '¿Qué debería acompañar a una comida equilibrada?', options: ['Verduras, proteína y cereales', 'Solo dulces', 'Solo papas fritas'], answer: 'Verduras, proteína y cereales', explanation: 'Combinar diferentes grupos de alimentos hace que la comida sea más completa.' },
        { category: 'HIGIENE', illustration: '🧼', question: '¿Qué debemos hacer antes de comer?', options: ['Lavarnos las manos', 'Correr sin parar', 'Guardar los alimentos sucios'], answer: 'Lavarnos las manos', explanation: 'Lavarnos las manos ayuda a quitar microbios y a cuidar nuestra salud.' },
        { category: 'DESAYUNO', illustration: '🥣', question: '¿Cuál es una buena idea para el desayuno?', options: ['Fruta, cereal y leche o yogur', 'Solo caramelos', 'Nada de agua'], answer: 'Fruta, cereal y leche o yogur', explanation: 'Un desayuno variado nos ayuda a comenzar el día con energía.' },
        { category: 'MOVIMIENTO', illustration: '🏃', question: '¿Qué actividad ayuda a cuidar nuestro cuerpo?', options: ['Jugar y movernos', 'Pasar todo el día sentados', 'No descansar nunca'], answer: 'Jugar y movernos', explanation: 'Mover el cuerpo jugando, caminando o bailando es divertido y saludable.' },
        { category: 'COLACIONES', illustration: '🍌', question: '¿Cuál es una colación nutritiva?', options: ['Una fruta', 'Solo golosinas', 'Un refresco grande'], answer: 'Una fruta', explanation: 'Una fruta es una opción práctica que aporta agua, vitaminas y fibra.' },
        { category: 'EQUILIBRIO', illustration: '⚖️', question: '¿Qué significa comer de manera equilibrada?', options: ['Variar y disfrutar con moderación', 'Prohibir todos los alimentos', 'Comer solo un alimento'], answer: 'Variar y disfrutar con moderación', explanation: 'El equilibrio consiste en elegir variedad y disfrutar cada alimento con moderación.' }
    ];
    const dailyDate = new Date();
    const dailyKey = `${dailyDate.getFullYear()}-${dailyDate.getMonth() + 1}-${dailyDate.getDate()}`;
    const dayNumber = Math.floor((Date.UTC(dailyDate.getFullYear(), dailyDate.getMonth(), dailyDate.getDate()) - Date.UTC(dailyDate.getFullYear(), 0, 0)) / 86400000);
    const dailyQuestionIndex = dayNumber % dailyQuestions.length;
    let currentDailyQuestion = dailyQuestions[dailyQuestionIndex];
    let isPracticeQuestion = false;
    let practiceOffset = 0;
    const dailyAnswerKey = `nutri-daily-answer-${dailyKey}`;

    function renderDailyQuestion(question) {
        currentDailyQuestion = question;
        document.getElementById('daily-category').textContent = question.category;
        document.getElementById('daily-illustration').textContent = question.illustration;
        document.getElementById('daily-question').textContent = question.question;
        document.getElementById('daily-feedback').textContent = '';
        document.getElementById('daily-feedback').className = 'daily-feedback';
        document.getElementById('daily-options').innerHTML = question.options.map(option => `<button class="daily-option" type="button" data-answer="${option}">${option}</button>`).join('');
        document.querySelectorAll('.daily-option').forEach(option => option.addEventListener('click', answerDailyQuestion));
        const answeredToday = localStorage.getItem(dailyAnswerKey);
        if (!isPracticeQuestion && answeredToday) showDailyResult(answeredToday === question.answer, true);
    }

    function answerDailyQuestion(event) {
        const selectedAnswer = event.currentTarget.dataset.answer;
        const isCorrect = selectedAnswer === currentDailyQuestion.answer;
        document.querySelectorAll('.daily-option').forEach(option => {
            option.disabled = true;
            if (option.dataset.answer === currentDailyQuestion.answer) option.classList.add('correct');
        });
        if (!isPracticeQuestion && !localStorage.getItem(dailyAnswerKey)) {
            localStorage.setItem(dailyAnswerKey, selectedAnswer);
            if (isCorrect) {
                addPoints(3);
                showToast('¡Respuesta correcta! +3 puntos', '💡');
            }
        }
        showDailyResult(isCorrect, false);
    }

    function showDailyResult(isCorrect, alreadyAnswered) {
        const feedback = document.getElementById('daily-feedback');
        feedback.className = `daily-feedback ${isCorrect ? 'success' : 'try-again'}`;
        feedback.innerHTML = `${isCorrect ? '🎉 ¡Muy bien!' : '💪 ¡Buen intento!'} ${alreadyAnswered ? 'Ya respondiste esta pregunta hoy. ' : ''}${currentDailyQuestion.explanation}`;
        document.querySelectorAll('.daily-option').forEach(option => {
            option.disabled = true;
            if (option.dataset.answer === currentDailyQuestion.answer) option.classList.add('correct');
        });
    }

    document.getElementById('daily-new-question')?.addEventListener('click', () => {
        isPracticeQuestion = true;
        practiceOffset = (practiceOffset + 1) % dailyQuestions.length;
        const practiceIndex = (dailyQuestionIndex + practiceOffset) % dailyQuestions.length;
        renderDailyQuestion(dailyQuestions[practiceIndex]);
        document.getElementById('daily-new-question').textContent = 'Cambiar pregunta';
    });
    document.getElementById('daily-date-number').textContent = dailyDate.getDate();
    renderDailyQuestion(currentDailyQuestion);

    checkBadges();
    updateUI();
});