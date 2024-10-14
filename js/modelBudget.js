class FinancialModel {
    constructor() {
        this.incomes = JSON.parse(localStorage.getItem('tempIncomes')) || [];
        this.expenses = JSON.parse(localStorage.getItem('tempExpenses')) || [];
        this.projectedAmount = JSON.parse(localStorage.getItem('projectedAmount')) || 0;
        this.updateBalance();
    }

    addIncome(name, value, date) {
        const income = { name, value, date };
        this.incomes.unshift(income);
        localStorage.setItem('tempIncomes', JSON.stringify(this.incomes));
        this.updateBalance();
    }

    addExpense(name, value, date) {
        const expense = { name, value, date };
        this.expenses.unshift(expense);
        localStorage.setItem('tempExpenses', JSON.stringify(this.expenses));
        this.updateBalance();
    }

    updateBalance() {
        const storedBalance = JSON.parse(localStorage.getItem('balance')) || 0;
        this.totalIncome = this.incomes.reduce((total, income) => total + income.value, 0);
        this.totalExpense = this.expenses.reduce((total, expense) => total + expense.value, 0);
        this.balance = storedBalance  + this.totalIncome - this.totalExpense;
        localStorage.setItem('TempBalance', JSON.stringify(this.balance)); // Guardar balance en localStorage
    }

    getMovements() {
        return {
            incomes: this.incomes,
            expenses: this.expenses,
            balance: this.balance,
            projectedAmount: this.projectedAmount
        };
    }

    setProjectedAmount(amount) {
        this.projectedAmount = amount;
        localStorage.setItem('projectedAmount', JSON.stringify(this.projectedAmount));
    }
}

export default FinancialModel;