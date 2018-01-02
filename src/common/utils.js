export default {
    padZero(number, size) {
        return ('000000000' + number).substr(-size);
    }
};
