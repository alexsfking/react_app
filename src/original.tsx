import React from 'react';
import { Link } from 'react-router-dom';
import seedrandom from 'seedrandom';

const normal_data_array: string[][] = [
  ['Card drafting', 'Mining operations', 'Victory points', 'Colonies', 'Red planet'],
  ['Disaster', 'HBO', 'Exclusion Zone', 'Cover-up', 'Craig Mazin'],
  ['Linguistics', 'Extraterrestrial', 'Amy Adams', 'Nonlinear storytelling', 'Human experience'],
  ['Orphans', 'Grace Field', 'Emma', 'Mother', 'Disturbing truth'],
  ['Collapse', 'Societal Evolution', 'Terminus', 'Time Jumps', 'Survival']
];
const hidden_data_array: string[] = ['Mining operations', 'Disaster', 'Extraterrestrial', 'Mother', 'Survival'];

// Function to shuffle the array randomly
function shuffle_array(array: any[][], seed:string): any[] {
  const flat_array:any[]=array.flat()
  const rng:seedrandom.PRNG = seedrandom(seed);

  for (let i = flat_array.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [flat_array[i], flat_array[j]] = [flat_array[j], flat_array[i]];
  }

  const reshaped_array: any[][] = [];
  let current_index:number = 0;
  for (let i = 0; i < array.length; i++) {
    const row:any[] = [];
    for (let j = 0; j < array[i].length; j++) {
      row.push(flat_array[current_index]);
      current_index++;
    }
    reshaped_array.push(row);
  }
  return reshaped_array;
}



function Original():React.ReactElement{
  const gridSize = 5;
  const squareSize = 120;

  const squareStyle:React.CSSProperties = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
    border: '1px solid black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  };

  const innerStyle:React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: `${gridSize * squareSize+10}px`,
  };

  const outerStyle:React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width:'100%',
  };

  const shuffled_data_array: string[][] = shuffle_array(normal_data_array, 'myseed124');

  const squares = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      //const text = `${i}-${j}`;
      const text = shuffled_data_array[i][j];

      squares.push(
        <div key={`${i}-${j}`} style={squareStyle}>
          {text}
        </div>
      );
    }
  }

  return (
    <div>
      <h1>Grid Page</h1>
      <div style={outerStyle}>
        <div style={innerStyle}>{squares}</div>
      </div>
      <div>
        <Link to="/">Go back to Main Page</Link>
      </div>
    </div>
  );
};

export default Original;
