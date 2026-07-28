(() => {
    const STOP_WORDS = new Set(['a', 'ai', 'al', 'ale', 'am', 'ar', 'are', 'as', 'asta', 'ca', 'care', 'ce', 'cea', 'cel', 'cu', 'cum', 'de', 'din', 'doar', 'este', 'eu', 'fi', 'in', 'la', 'mai', 'ma', 'mi', 'o', 'pe', 'pentru', 'pot', 'sa', 'se', 'si', 'sunt', 'un', 'una', 'unde', 'vreau']);
    const SYNONYMS = {
        pontare: 'pontaj', pontat: 'pontaj', tura: 'pontaj', ture: 'pontaj', serviciu: 'pontaj',
        absenta: 'invoire', concediu: 'invoire', cerere: 'invoire', indisponibil: 'invoire',
        reteta: 'craft', fabricare: 'craft', confectionare: 'craft', roata: 'roti', anvelopa: 'roti',
        piata: 'marketplace', anunturi: 'anunt', vanzari: 'vanzare',
        harta: 'locatii', locatie: 'locatii', ilegal: 'ilegal',
        sef: 'manager', coordonator: 'manager', administrare: 'admin',
        jurnal: 'loguri', activitate: 'loguri', istoric: 'rapoarte'
    };

    const state = {
        role: typeof getRole === 'function' ? getRole() : 1,
        entries: [],
        lastMatch: null,
        ready: false
    };

    function normalize(value) {
        return String(value || '')
            .toLocaleLowerCase('ro-RO')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function tokens(value) {
        return normalize(value).split(' ').filter((word) => word.length > 1 && !STOP_WORDS.has(word)).map((word) => SYNONYMS[word] || word);
    }

    function bigrams(value) {
        const text = normalize(value).replace(/\s/g, '');
        const result = [];
        for (let index = 0; index < text.length - 1; index += 1) result.push(text.slice(index, index + 2));
        return result;
    }

    function similarity(left, right) {
        if (left === right) return 1;
        if (!left || !right) return 0;
        const first = bigrams(left);
        const second = bigrams(right);
        if (!first.length || !second.length) return 0;
        const pool = [...second];
        let matches = 0;
        first.forEach((pair) => {
            const index = pool.indexOf(pair);
            if (index >= 0) {
                matches += 1;
                pool.splice(index, 1);
            }
        });
        return (2 * matches) / (first.length + second.length);
    }

    function searchableText(entry) {
        return normalize([entry.title, entry.category, ...(entry.keywords || []), entry.answer].join(' '));
    }

    function scoreEntry(entry, question) {
        const query = normalize(question);
        const queryTokens = tokens(question);
        const source = searchableText(entry);
        const title = normalize(entry.title);
        let score = 0;

        if (title === query) score += 120;
        if (query.length > 3 && source.includes(query)) score += 65;
        if (query.length > 3 && title.includes(query)) score += 35;

        const sourceWords = source.split(' ');
        queryTokens.forEach((token) => {
            if (sourceWords.includes(token)) score += 12;
            else if (sourceWords.some((word) => word.startsWith(token) || token.startsWith(word))) score += 7;
            else {
                const best = sourceWords.reduce((maximum, word) => Math.max(maximum, similarity(token, word)), 0);
                if (best >= 0.72) score += 4;
            }
        });

        const keywordMatches = (entry.keywords || []).filter((keyword) => {
            const clean = normalize(keyword);
            return query.includes(clean) || clean.includes(query);
        }).length;
        score += keywordMatches * 18;
        return score;
    }

    function addEntry(entry) {
        if (!entry?.title || !entry?.answer || Number(entry.role || 1) > state.role) return;
        const signature = `${normalize(entry.title)}|${entry.page || ''}`;
        if (state.entries.some((item) => item.signature === signature)) return;
        state.entries.push({ ...entry, signature, role: Number(entry.role || 1) });
    }

    async function indexLocalPages() {
        const pages = (window.PANEL_ASSISTANT_PAGES || []).filter((page) => page.role <= state.role);
        await Promise.all(pages.map(async (page) => {
            try {
                const response = await fetch(page.file, { cache: 'no-store' });
                if (!response.ok) return;
                const markup = await response.text();
                const documentCopy = new DOMParser().parseFromString(markup, 'text/html');

                documentCopy.querySelectorAll('[data-title]').forEach((element) => {
                    const title = (element.dataset.title || '').trim();
                    const description = (element.dataset.desc || '').trim();
                    if (title.length < 2) return;
                    addEntry({
                        title,
                        category: page.label,
                        role: page.role,
                        page: page.file === 'craftmecanics.html' ? `${page.file}?search=${encodeURIComponent(title)}` : page.file,
                        keywords: [title, description, page.label],
                        answer: description ? `${title}: ${description}` : `${title} este disponibil în pagina ${page.label}.`
                    });
                });

                const seenSections = new Set();
                documentCopy.querySelectorAll('main h1, main h2, main h3, main h4, body > header h1, body > header h2').forEach((element) => {
                    const title = String(element.textContent || '').replace(/\s+/g, ' ').trim();
                    const clean = normalize(title);
                    if (title.length < 3 || title.length > 100 || clean === 'panel' || seenSections.has(clean)) return;
                    seenSections.add(clean);
                    addEntry({
                        title,
                        category: page.label,
                        role: page.role,
                        page: page.file,
                        keywords: [title, page.label],
                        answer: `În pagina ${page.label} găsești secțiunea „${title}”.`
                    });
                });

                documentCopy.querySelectorAll('option').forEach((option) => {
                    const title = String(option.textContent || '').replace(/\s+/g, ' ').trim();
                    if (title.length < 3 || title.length > 70 || /^--/.test(title)) return;
                    addEntry({
                        title,
                        category: page.label,
                        role: page.role,
                        page: page.file,
                        keywords: [title, page.label],
                        answer: `Opțiunea „${title}” este disponibilă în pagina ${page.label}.`
                    });
                });
            } catch (error) {
                console.warn(`Asistent: pagina ${page.file} nu a putut fi indexată local.`, error);
            }
        }));
    }

    function roleName() {
        const user = typeof getUser === 'function' ? getUser() : null;
        return user?.role || user?.default_role || 'Mecanic';
    }

    function specialResponse(question) {
        const query = normalize(question);
        const restrictedTopics = [
            {
                role: 5,
                pattern: /\b(panou admin|admin|schimb rol|modific rol|rol utilizator|utilizator din panou|schimb ora|configurez ora|oprire toate turele|opresc toate turele|sterge utilizator|loguri|jurnal activitate)\b/
            },
            {
                role: 4,
                pattern: /\b(rapoarte|mecanici activi|cine este pontaj|cine e pontaj|opresc tura cuiva|opresc tura altuia|editez pontaj|modific pontajul altuia|sterg pontaj|contracte|generez contract)\b/
            },
            {
                role: 3,
                pattern: /\b(calculator ilegal|locatii ilegale|black market|piata neagra|cocaina|marijuana|jointuri|acetona|cayo)\b/
            }
        ];
        const blockedTopic = restrictedTopics.find((topic) => state.role < topic.role && topic.pattern.test(query));
        if (blockedTopic) {
            return { answer: 'Nu ai permisiunea necesară pentru această secțiune. Asistentul îți poate arăta doar informațiile disponibile rolului tău.' };
        }
        if (/^(salut|buna|buna ziua|buna seara|neata|hey|hello)\b/.test(query)) {
            return { answer: `Salut! Sunt asistentul intern al panelului. Ai acces de tip „${roleName()}”. Cu ce informație din proiect te pot ajuta?` };
        }
        if (/\b(multumesc|mersi|ms|super|perfect)\b/.test(query)) {
            return { answer: 'Cu plăcere! Poți continua cu orice întrebare despre paginile și funcțiile panelului.' };
        }
        if (/\b(ce rol|rolul meu|ce functie|functia mea)\b/.test(query)) {
            return { answer: `Rolul disponibil în sesiunea ta este „${roleName()}”, cu nivel de acces ${state.role}. Rezultatele asistentului sunt filtrate după acest nivel.` };
        }
        if (/^(cat e ceasul|cat este ceasul|cat e ora|ce ora este|ce ora e|ora acum)$/.test(query)) {
            return { answer: `Ora României este ${new Intl.DateTimeFormat('ro-RO', { timeZone: 'Europe/Bucharest', hour: '2-digit', minute: '2-digit' }).format(new Date())}.` };
        }
        if (/^(unde|deschide|du ma|pagina)$/i.test(query) && state.lastMatch?.page) {
            return { answer: `Informația anterioară se află în ${state.lastMatch.category || state.lastMatch.title}.`, page: state.lastMatch.page, title: state.lastMatch.title };
        }
        return null;
    }

    function answerQuestion(question) {
        const special = specialResponse(question);
        if (special) return special;

        const ranked = state.entries
            .map((entry) => ({ entry, score: scoreEntry(entry, question) }))
            .sort((left, right) => right.score - left.score);
        const best = ranked[0];

        if (!best || best.score < 9) {
            const topics = state.entries
                .filter((entry) => ['pontaj', 'invoiri', 'craft', 'marketplace', 'ilegal', 'manager', 'admin'].includes(entry.category))
                .slice(0, 4)
                .map((entry) => entry.title)
                .join(', ');
            return {
                answer: `Nu am găsit un răspuns exact în informațiile panelului. Încearcă să reformulezi folosind numele paginii sau funcției. Exemple disponibile: ${topics || 'Pontaj, învoiri, Craft Mecanics și Marketplace'}.`
            };
        }

        state.lastMatch = best.entry;
        const closeMatches = ranked.filter((item, index) => index > 0 && item.score >= best.score - 3 && item.score >= 16).slice(0, 2);
        let answer = best.entry.answer;
        if (closeMatches.length && tokens(question).length <= 2) {
            answer += ` Am mai găsit: ${closeMatches.map((item) => item.entry.title).join(' și ')}.`;
        }
        return { answer, page: best.entry.page, title: best.entry.title };
    }

    function createMessage(text, sender, result = {}) {
        const chat = document.getElementById('assistant-messages');
        const wrapper = document.createElement('div');
        wrapper.className = sender === 'user' ? 'flex justify-end' : 'flex justify-start';
        const bubble = document.createElement('div');
        bubble.className = sender === 'user'
            ? 'max-w-[88%] sm:max-w-[75%] rounded-2xl rounded-br-md bg-emerald-600 px-4 py-3 text-sm text-white shadow'
            : 'max-w-[92%] sm:max-w-[78%] rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-4 py-3 text-sm text-slate-200 shadow';
        const paragraph = document.createElement('p');
        paragraph.className = 'whitespace-pre-wrap leading-relaxed';
        paragraph.textContent = text;
        bubble.appendChild(paragraph);

        if (result.page) {
            const link = document.createElement('a');
            link.href = result.page;
            link.className = 'mt-3 inline-flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20';
            link.textContent = `Deschide ${result.title || 'pagina'} →`;
            bubble.appendChild(link);
        }
        wrapper.appendChild(bubble);
        chat.appendChild(wrapper);
        chat.scrollTop = chat.scrollHeight;
    }

    function showTyping() {
        const chat = document.getElementById('assistant-messages');
        const wrapper = document.createElement('div');
        wrapper.id = 'assistant-typing';
        wrapper.className = 'flex justify-start';
        wrapper.innerHTML = '<div class="rounded-2xl rounded-bl-md border border-slate-800 bg-slate-900 px-4 py-3 text-xs text-slate-400">Se caută în panel…</div>';
        chat.appendChild(wrapper);
        chat.scrollTop = chat.scrollHeight;
    }

    async function submitQuestion(value) {
        const question = String(value || '').trim();
        if (!question) return;
        createMessage(question, 'user');
        showTyping();
        await new Promise((resolve) => setTimeout(resolve, 260));
        document.getElementById('assistant-typing')?.remove();
        const result = answerQuestion(question);
        createMessage(result.answer, 'assistant', result);
    }

    function quickQuestions() {
        const questions = ['Cum pornesc pontajul?', 'Unde găsesc Runflat?', 'Cum trimit o învoire?'];
        if (state.role >= 3) questions.push('Ce găsesc la locații ilegale?');
        if (state.role >= 4) questions.push('Cum văd pontajele active?');
        if (state.role >= 5) questions.push('Cum schimb ora de închidere?');
        return questions;
    }

    async function initialize() {
        (window.PANEL_ASSISTANT_KNOWLEDGE || []).forEach(addEntry);
        await indexLocalPages();
        state.ready = true;
        document.getElementById('assistant-index-status').textContent = `${state.entries.length} informații locale disponibile · acces nivel ${state.role}`;

        const user = typeof getUser === 'function' ? getUser() : null;
        const displayName = user?.display_name || user?.username || 'coleg';
        const displayNameElement = document.getElementById('user-display-name');
        const roleElement = document.getElementById('user-role');
        const avatarElement = document.getElementById('user-avatar');
        if (displayNameElement) displayNameElement.textContent = displayName;
        if (roleElement) roleElement.textContent = roleName();
        if (avatarElement && user?.avatar) avatarElement.src = user.avatar;
        createMessage(`Salut, ${displayName}! Sunt asistentul intern. Îți răspund doar din informațiile panelului și nu trimit întrebările către un API AI.`, 'assistant');

        const suggestions = document.getElementById('assistant-suggestions');
        quickQuestions().forEach((question) => {
            const button = document.createElement('button');
            button.type = 'button';
            button.className = 'rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-slate-300 hover:border-emerald-500/50 hover:text-emerald-400 transition';
            button.textContent = question;
            button.addEventListener('click', () => submitQuestion(question));
            suggestions.appendChild(button);
        });

        document.getElementById('assistant-form').addEventListener('submit', (event) => {
            event.preventDefault();
            const input = document.getElementById('assistant-input');
            const value = input.value;
            input.value = '';
            submitQuestion(value);
        });

        document.getElementById('assistant-clear').addEventListener('click', () => {
            document.getElementById('assistant-messages').innerHTML = '';
            state.lastMatch = null;
            createMessage('Conversația a fost curățată. Cu ce te pot ajuta?', 'assistant');
        });
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initialize);
    else initialize();
})();
