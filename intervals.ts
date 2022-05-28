const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

let includeIntervals;
let excludeIntervals;
let outputArray = [];

const checkIntervalInput = (inputIntervalArray) => {
  // Checks for every interval pair
  let isIntervalValid = true;
  inputIntervalArray.forEach((interval) => {
    // Check #1: Intervals separated by dash '-'
    if (!interval.includes("-")) {
      isIntervalValid = false;
    }
    const intervalPair = interval.split("-");
    // Check #2: Each interval pair has exactly 2 digits
    if (intervalPair.length !== 2) {
      isIntervalValid = false;
    }
    // Check #3: Both digits are numbers
    if (!Number(intervalPair[0]) || !Number(intervalPair[1])) {
      isIntervalValid = false;
    }
    // Check #4: Second digit is higher than the first
    if (Number(intervalPair[1]) <= Number(intervalPair[0])) {
      isIntervalValid = false;
    }
  });
  return isIntervalValid;
};

const getIntervalInput = async () =>
  await rl.question(
    "Please enter a set of include intervals separated by comma (x-y, w-z): ",
    (answer) => {
      try {
        const answerWithoutSpaces = answer.replace(/\s+/g, "");
        const intervalArray = answerWithoutSpaces.split(",");
        const isInputValid = checkIntervalInput(intervalArray);
        if (!isInputValid) {
          console.log("Invalid input.");
          rl.close();
        }
        includeIntervals = intervalArray;
        if (includeIntervals) {
          rl.question(
            "Please enter a set of exclude intervals separated by comma (x-y, w-z): ",
            (answer) => {
              try {
                const answerWithoutSpaces = answer.replace(/\s+/g, "");
                const intervalArray = answerWithoutSpaces.split(",");
                const isInputValid = checkIntervalInput(intervalArray);
                // Include possibility for empty exclude interval set
                if (answerWithoutSpaces !== "" && !isInputValid) {
                  console.log("Invalid input.");
                  rl.close();
                }
                excludeIntervals = intervalArray;
                getIntervalDifference(includeIntervals, excludeIntervals);
                rl.close();
              } catch (e) {
                console.log(e);
                rl.close();
              }
            }
          );
        }
      } catch (e) {
        console.log(e);
        rl.close();
      }
    }
  );

const getIntervalDifference = (includePairs, excludePairs) => {
  const startingDigitsForExclusion = excludePairs.map((el) => {
    return Number(el.split("-")[0]);
  });
  const excludeLengths = excludePairs.map((el) => {
    const excludePair = el.split("-");
    return excludePair[1] - excludePair[0];
  });
  // minMaxPair format: [minIntervalNumber, maxIntervalNumber]
  const minMaxPair = getMinMaxIntervals(includePairs);
  let outputPair = "";
  let filteredIncludePairs;
  let filteredExcludePairs;
  for (let i = minMaxPair[0]; i < Number(minMaxPair[1]) + 1; i++) {
    // Check #1: Number is not included
    filteredIncludePairs = includePairs.filter((pair) =>
      isNumberInsideInterval(i, pair)
    );
    if (!filteredIncludePairs.length > 0) {
      // If on including streak, add the previous digit as last and reset
      if (outputPair) {
        outputArray.push(outputPair + `${i - 1}`);
        outputPair = "";
      }
      continue;
    }
    // Check #2: Number is excluded
    filteredExcludePairs = excludePairs.filter((pair) =>
      isNumberInsideInterval(i, pair)
    );
    if (filteredExcludePairs.length > 0) {
      // If on including streak, add the previous digit as last and reset
      if (outputPair) {
        outputArray.push(outputPair + `${i - 1}`);
        outputPair = "";
      }
      continue;
    }
    // If output pair is empty, add the first digit
    if (outputPair === "") {
      outputPair = `${i}-`;
      continue;
    }
    // If on last iteration, add the last digit
    if (i === Number(minMaxPair[1])) {
      if (outputPair) {
        outputArray.push(outputPair + `${i}`);
        outputPair = "";
      }
    }
  }
  console.log(outputArray);
};

// Interval pair format (x-y) with x > y
const getMinMaxIntervals = (intervalPairs) => {
  let intervalNumbers = [];
  intervalPairs.forEach((pair) => {
    const pairArray = pair.split("-");
    intervalNumbers = [...intervalNumbers, ...pairArray];
  });
  // Sort with ascending order
  intervalNumbers.sort((a, b) => a - b);
  return [intervalNumbers[0], intervalNumbers[intervalNumbers.length - 1]];
};

const isNumberInsideInterval = (inputNumber, intervalPair) => {
  const destructuredPair = intervalPair.split("-");
  return (
    inputNumber >= destructuredPair[0] && inputNumber <= destructuredPair[1]
  );
};

getIntervalInput();
