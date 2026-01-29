export function numberToWords(amount: number): string {
    const units = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine"];
    const teens = ["Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    const thousands = ["", "Thousand", "Million", "Billion"];

    if (amount === 0) return "Zero";

    let words = "";
    let i = 0;

    function chunk(n: number): string {
        let str = "";
        const h = Math.floor(n / 100);
        const t = Math.floor((n % 100) / 10);
        const u = n % 10;

        if (h > 0) {
            str += units[h] + " Hundred ";
        }

        if (t > 1) {
            str += tens[t] + " ";
            if (u > 0) str += units[u] + " ";
        } else if (t === 1) {
            str += teens[u] + " ";
        } else if (u > 0) {
            str += units[u] + " ";
        }

        return str;
    }

    // Integer part
    let num = Math.floor(amount);

    while (num > 0) {
        if (num % 1000 !== 0) {
            words = chunk(num % 1000) + thousands[i] + " " + words;
        }
        num = Math.floor(num / 1000);
        i++;
    }

    words = words.trim();

    // Decimal part (fils)
    const decimalPart = Math.round((amount - Math.floor(amount)) * 100);
    
    if (words.length > 0) {
        words += " Dirhams";
    }

    if (decimalPart > 0) {
        if (words.length > 0) {
            words += " and ";
        }
        
        // Process decimal part using the same chunk logic
        // We need to reset logic or just manually call chunk since it's < 100
        let filsWords = "";
        const t = Math.floor(decimalPart / 10);
        const u = decimalPart % 10;
        
        if (t > 1) {
            filsWords += tens[t] + " ";
            if (u > 0) filsWords += units[u] + " ";
        } else if (t === 1) {
            filsWords += teens[u] + " ";
        } else if (u > 0) {
            filsWords += units[u] + " ";
        } 
        
        words += filsWords.trim() + " Fils";
    }

    return words + " Only";
}
