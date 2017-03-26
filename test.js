const tests = [
    [0, 0],
    [180, 180],
    [360, 0],
    [90, 90],
    [270, 90]
];

function solve(input) {
    if (Math.abs(input) <= 180) return Math.abs(input);
    return solve(input - 360);
}

tests.forEach(([input, expected]) => {
    console.log(`${input} -> ${expected}:: ${solve(input)} ::: ${solve(input) === expected}`);
});