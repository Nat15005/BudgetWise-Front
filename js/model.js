class FinancialModel {
    constructor() {
        this.incomes = [];
        this.expenses = [];
        this.questions = [];
        this.answers = [];
        this.balance = 0;
        this.token = localStorage.getItem('token'); // Suponiendo que el userId está guardado en localStorage
        this.loadMovements();
        this.loadQuestions();
    }

    async loadMovements() {
        try {
            const token = this.token; // Usando el userId como token
            const response = await fetch(`http://localhost:3000/movements/`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al obtener los movimientos');
            const data = await response.json();

            // Limpiar los arrays antes de cargar nuevos movimientos
            this.incomes = [];
            this.expenses = [];

            // Separar movimientos según su tipo
            data.forEach(item => {
                const movement = {
                    id: item.id,
                    name: item.name,
                    value: item.value,
                    date: item.date,
                    type: item.type // Guardar el tipo
                };

                if (item.type === 'income') {
                    this.incomes.push(movement);
                } else if (item.type === 'outcome') {
                    this.expenses.push(movement);
                }
            });
            this.updateBalance();
        } catch (error) {
            console.error('Error al cargar movimientos:', error);
            this.incomes = [];
            this.expenses = [];
        }
    }

    async addIncome(name, value, date) {
        const income = { name, value, date };
        await this.saveMovement('income', income); // Guardar en la API
        this.incomes.unshift(income);  // Agregar al principio del array
        this.updateBalance();
        
    }

    async addExpense(name, value, date) {
        const expense = { name, value, date };
        await this.saveMovement('outcome', expense); // Guardar en la API
        this.expenses.unshift(expense);  // Agregar al principio del array
        this.updateBalance();
        
    }

    async addQuestion(questionText) {
        try{
            const token = this.token; 
            const question = {
                text: questionText,
            };
        
            // Realizar una solicitud POST a la API para agregar la pregunta
            const response = await fetch('http://localhost:3000/questions/', {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(question)
            })
            if (!response.ok) {
                const responseText = await response.text();
                throw new Error(`Error al guardar el movimiento: ${responseText}`);
            }
            Swal.fire({
                icon: 'success',
                title: 'Question added succesfully!',
                showConfirmButton: false,
                timer: 2500
            }); 
        }catch (error) {
            console.error('Error al cargar pregunta:', error);
            this.questions = [];
        }
       
    }

    async addAnswer(questionId, answerText) {
        try {
            const token = this.token; 
            const body = {
                questionId: questionId,
                text: answerText
            };
            const response = await fetch(`http://localhost:3000/answers`, {
                method: 'POST',
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(body) // Enviar el texto de la respuesta
            });

            if (!response.ok) {
                throw new Error('Error al agregar la respuesta');
            }
            Swal.fire({
                icon: 'success',
                title: 'Answer added succesfully!',
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
            const response = await fetch(`http://localhost:3000/questions/`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al obtener las preguntas');
            const data = await response.json();

            // Limpiar el array de preguntas antes de cargar nuevas preguntas
            this.questions = [];

            // Almacenar preguntas y cargar respuestas
            for (const item of data) {
                const question = {
                    id: item.id,
                    username: item.username,
                    text: item.text,
                    answers: [] // Arreglo para almacenar las respuestas
                };
                
                // Llamar al método para cargar respuestas
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
            const response = await fetch(`http://localhost:3000/answers/${questionId}`, {
                headers: {
                    'Authorization': token,
                    'Content-Type': 'application/json'
                }
            });
            if (!response.ok) throw new Error('Error al obtener respuestas');
            const answers = await response.json();

            // Almacenar las respuestas en el objeto de la pregunta
            question.answers = answers.map(answer => ({
                id: answer.id,
                text: answer.text,
                username: answer.username // Suponiendo que también tienes el username
            }));
        } catch (error) {
            console.error(`Error al cargar respuestas para la pregunta ${questionId}:`, error);
            question.answers = []; // Asegurarse de que las respuestas estén vacías en caso de error
        }
    }

    async saveMovement(type, movement) {
        try {
            const token = this.token;         
            // Convertir la fecha al formato ISO (agregar 'T' entre la fecha y la hora)
            const dateInISOFormat = movement.date.replace(' ', 'T'); // Cambia el espacio por 'T'
    
            const body = {
                name: movement.name,
                value: movement.value,
                date: dateInISOFormat, // Usa la fecha en formato ISO
                type: type,
            };
    
    
            const response = await fetch(`http://localhost:3000/movements/`, {
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
    
            await this.loadMovements(); // Recargar movimientos tras guardar
        } catch (error) {
            console.error('Error saving movement:', error);
        }
    }
    async updateMovement(realIndex, updatedMovement) {
        try {
            const token = this.token;  
            const response = await fetch(`http://localhost:3000/movements/${realIndex}`, {
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
            throw error; // Re-lanzar el error para que se maneje en el controlador
        }
    }
    async deleteMovement(id) {
        try {
            const token = this.token;         
            const response = await fetch(`http://localhost:3000/movements/${id}`, {
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

            // Actualizar la lista de movimientos tras la eliminación
            await this.loadMovements(); // Recargar movimientos tras eliminar
        } catch (error) {
            console.error('Error al eliminar el movimiento:', error);
        }
    }

    updateBalance() {
        this.totalIncome = this.incomes.reduce((total, income) => total + income.value, 0);
        this.totalExpense = this.expenses.reduce((total, expense) => total + expense.value, 0);
        this.balance = this.totalIncome - this.totalExpense;
        localStorage.setItem('balance', this.balance);
    }

    getMovements() {
        return {
            incomes: this.incomes,
            expenses: this.expenses,
            balance: this.balance
        };
    }
    getQuestions() {
        return this.questions;
    }
}
export default FinancialModel;
