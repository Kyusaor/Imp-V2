export abstract class Utils {

    static displayConsoleHour () {
        let date = new Date();

        let day = date.getDate().toString().padStart(2, '0');
        let month = (date.getMonth() + 1).toString().padStart(2, '0');
        let hour = date.getHours().toString().padStart(2, '0');
        let minutes = date.getMinutes().toString().padStart(2, '0');
        let seconds = date.getSeconds().toString().padStart(2, '0');

        return `[${day}/${month}] [${hour}:${minutes}:${seconds}]`
    }
}