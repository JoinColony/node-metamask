// src: https://gist.github.com/jiggzson/b5f489af9ad931e3d186
const SCIENTIFIC_NUMBER_REGEX = /\d+\.?\d*e[\+\-]*\d+/i;

// Convert from scientific notation into a number
// e.g. from 9.99998934104e+21 to 9999989341040000000000
const scientificToDecimal = function(number) {
    let numberHasSign = number.startsWith("-") || number.startsWith("+");
    let sign = numberHasSign ? number[0] : "";
    number = numberHasSign ? number.replace(sign, "") : number;

    //if the number is in scientific notation remove it
    if (SCIENTIFIC_NUMBER_REGEX.test(number)) {
        let zero = '0';
        let parts = String(number).toLowerCase().split('e'); //split into coeff and exponent
        let e = parts.pop();//store the exponential part
        let l = Math.abs(e); //get the number of zeros
        let sign = e / l;
        let coeff_array = parts[0].split('.');

        if (sign === -1) {
            coeff_array[0] = Math.abs(coeff_array[0]);
            number = zero + '.' + new Array(l).join(zero) + coeff_array.join('');
        } else {
            let dec = coeff_array[1];
            if (dec) l = l - dec.length;
            number = coeff_array.join('') + new Array(l + 1).join(zero);
        }
    }

    return `${sign}${number}`;
};

module.exports = scientificToDecimal;