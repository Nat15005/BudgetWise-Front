import FinancialModel from './model.js';
import FinancialView from './view.js';

class FinancialController {
    constructor(model, view) {
        this.model = model;
        this.view = view;
        this.editingIndex = null;
        this.initialize();

    }
    async initialize() {
        await this.model.loadMovements(); // Cargar movimientos desde la API
        this.view.updateBalance(this.model.balance);
        this.updateView(); // Mover esta línea aquí para asegurarse de que se llama después de cargar los movimientos
        this.initEventListeners();
        this.initLocalStorageListener();
        this.initFaqPopup();
    }

    initEventListeners() {
        const popup = document.getElementById('popup-form');
        const closePopup = document.getElementById('close-popup');

        document.querySelector('.btn-add-income').addEventListener('click', () => {
            this.showForm('income');
        });

        document.querySelector('.btn-add-expense').addEventListener('click', () => {
            this.showForm('expense');
        });

        closePopup.addEventListener('click', () => {
            this.hideForm();
        });

        window.addEventListener('click', (event) => {
            if (event.target === popup) {
                this.hideForm();
            }
        });

        document.getElementById('income-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('income-name').value;
            const value = parseFloat(document.getElementById('income-value').value);
            const date = document.getElementById('income-date').value;
            const currentTime = new Date().toLocaleTimeString('en-GB');
            const dateTime = `${date}T${currentTime}`;
            if (name && !isNaN(value) && date) {
                if (this.editingIndex !== null) {
                    this.updateMovement('income', name, value, dateTime);
                } else {
                    this.createMovement('income',name, value, dateTime);
                }
                await this.updateView();
                this.hideForm();
            }
        });

