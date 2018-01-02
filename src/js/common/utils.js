export default {
    padZero: function(number, size) {
        return ('000000000' + number).substr(-size);
    }
};
