#!/usr/bin/env node

const program = require("commander"); //node.js command-line interfaces
const chalk = require("chalk"); //terminal string styling

// below uses commander package to take commands from the terminal
program
  .version("0.0.1")
  .command(
    "create <width> <height> <startColour> <endColour> [startColour_lastRow] [endColour_lastRow]"
  )
  .description(
    "Interview test app to produce colour ramp using inputted values"
  )
  .action((width, height, startColour, endColour, startColour_lastRow, endColour_lastRow) =>
    outputColourRamp(width, height, startColour, endColour, startColour_lastRow, endColour_lastRow)
  );

function rgbGenerator(num) {
  //the masks below take only the relevant bits for each colour
  const redMask = 0b1111100000000000;
  const greenMask = 0b0000011111100000;
  const blueMask = 0b0000000000011111;

  const R = (num & redMask) >> 11; // keep only red bits
  const G = (num & greenMask) >> 5; // keep only green bits
  const B = num & blueMask; // keep only blue bits
  return (rgbColour = { int: Math.round(num), R: R, G: G, B: B });
}

// used default arguments in case the optional colours are not specified 
function outputColourRamp(
  width,
  height,
  startColour,
  endColour, startColour_lastRow = startColour, 
  endColour_lastRow = endColour) {

  const colourRamp = [];
  const lastRow = [];
  
  // calculate the step change for each tile
  const substractor = (startColour - endColour) / (width - 1);
  const opSubstractor = (startColour_lastRow - endColour_lastRow) / (width -1)


  //initial row
  const firstRGB = rgbGenerator(startColour);
  const lastRGB = rgbGenerator(endColour);
  const rLast = lastRGB.R;
  const gLast = lastRGB.G;
  const bLast = lastRGB.B;

  // calculates step changes for each digit in RGB 
  const stepR = (firstRGB.R - lastRGB.R) / (width - 1);
  const stepG = (firstRGB.G - lastRGB.G) / (width - 1);
  const stepB = (firstRGB.B - lastRGB.B) / (width - 1);

  // extracts the rgb values
  let r = firstRGB.R;
  let g = firstRGB.G;
  let b = firstRGB.B;

  // the below does the same, but for the two optional colours - allowing to create the create the vertical step further down
  const firstRGB_lastRow = rgbGenerator(startColour_lastRow);
  const lastRGB_lastRow = rgbGenerator(endColour_lastRow);
  const rLast_lastRow = lastRGB_lastRow.R;
  const gLast_lastRow = lastRGB_lastRow.G;
  const bLast_lastRow = lastRGB_lastRow.B;

  const stepR_lastRow = (firstRGB_lastRow.R - lastRGB_lastRow.R) / (width - 1);
  const stepG_lastRow = (firstRGB_lastRow.G - lastRGB_lastRow.G) / (width - 1);
  const stepB_lastRow = (firstRGB_lastRow.B - lastRGB_lastRow.B) / (width - 1);

  let r2 = firstRGB_lastRow.R;
  let g2 = firstRGB_lastRow.G;
  let b2 = firstRGB_lastRow.B;

  let int = startColour;
  let int2 = startColour_lastRow;

  // starts the ramp using the inputted start colour
  colourRamp.push(firstRGB);
  lastRow.push(firstRGB_lastRow);

  // takes account of the width and create the colour ramp
  for (let i = 0; i < width - 2; i++) {
    r -= stepR;
    g -= stepG;
    b -= stepB;
    r2 -= stepR_lastRow;
    g2 -= stepG_lastRow;
    b2 -= stepB_lastRow;
    int -= substractor;
    int2 -= opSubstractor;
    colourRamp.push({
      int: Math.round(int),
      R: Math.round(r),
      G: Math.round(g),
      B: Math.round(b),
    });
    lastRow.push({
      int: Math.round(int2),
      R: Math.round(r2),
      G: Math.round(g2),
      B: Math.round(b2),
    });
  };

  //ensures the last tile is always the input end colour
  colourRamp.push({
    int: Math.round(endColour),
    R: Math.round(rLast),
    G: Math.round(gLast),
    B: Math.round(bLast),
  });

  lastRow.push({
    int: Math.round(endColour_lastRow),
    R: Math.round(rLast_lastRow),
    G: Math.round(gLast_lastRow),
    B: Math.round(bLast_lastRow),
  });

  // initilise which will be the output string
  let output = '';
  const outputs = [];
  
  // first row copied to out, this is to get the original explicity stated colours intially 
  // uses chalk package to style the output depending on the current rgb value
  // concats each tile, using chalk for each specific tile
  colourRamp.forEach((colour) => {
    output += chalk
      .rgb(colour.R, colour.G, colour.B)
      .inverse(" " + colour.int + " ");
  });
  outputs.push(output);

  /*  first, cycle through the required rows to output the correct height 
      then create the next row using the colourRamp array
      here is where the step is created - works out the percentage difference between the opposite number i.e. the one with the same index, on the last row, its "opposite"
      each time the step is cumlated and applied for the values, giving the correct mix
      a count variable is required to give the cumulated total as each row is added. 
  */
  let count = 1;
  for (let i = 0; i < height - 1; i++) {
    output = '';
    colourRamp.forEach((colour, index) => {
      let stepPercent = ((colour.int - lastRow[index].int) / colour.int) / (height - 1)
      if (isNaN(stepPercent) || !isFinite(stepPercent)) {stepPercent = 0}
      output += chalk
        .rgb(Math.round(colour.R - (colour.R * (stepPercent * count))), Math.round(colour.G - (colour.G * (stepPercent * count))), Math.round(colour.B - (colour.B * (stepPercent * count))))
        .inverse(" " + Math.round(colour.int - (colour.int * (stepPercent * count))) + " ");
    });
    outputs.push(output)
    count += 1;
  }

  // gives the required height to the ramp
  outputs.forEach(output => {
    const parsedOutput = output;
    console.log(parsedOutput);
  })
};

program.parse(process.argv);