// ==========================================
// Invitation Creator Module
// ==========================================

// Шаблони текстів для різних стилів
const INVITATION_TEMPLATES = {
    casual: {
        name: 'Стандартний',
        icon: '😊',
        text: 'Наступного понеділка, 3 листопада, я йду на український стендап у Кьольні. Буду дуже радий, якщо ти приєднаєшся. Разом буде веселіше і ми зможемо гарно провести час не тільки під час стендапу, а й після нього. \nКвитки можеш придбати ось тут: https://secure.wayforpay.com/payment/herbstcologne',
        variations: [
            { 
                word: 'Наступного понеділка', 
                alternatives: ['У понеділок', '3 листопада', 'Цього понеділка'] 
            },
            { 
                word: 'український стендап', 
                alternatives: ['стендап шоу', 'комедійне шоу', 'гумористичний вечір', 'вечір гумору'] 
            },
            { 
                word: 'дуже радий', 
                alternatives: ['щасливий', 'задоволений', 'буде круто', 'супер', 'класно буде'] 
            },
            { 
                word: 'приєднаєшся', 
                alternatives: ['підеш зі мною', 'складеш компанію', 'теж прийдеш', 'підтримаєш компанію'] 
            },
            { 
                word: 'гарно провести час', 
                alternatives: ['весело провести час', 'відпочити', 'відірватися', 'посміятися'] 
            }
        ]
    },
    
    intelligent: {
        name: 'Інтелігентний',
        icon: '🎩',
        text: 'Шановний друже! Маю честь запросити тебе на вечір українського стендапу, що відбудеться у понеділок, 3 листопада, у Кьольні. Було б надзвичайно приємно провести цей час у твоїй компанії. Впевнений, що вечір буде цікавим і насиченим гумором. \nКвитки можна придбати за посиланням: https://secure.wayforpay.com/payment/herbstcologne',
        variations: [
            { 
                word: 'Шановний друже', 
                alternatives: ['Дорогий друже', 'Вельмишановний', 'Любий друже', 'Приятелю'] 
            },
            { 
                word: 'Маю честь запросити', 
                alternatives: ['Хочу запросити', 'Запрошую', 'З радістю запрошую', 'Маю задоволення запросити'] 
            },
            { 
                word: 'надзвичайно приємно', 
                alternatives: ['дуже приємно', 'чудово', 'неймовірно приємно', 'велике задоволення'] 
            },
            { 
                word: 'насиченим гумором', 
                alternatives: ['веселим', 'жартівливим', 'комедійним', 'сповненим сміху', 'дотепним'] 
            },
            { 
                word: 'цей час', 
                alternatives: ['цей вечір', 'ці години', 'момент', 'вечір'] 
            }
        ]
    },
    
    aggressive: {
        name: 'Агресивний',
        icon: '💪',
        text: 'Здоров, {бичара/лошара/кореш/братан}! Я йду на український стендап в Кьольні у понеділок 3 листопада. {Хочу подивитись, що за гамно там буде/Було б прикольно там зустрітись, відпочити разом}. {Вечір обіцяє бути хорошим, тому не прийшов - проїбав/Думаю буде весело, тож давай не лінуйся}. \nКвитки тут: https://secure.wayforpay.com/payment/herbstcologne. \nНе прийшов - проїбав!' ,
        variations: [
            { 
                word: '{бичара/лошара/кореш/братан}', 
                alternatives: ['бичара', 'бомжара', 'лошара', 'братан', 'чувак', 'сучара', 'уйобок', 'дєган'], 
                custom: true 
            },
            { 
                word: '{Хочу подивитись, що за гамно там буде/Було б прикольно там зустрітись, відпочити разом}', 
                alternatives: [
                    'Хочу подивитись, що за гамно там буде', 
                    'Було б прикольно там зустрітись, відпочити разом',
                    'Треба йти, бо всі йдуть'
                ], 
                custom: true 
            },
            { 
                word: '{Вечір обіцяє бути хорошим, тому не прийшов - проїбав/Думаю буде весело, тож давай не лінуйся}', 
                alternatives: [
                    'Я впевнений що добре проведу там час, але з тобою буде краще',
                    'Думаю буде весело, тож давай не лінуйся',
                    'Не тупи, йдемо разом'
                ], 
                custom: true 
            }
        ]
    }
};

class InvitationCreator {
    constructor() {
        this.currentStyle = 'casual';
        this.currentText = '';
        this.selectedWords = {};
        this.modal = null;
    }

    open() {
        this.createModal();
        this.render();
        document.body.style.overflow = 'hidden';
    }

