const API_KEY = 'live_tGEERVo0BxrhiUJcdXPzhVIqkCKix2cO343AkF7zApIqwu6mc6SkxUcrFachGUbf';
let question = 0, score = 0, locked = false;

// emoji podle skóre
function getScoreEmoji(score) {
    if (score === 5) return '🏆';
    if (score >= 3) return '👏';
    return '😞';
}

// výsledky
function manageScoreHistory(newScore) {
    // načtení skóre z localstorage 
    let scores = JSON.parse(localStorage.getItem('dogQuizScores') || '[]');
    
    // přidání nového výsledku s aktuálním datem, časem a emoji
    scores.push({
        score: newScore,
        emoji: getScoreEmoji(newScore),
        date: new Date().toLocaleDateString('cs-CZ'),
        time: new Date().toLocaleTimeString('cs-CZ')
    });
    
    // posledních 5 výsledků
    if (scores.length > 5) {
        scores = scores.slice(-5);
    }
    
    // uložení aktualizované historie zpět do localstorage
    localStorage.setItem('dogQuizScores', JSON.stringify(scores));
    
    return scores;
}

// vytvoření html historie výsledků
function getScoreHistoryHTML(scores) {
    if (scores.length === 0) return '';
    
    return `
        <div class="history">
            <h2>Historie posledních výsledků:</h2>
            <ul>
                ${scores.slice().reverse().map(item => `
                    <li>${item.score}/5 ${item.emoji} (${item.date} ${item.time})</li>
                `).join('')}
            </ul>
        </div>
    `;
}

async function loadQuestion() {
    if (question >= 5) {
        showResult();
        return;
    }
    
    try {
        const resp = await fetch('https://api.thedogapi.com/v1/breeds', {
            headers: {'x-api-key': API_KEY}
        });
        const dogs = await resp.json();
        const correct = dogs[Math.floor(Math.random() * dogs.length)];
        const answers = [correct.name];
        
        while (answers.length < 4) {
            const name = dogs[Math.floor(Math.random() * dogs.length)].name;
            if (!answers.includes(name)) answers.push(name);
        }

        document.querySelector('#content').innerHTML = `
            <img src="https://cdn2.thedogapi.com/images/${correct.reference_image_id}.jpg" alt="Pes">
            <p >Jaké je to plemeno?</p>
        `;

        document.querySelector('#options').innerHTML = answers
            .sort(() => Math.random() - 0.5)
            .map(answer => `
                <button onclick="guess('${answer}', '${correct.name}', this)">
                    ${answer}
                </button>
            `).join('');
    } 
    catch {
        document.querySelector('#content').innerHTML = 'Chyba načítání...';
    }
    
    document.querySelector('#question').textContent = `Otázka ${question + 1}/5`;
    document.querySelector('#score').textContent = `✅ ${score}/5`;
    document.querySelector('.progress-fill').style.width = `${(question + 1) * 20}%`;
}

function guess(picked, correct, btn) {
    if (locked) return;
    locked = true;

    document.querySelectorAll('button').forEach(b => {
        b.disabled = true;
        if (b.textContent.trim() === correct) b.classList.add('correct');
    });

    if (picked === correct) {
        score++;
        btn.classList.add('correct');
    } else {
        btn.classList.add('wrong');
    }

    setTimeout(() => {
        question++;
        locked = false;
        loadQuestion();
    }, 1500);
}

function showResult() {
    // uložení výsledku do historie
    const scoreHistory = manageScoreHistory(score);
    const emoji = getScoreEmoji(score);
    
    document.querySelector('#quiz').innerHTML = `
        <h1> 🎉 Konec kvízu! 🎉</h1>
        <div class="result">
            Skóre: ${score}/5 ${emoji}
        </div>
        ${getScoreHistoryHTML(scoreHistory)}
        <button onclick="location.reload()">Hrát znovu</button>
    `;
}

loadQuestion();