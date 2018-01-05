export default {
    padZero: function(number, size) {
        return ('000000000' + number).substr(-size);
    },
    repeat: function(string, times) {
        let repeatedString = '';
        while (times > 0) {
            repeatedString += string;
            times--;
        }
        return repeatedString;
    }
};
