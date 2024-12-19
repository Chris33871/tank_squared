// Linear Congruential Generator; simple pseudo-random number generator
// that will be used for 1D perline noise terrain generation
// pseudo-random numbers are numbers that may seem random, but aren't
export class LCG {
    constructor(seed) {
        // using the same seed will always produce the same output
        // a, c, and m are all constants
        // m needs to be large so that the period of the function is also large
        // therefore the function can generate a large amount of different pseudo-random
        // numbers before it repeats itself (2^32, and 2^64 are good examples)
        // a how the current state X_n influences the next state in the sequence X_n+1
        this.m = 2 ** 32;         // Modulus (determines the range of numbers that can be generated) 
        this.a = 1664525;         // Multiplier
        this.c = 1;      // Increment
        if (seed == undefined) {
            this.state = Math.floor(Math.random() * this.m);        // Initial seed
        } else {
            this.state = seed;        
        }
    }

    // Generate the next pseudo-random number
    next() {
        this.state = (this.a * this.state + this.c) % this.m;
        return (this.state / this.m - 0.5); // Normalize to range [0, 1]
    }
}
