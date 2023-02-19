export class Utils {

    static displayDate (date:Date, format:"console" | "user") {

        let day = formatTo2Digits(date.getDate());
        let month = formatTo2Digits(date.getMonth() + 1);
        let year = date.getFullYear();
        let hour = formatTo2Digits(date.getHours());
        let minutes = formatTo2Digits(date.getMinutes());
        let seconds = formatTo2Digits(date.getSeconds());
        let daysSince = displayDaysSince(date.getTime());

        if(format == "console")
            return `[${day}/${month}] [${hour}:${minutes}:${seconds}]`;
        else 
            return day + "/" + month + "/" + year + " à " + hour + ":" + minutes + " (il y a " + daysSince + " jours)"
        
    }
}


function displayDaysSince(date:number) {
    let mtn = Date.now();
    let ecart = Math.floor((mtn - date) / 86400000);
    return ecart.toString()
}

function formatTo2Digits(value:number) {
    return value.toString().padStart(2, '0')
}