import StyleCalculator from '../src/util/StyleCalculator';

// .\node_modules\.bin\tsc  --resolveJsonModule --esModuleInterop scripts\calc.ts && node scripts\calc.js

console.log("start");
const start = new Date();

for (let power = 0; power < 2_000_000; power += 100_000) {
    const calc = new StyleCalculator(4, "ミニリュウ");
    const expect = calc.calculate(power / 100, 100)
        .reduce((p, c, i) => p + c.foundCount * c.probability, 0);
    console.log(`${power}\t${expect}`);
}

for (let power = 2_000_000; power < 80_000_000; power += 1_000_000) {
    const calc = new StyleCalculator(4, "ミニリュウ");
    const expect = calc.calculate(power / 100, 100)
        .reduce((p, c, i) => p + c.foundCount * c.probability, 0);
    console.log(`${power}\t${expect}`);
}
const end = new Date();
console.log("done", (end.getTime() - start.getTime()) / 1000);