        document.getElementById('expense-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const name = document.getElementById('expense-name').value;
            const value = parseFloat(document.getElementById('expense-value').value);
            const date = document.getElementById('expense-date').value;
            const currentTime = new Date().toLocaleTimeString('en-GB');
            const dateTime = `${date}T${currentTime}`;
            if (name && !isNaN(value) && date) {
                if (this.editingIndex !== null) {
                    this.updateMovement('outcome', name, value, dateTime);
                } else {
                    this.createMovement('outcome',name, value, dateTime);
                }
                await this.updateView();
                this.hideForm();
            }
        });

        this.view.setEditHandler(this.editMovement.bind(this));
        this.view.setDeleteHandler(this.deleteMovement.bind(this));
    }
    
    initLocalStorageListener() {
        window.addEventListener('storage', (event) => {
            if (event.key === 'balance') {
                this.model.balance = parseFloat(event.newValue) || 0;
                this.updateView();
            }
        });
    }
    initFaqPopup() {
        const faqButton = document.getElementById('faqButton');
        const submitResponse = document.getElementById('submitResponse');
        faqButton.addEventListener('click', async () => {
            await this.model.loadQuestions();
            const questions = this.model.getQuestions();
            this.view.questionsContainer.innerHTML = ''; // Limpiar el contenedor de preguntas
            questions.forEach(question => {
                this.view.addQuestionToContainer(question); // Agregar cada pregunta a la vista
            });
            this.view.toggleFaqPopup();
        });

        this.view.closePopup.addEventListener('click', () => {
            this.view.hideFaqPopup();
        });

        this.view.askButton.addEventListener('click', () => {
            const questionText = this.view.questionInput.value.trim();
            if (questionText) {
                const question = this.model.addQuestion(questionText); 
                this.view.addQuestionToContainer(question); // Agregar pregunta a la vista
                this.view.questionInput.value = ''; // Limpiar el campo después de enviar
                this.view.hideFaqPopup();
            }
        });
        submitResponse.addEventListener('click', () => this.handleResponseSubmit());
    }
    openResponsePopup(questionId, answerContainer) {
        this.currentQuestionId = questionId; // Guardamos el ID de la pregunta
        this.currentAnswerContainer = answerContainer; // Guardamos el contenedor de respuestas
        this.view.showResponsePopup();
    }

    async handleResponseSubmit() {
        const responseInput = this.view.responseInput;
        const questionId = this.view.currentQuestionId;
    
        if (!responseInput) {
            console.error('responseInput no está definido');
            return; // Salir si el input no está disponible
        }
    
        const answerText = responseInput.value.trim();
        if (answerText && questionId) {
            try {
                await this.model.addAnswer(questionId, answerText);
                this.view.hideResponsePopup();
                this.view.hideFaqPopup();
            } catch (error) {
                console.error('Error al enviar la respuesta:', error);
                alert('Hubo un error al enviar la respuesta. Inténtalo nuevamente.');
            }
        }else{
            console.log("Ni entra al if");
        }
    }
    async handleQuestionClick(questionId, answerContainer) {
        const answers = await this.model.getAnswersByQuestionId(questionId);
        this.view.updateAnswers(answerContainer, answers);
    }

    showForm(type, movement = null) {
        const popup = document.getElementById('popup-form');
        document.getElementById('income-form').style.display = type === 'income' ? 'flex' : 'none';
        document.getElementById('expense-form').style.display = type === 'expense' ? 'flex' : 'none';
        popup.style.display = 'block';

        if (movement) {
            document.getElementById(`${type}-name`).value = movement.name;
            document.getElementById(`${type}-value`).value = movement.value;
            document.getElementById(`${type}-date`).value = movement.date.split(' ')[0];
            this.editingIndex = movement.index;
        } else {
            this.editingIndex = null;
        }
    }

    hideForm() {
        document.getElementById('popup-form').style.display = 'none';
        document.getElementById('income-form').reset();
        document.getElementById('expense-form').reset();
    }

    // controller.js
    async updateMovement(type, name, value, date) {
        const movements = await this.getMovements(); // Obtener movimientos desde el modelo
        const movement = movements[this.editingIndex];
        const updatedMovement = {
            name,
            value,
            date,
            type
        };
        await this.model.updateMovement(movement.id, updatedMovement); // Enviamos el ID junto con los datos actualizados
        this.editingIndex = null; // Resetear el índice de edición */
        this.updateView();
    }
    async createMovement(type, name, value, dateTime){
        if(type==='income'){
            await this.model.addIncome(name, value, dateTime);
        }else if(type === 'outcome'){
            await this.model.addExpense(name, value, dateTime);
        }else{
            console.log("chingamos");
        }
        await this.updateView();
    }


    async updateView() {
        await this.model.loadMovements(); // Cargar movimientos desde la API
        this.model.updateBalance(); // Asegura que el balance se actualice en el modelo
        this.view.updateBalance(this.model.balance);
        const movements = await this.getMovements();
        movements.reverse();
        this.view.updateMovements(movements); // Ahora movements debería ser un array
    }

    async getMovements() {
        await this.model.loadMovements(); // Cargar movimientos desde la API
        let runningBalance = 0; // Comienza con el balance inicial
        const movements = [];
        console.log(this.model.incomes);
        console.log(this.model.expenses);
        // Combinar ingresos y egresos en un solo array
        const allMovements = this.model.getMovements();
        console.log(allMovements);
        // Ordenar por fecha y hora en orden descendente
        allMovements.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        // Procesar todos los movimientos ordenados
       
        allMovements.forEach(movement => {
            if (movement.type === 'income' || movement.type === 'pocketOutcome') {
;
                runningBalance += movement.value;
        
            } else if (movement.type === 'outcome' || movement.type === 'pocketIncome') {
    
                runningBalance -= movement.value;
          
            }
           
            movements.push({
                id: movement.id,
                name: movement.name,
                value: movement.value,
                remaining: runningBalance,
                date: movement.date,
                type: movement.type
            });
        });

        return movements; // Asegúrate de que se retorne un array
    }


    async editMovement(index) {
        const movements = await this.getMovements();
        const movement = movements[index];

        if (!movement) {
            console.error('Movimiento no encontrado en el índice:', index);
            return;
        }

        this.showForm(movement.type, { ...movement, index: index });
    }

    async deleteMovement(index) {
        const movements = await this.getMovements();
        const movement = movements[index];
        await this.model.deleteMovement(movement.id); // Enviar solicitud de eliminación a la API
        this.updateView();
    }

}

// Inicializar la aplicación
new FinancialController(new FinancialModel(), new FinancialView());
