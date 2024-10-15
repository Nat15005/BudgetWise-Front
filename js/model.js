class FinancialModel {
    constructor() {
        this.incomes = [];
        this.expenses = [];
        this.movements = [];
        this.questions = [];
        this.answers = [];
        this.balance = 0;
        this.token = localStorage.getItem('token'); // Suponiendo que el token está guardado en localStorage
        this.APIURL = "http://localhost:3000/api/";
        this.loadMovements();
        this.loadQuestions();
    }

    async loadMovements() {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}movements/`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al obtener los movimientos');
            const data = await response.json();

            // Limpiar los arrays antes de cargar nuevos movimientos
            this.movements = [];

            // Separar movimientos según su tipo
            data.forEach(item => {
                const movement = {
                    id: item.id,
                    name: item.name,
                    value: item.value,
                    date: item.date,
                    type: item.type
                };
                this.movements.push(movement);
               
            });
            this.updateBalance();
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            this.movements = [];
        }
    }

    async addIncome(name, value, date) {
        const income = { name, value, date };
        await this.saveMovement('income', income);
        this.incomes.unshift(income);
        this.updateBalance();
    }

    async addExpense(name, value, date) {
        const expense = { name, value, date };
        await this.saveMovement('outcome', expense);
        this.expenses.unshift(expense);
        this.updateBalance();
    }

    async addQuestion(questionText) {
        try {
            const token = this.token;
            const question = { text: questionText };

            const response = await fetch(`${this.APIURL}questions/`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(question)
            });
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Error al guardar la pregunta: ${responseText}`);
            }
            Swal.fire({
                icon: 'success',
                title: 'Question added successfully!',
                showConfirmButton: false,
                timer: 2500
            });
        } catch (error) {
            console.error('Error al agregar pregunta:', error);
            this.questions = [];
        }
    }

    async addAnswer(questionId, answerText) {
        try {
            const token = this.token;
            const body = { questionId, text: answerText };

            const response = await fetch(`${this.APIURL}answers`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                throw new Error('Error al agregar la respuesta');
            }
            Swal.fire({
                icon: 'success',
                title: 'Answer added successfully!',
                showConfirmButton: false,
                timer: 2500
            });
        } catch (error) {
            console.error('Error en addAnswer:', error);
        }
    }

    async loadQuestions() {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}questions/`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al obtener las preguntas');
            const data = await response.json();

            this.questions = [];
            for (const item of data) {
                const question = {
                    id: item.id,
                    username: item.username,
                    text: item.text,
                    answers: []
                };
                await this.loadAnswersForQuestion(question.id, question);
                this.questions.push(question);
            }
        } catch (error) {
            console.error('Error al cargar preguntas:', error);
            this.questions = [];
        }
    }

    async loadAnswersForQuestion(questionId, question) {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}answers/${questionId}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al obtener respuestas');
            const answers = await response.json();

            question.answers = answers.map(answer => ({
                id: answer.id,
                text: answer.text,
                username: answer.username
            }));
        } catch (error) {
            console.error(`Error al cargar respuestas para la pregunta ${questionId}:`, error);
            question.answers = [];
        }
    }

    async saveMovement(type, movement) {
        try {
            const token = this.token;
            const dateInISOFormat = movement.date.replace(' ', 'T');

            const body = {
                name: movement.name,
                value: movement.value,
                date: dateInISOFormat,
                type: type
            };

            const response = await fetch(`${this.APIURL}movements/`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body)
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Error al guardar el movimiento: ${responseText}`);
            }

            await this.loadMovements();
        } catch (error) {
            console.error('Error saving movement:', error);
        }
    }

    async updateMovement(realIndex, updatedMovement) {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}movements/${realIndex}`, {
                method: 'PUT',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedMovement)
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el movimiento');
            }
            await this.loadMovements();
        } catch (error) {
            console.error('Error en la actualización del movimiento:', error);
            throw error;
        }
    }

    async deleteMovement(id) {
        try {
            const token = this.token;
            const response = await fetch(`${this.APIURL}movements/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Error al eliminar el movimiento: ${responseText}`);
            }

            await this.loadMovements();
        } catch (error) {
            console.error('Error al eliminar el movimiento:', error);
        }
    }

    updateBalance() {
        let balance = 0; // Inicializa el balance en 0
    
        // Itera sobre los movimientos
        for (const movement of this.movements) {
            if (movement.type === 'income' || movement.type === 'pocketOutcome') {
                balance += movement.value; // Suma al balance si es ingreso
            } else if (movement.type === 'outcome' || movement.type === 'pocketIncome') {
                balance -= movement.value; // Resta al balance si es gasto
            }
        }
    
        // Guarda el balance actualizado en el localStorage (o cualquier otro sistema de persistencia)
        localStorage.setItem('balance', balance);
    
        // También puedes actualizar una variable de instancia si es necesario
        this.balance = balance;
    }

    getMovements() {
        return this.movements;
    }

    getQuestions() {
        return this.questions;
    }
}
export default FinancialModel;
