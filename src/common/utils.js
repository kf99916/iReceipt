export default class Utils {
    padZero(number, size) {
        return ('000000000' + number).substr(-size);
    }
}
