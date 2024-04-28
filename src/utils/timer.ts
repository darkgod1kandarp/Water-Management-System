
const { DateTime } = require('luxon');

const getStartOfWeek = () => {
    const now = DateTime.now();
    const startOfWeek = now.startOf('week');
    return {
        start: startOfWeek.toISODate(),
        end: startOfWeek.plus({ days: 6 }).toISODate()
    }
}

function getStartOfMonth() {
    const now = DateTime.now();
    const startOfMonth = now.startOf('month');
    return {
        start: startOfMonth.toISODate(),
        end: startOfMonth.endOf('month').toISODate()
    }
}

function getPreviousMonth(){
    const now = DateTime.now();
    const previousMonth = now.minus({ months: 1 }).startOf('month');
    return {
        start: previousMonth.toISODate(),
        end: previousMonth.endOf('month').toISODate()
    }
}

function getPreviousWeek() {
    const now = DateTime.now();
    const previousWeek = now.minus({ weeks: 1 }).startOf('week');
    return {
        start: previousWeek.toISODate(),
        end: previousWeek.plus({ days: 6 }).toISODate()
    }    
}


console.log(getStartOfWeek());
// export { getStartOfWeek, getStartOfMonth, getPreviousMonth, getPreviousWeek };