    close() {
        if (this.modal) {
            this.modal.style.animation = 'fadeOut 0.3s ease-out';
            setTimeout(() => {
                if (this.modal && this.modal.parentNode) {
                    this.modal.parentNode.removeChild(this.modal);
                }
                document.body.style.overflow = '';
            }, 300);
        }
    }

    createModal() {
        this.modal = document.createElement('div');
        this.modal.id = 'invitation-modal';
        this.modal.innerHTML = `
            <style>
                #invitation-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    padding: 20px;
                    animation: fadeIn 0.3s ease-out;
                    backdrop-filter: blur(5px);
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }

                .invitation-content {
                    background: white;
                    border-radius: 20px;
                    max-width: 700px;
                    width: 100%;
                    max-height: 90vh;
                    overflow-y: auto;
                    padding: 40px;
                    position: relative;
                    animation: slideUp 0.4s ease-out;
                }

                @keyframes slideUp {
                    from {
                        transform: translateY(50px);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }

                .invitation-close {
                    position: absolute;
                    top: 15px;
                    right: 15px;
                    background: none;
                    border: none;
                    font-size: 2rem;
                    cursor: pointer;
                    color: #6C757D;
                    transition: all 0.3s ease;
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }

                .invitation-close:hover {
                    background: #E8F3FC;
                    color: #5B9BD5;
                    transform: rotate(90deg);
                }

                .invitation-header {
                    text-align: center;
                    margin-bottom: 30px;
                }

                .invitation-header h2 {
                    font-family: 'Caveat', cursive;
                    font-size: 2.5rem;
                    background: linear-gradient(135deg, #5B9BD5, #F5D76E);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    margin-bottom: 10px;
                }

                .invitation-header p {
                    color: #6C757D;
                    font-size: 1rem;
                }

                .style-selector {
                    display: flex;
                    gap: 10px;
                    margin-bottom: 30px;
                    justify-content: center;
                    flex-wrap: wrap;
                }

                .style-btn {
                    flex: 1;
                    min-width: 150px;
                    padding: 15px 20px;
                    border: 2px solid #E8F3FC;
                    background: white;
                    border-radius: 12px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .style-btn:hover {
                    border-color: #5B9BD5;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(91, 155, 213, 0.2);
                }

                .style-btn.active {
                    border-color: #5B9BD5;
                    background: linear-gradient(135deg, #E8F3FC, #FFF8E1);
                    box-shadow: 0 4px 12px rgba(91, 155, 213, 0.3);
                }

                .text-preview {
                    background: linear-gradient(135deg, #E8F3FC, #FFF8E1);
                    padding: 25px;
                    border-radius: 16px;
                    margin-bottom: 25px;
                    border: 2px solid #5B9BD5;
                    min-height: 200px;
                    font-size: 1.05rem;
                    line-height: 1.8;
                    color: #2C3E50;
                    position: relative;
                }

                .editable-word {
                    position: relative;
                    cursor: pointer;
                    font-weight: 600;
                    color: #5B9BD5;
                    border-bottom: 2px dashed #5B9BD5;
                    padding: 2px 4px;
                    transition: all 0.2s ease;
                }

                .editable-word:hover {
                    background: rgba(91, 155, 213, 0.1);
                    border-bottom-style: solid;
                }

                .alternatives-popup {
                    position: fixed;
                    background: white;
                    border: 2px solid #5B9BD5;
                    border-radius: 12px;
                    padding: 10px;
                    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
                    z-index: 10001;
                    min-width: 200px;
                    max-width: 300px;
                    animation: popupSlide 0.2s ease-out;
                }

                @keyframes popupSlide {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .alternative-option {
                    padding: 10px 15px;
                    cursor: pointer;
                    border-radius: 8px;
                    transition: all 0.2s ease;
                    font-size: 0.95rem;
                    margin-bottom: 5px;
                }

                .alternative-option:last-child {
                    margin-bottom: 0;
                }

                .alternative-option:hover {
                    background: #E8F3FC;
                    color: #5B9BD5;
                }

                .alternative-option.active {
                    background: #5B9BD5;
                    color: white;
                }

                .custom-input-section {
                    padding-top: 10px;
                    border-top: 1px solid #E8F3FC;
                    margin-top: 5px;
                }

                .custom-input {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #E8F3FC;
                    border-radius: 6px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.9rem;
                    margin-bottom: 5px;
                }

                .custom-input:focus {
                    outline: none;
                    border-color: #5B9BD5;
                }

                .custom-btn {
                    width: 100%;
                    padding: 6px 12px;
                    background: #5B9BD5;
                    color: white;
                    border: none;
                    border-radius: 6px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 0.85rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .custom-btn:hover {
                    background: #7DB3E8;
                }

                .send-buttons {
                    display: flex;
                    gap: 15px;
                }

                .send-btn {
                    flex: 1;
                    padding: 15px 25px;
                    border: none;
                    border-radius: 12px;
                    font-family: 'Montserrat', sans-serif;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    color: white;
                }

                .send-btn.telegram {
                    background: #0088cc;
                    box-shadow: 0 4px 12px rgba(0, 136, 204, 0.3);
                }

                .send-btn.telegram:hover {
                    background: #006699;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(0, 136, 204, 0.4);
                }

                .send-btn.whatsapp {
                    background: #25D366;
                    box-shadow: 0 4px 12px rgba(37, 211, 102, 0.3);
                }

                .send-btn.whatsapp:hover {
                    background: #20ba5a;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 16px rgba(37, 211, 102, 0.4);
                }

                .hint-text {
                    text-align: center;
                    color: #6C757D;
                    font-size: 0.9rem;
                    margin-bottom: 20px;
                    font-style: italic;
                }

                @media (max-width: 768px) {
                    .invitation-content {
                        padding: 30px 20px;
                        max-height: 95vh;
                    }

                    .invitation-header h2 {
                        font-size: 2rem;
                    }

                    .style-selector {
                        flex-direction: column;
                    }

                    .style-btn {
                        width: 100%;
                    }

                    .send-buttons {
                        flex-direction: column;
                    }

                    .text-preview {
                        font-size: 1rem;
                        padding: 20px;
                    }

                    .alternatives-popup {
                        max-width: 250px;
                    }
                }
            </style>

            <div class="invitation-content">
                <button class="invitation-close" onclick="invitationCreator.close()">×</button>
                
                <div class="invitation-header">
                    <h2>✨ Створи запрошення</h2>
                    <p>Обери стиль і налаштуй текст під себе</p>
                </div>

                <div class="style-selector" id="style-selector"></div>

                <div class="hint-text">
                    💡 Наведи на виділені слова, щоб побачити альтернативи
                </div>

                <div class="text-preview" id="text-preview"></div>

                <div class="send-buttons">
                    <button class="send-btn telegram" onclick="invitationCreator.sendToTelegram()">
                        <span>📱</span>
                        <span>Надіслати в Telegram</span>
                    </button>
                    <button class="send-btn whatsapp" onclick="invitationCreator.sendToWhatsApp()">
                        <span>💬</span>
                        <span>Надіслати в WhatsApp</span>
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(this.modal);

        // Close on backdrop click
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.close();
            }
        });
    }

    render() {
        this.renderStyleSelector();
        this.renderTextPreview();
    }

    renderStyleSelector() {
        const selector = document.getElementById('style-selector');
        selector.innerHTML = '';

        Object.keys(INVITATION_TEMPLATES).forEach(styleKey => {
            const style = INVITATION_TEMPLATES[styleKey];
            const btn = document.createElement('button');
            btn.className = `style-btn ${styleKey === this.currentStyle ? 'active' : ''}`;
            btn.innerHTML = `<span>${style.icon}</span><span>${style.name}</span>`;
            btn.onclick = () => {
                this.currentStyle = styleKey;
                this.selectedWords = {};
                this.render();
            };
            selector.appendChild(btn);
        });
    }

    renderTextPreview() {
        const preview = document.getElementById('text-preview');
        const template = INVITATION_TEMPLATES[this.currentStyle];
        
        // Обробка тексту: для варіантів в дужках вибираємо випадковий
        let text = template.text;
        
        // Замінюємо {option1/option2/...} на випадковий вибір
        const placeholders = [];
        text = text.replace(/\{([^}]+)\}/g, (match, options) => {
            const opts = options.split('/');
            const randomOpt = opts[Math.floor(Math.random() * opts.length)];
            placeholders.push(randomOpt);
            return `__PLACEHOLDER_${placeholders.length - 1}__`;
        });
        
        this.currentText = text;

        // Створюємо інтерактивні елементи
        let placeholderIndex = 0;
        template.variations.forEach((variation, index) => {
            let wordToReplace = variation.word;
            
            // Для custom варіантів використовуємо placeholder
            if (variation.custom) {
                wordToReplace = `__PLACEHOLDER_${placeholderIndex}__`;
                const selectedValue = this.selectedWords[index] || placeholders[placeholderIndex];
                const span = `<span class="editable-word" data-index="${index}">${selectedValue}</span>`;
                text = text.replace(wordToReplace, span);
                placeholderIndex++;
            } else {
                const selectedValue = this.selectedWords[index] || variation.word;
                const span = `<span class="editable-word" data-index="${index}">${selectedValue}</span>`;
                text = text.replace(selectedValue, span);
            }
        });

        preview.innerHTML = text;

        // Додаємо обробники подій для інтерактивних слів
        preview.querySelectorAll('.editable-word').forEach(word => {
            word.addEventListener('click', (e) => {
                e.stopPropagation();
                this.showAlternatives(e, word);
            });
        });

        // Видаляємо popup при кліку поза текстом
        preview.addEventListener('click', () => {
            const popup = document.querySelector('.alternatives-popup');
            if (popup) {
                popup.remove();
            }
        });
    }

    showAlternatives(event, wordElement) {
        // Видаляємо попередній popup
        const existingPopup = document.querySelector('.alternatives-popup');
        if (existingPopup) {
            existingPopup.remove();
        }

        const index = parseInt(wordElement.dataset.index);
        const template = INVITATION_TEMPLATES[this.currentStyle];
        const variation = template.variations[index];

        const popup = document.createElement('div');
        popup.className = 'alternatives-popup';

        // Додаємо альтернативи
        variation.alternatives.forEach(alt => {
            const option = document.createElement('div');
            option.className = 'alternative-option';
            if (alt === wordElement.textContent) {
                option.classList.add('active');
            }
            option.textContent = alt;
            option.onclick = (e) => {
                e.stopPropagation();
                wordElement.textContent = alt;
                this.selectedWords[index] = alt;
                this.updateCurrentText();
                popup.remove();
            };
            popup.appendChild(option);
        });

        // Додаємо можливість вписати свій варіант
        if (variation.custom) {
            const customSection = document.createElement('div');
            customSection.className = 'custom-input-section';
            customSection.innerHTML = `
                <input type="text" class="custom-input" placeholder="Твій варіант...">
                <button class="custom-btn">Застосувати</button>
            `;
            popup.appendChild(customSection);

            const input = customSection.querySelector('.custom-input');
            const btn = customSection.querySelector('.custom-btn');
            
            btn.onclick = (e) => {
                e.stopPropagation();
                if (input.value.trim()) {
                    wordElement.textContent = input.value.trim();
                    this.selectedWords[index] = input.value.trim();
                    this.updateCurrentText();
                    popup.remove();
                }
            };

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.stopPropagation();
                    btn.click();
                }
            });

            input.addEventListener('click', (e) => e.stopPropagation());
        }

        // Позиціонуємо popup
        const rect = wordElement.getBoundingClientRect();
        popup.style.left = rect.left + 'px';
        popup.style.top = (rect.bottom + 5) + 'px';

        document.body.appendChild(popup);

        // Перевіряємо, чи popup виходить за межі екрану
        setTimeout(() => {
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.right > window.innerWidth) {
                popup.style.left = (window.innerWidth - popupRect.width - 10) + 'px';
            }
            if (popupRect.bottom > window.innerHeight) {
                popup.style.top = (rect.top - popupRect.height - 5) + 'px';
            }
        }, 0);

        // Видаляємо popup при кліку поза ним
        popup.addEventListener('click', (e) => e.stopPropagation());
        
        const closePopup = () => {
            if (popup.parentNode) {
                popup.remove();
            }
            document.removeEventListener('click', closePopup);
        };
        
        setTimeout(() => {
            document.addEventListener('click', closePopup);
        }, 100);
    }

    updateCurrentText() {
        const preview = document.getElementById('text-preview');
        this.currentText = preview.textContent;
    }

    getCurrentText() {
        this.updateCurrentText();
        return this.currentText;
    }

    sendToTelegram() {
        const text = this.getCurrentText();
        const encodedText = encodeURIComponent(text);
        const telegramUrl = `https://t.me/share/url?url=&text=${encodedText}`;
        window.open(telegramUrl, '_blank', 'width=600,height=600');
    }

    sendToWhatsApp() {
        const text = this.getCurrentText();
        const encodedText = encodeURIComponent(text);
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        let whatsappUrl;
        if (isMobile) {
            whatsappUrl = `whatsapp://send?text=${encodedText}`;
        } else {
            whatsappUrl = `https://web.whatsapp.com/send?text=${encodedText}`;
        }
        
        window.open(whatsappUrl, '_blank');
    }
}

// Глобальна змінна для доступу
let invitationCreator;

// Функція для відкриття модалки (викликається з HTML)
function openInvitationCreator() {
    if (!invitationCreator) {
        invitationCreator = new InvitationCreator();
    }
    invitationCreator.open();
}

// Підтримка ESC для закриття
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && invitationCreator && invitationCreator.modal) {
        invitationCreator.close();
    }
});

console.log('✨ Invitation Creator завантажено');
