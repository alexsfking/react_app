import React from 'react';
import { Link } from 'react-router-dom';
import seedrandom from 'seedrandom';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const normal_data_array: string[][] = [
  ['Card drafting', 'Mining operations', 'Victory points', 'Colonies', 'Red planet'],
  ['Disaster', 'HBO', 'Exclusion Zone', 'Cover-up', 'Craig Mazin'],
  ['Linguistics', 'Extraterrestrial', 'Amy Adams', 'Nonlinear storytelling', 'Human experience'],
  ['Orphans', 'Grace Field', 'Emma', 'Mother', 'Disturbing truth'],
  ['Collapse', 'Societal Evolution', 'Terminus', 'Time Jumps', 'Survival']
];
const hidden_data_array: string[] = ['Mining operations', 'Disaster', 'Extraterrestrial', 'Mother', 'Survival'];

let data_key_record: Record<string,number[]>={};

function create_data_key_record(normal_arr:string[][],hidden_arr:string[]){
  data_key_record={};
  for(let row=0;row<normal_arr.length;row++){
    for(let col=0;col<normal_arr[0].length;col++){
      const key:string = normal_arr[row][col];
      if (!data_key_record.hasOwnProperty(key)) {
        data_key_record[key] = [];
      }
      data_key_record[key].push(row)
    }
  }
  for(let col=0;col<normal_arr[0].length;col++){
    const key:string = hidden_arr[col];
    if (!data_key_record.hasOwnProperty(key)) {
      data_key_record[key] = [];
    }
    data_key_record[key].push(normal_arr.length)
  }
}

function find_max_key_value_pair<T>(some_record: Record<number, number>): [T, number] {
  const [max_key, max_value] = Object.entries(some_record).reduce(
    ([prev_key, prev_value], [current_key, current_value]) => {
      if (current_value > prev_value) {
        return [current_key, current_value];
      } else {
        return [prev_key, prev_value];
      }
    },
    ['', Number.NEGATIVE_INFINITY]
  );
  return [max_key as T, max_value];
}

function create_seed(normal_arr:string[][],hidden_arr:string[],additional:string):string{
  const flat_array:any[]=normal_arr.flat()
  const long_string: string = flat_array.join('') + additional + hidden_arr.join('');
  return long_string
}

// Function to shuffle the array randomly
function shuffle_array(array: any[][], seed:string): any[] {
  const flat_array:any[]=array.flat()
  seed=create_seed(normal_data_array,hidden_data_array,seed)
  //console.log(seed)
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

interface SquareProps {
  text: string;
  rowIndex: number;
  colIndex: number;
  handleDrop: (item: any, targetRowIndex: number, targetColIndex: number) => void;
  isMatching?: boolean; 
}

function Square({ text, rowIndex, colIndex, handleDrop, isMatching }: SquareProps): React.ReactElement {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'square',
      item: { rowIndex, colIndex },
      collect: (monitor: DragSourceMonitor) => ({
        isDragging: monitor.isDragging(),
      }),
    }),
    []
  );


  const [, dropRef] = useDrop({
    accept: 'square',
    drop: (item) => handleDrop(item, rowIndex, colIndex),
  });

  const opacity = isDragging ? 0.5 : 1;
  const squareSize = 120;

  const squareStyle: React.CSSProperties = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
    border: '1px solid black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    opacity,
    background: isMatching ? 'yellow' : 'transparent', // Apply yellow background for matching squares
  };

  return (
    <div ref={dropRef}>
      <div ref={dragRef} style={squareStyle}>
        {text}
      </div>
    </div>
  );
}

function Original():React.ReactElement{
  const gridSize = 5;
  const squareSize = 120;

  const [squares, setSquares] = React.useState(() => {
    const shuffled_data_array: string[][] = shuffle_array(normal_data_array, 'myseed124');
    return shuffled_data_array;
  });

  //create the answer key record
  create_data_key_record(normal_data_array, hidden_data_array)

  const handleDrop = (item:any, targetRowIndex:number, targetColIndex:number) => {
    const { rowIndex: sourceRowIndex, colIndex: sourceColIndex } = item;

    const newSquares = [...squares];
    const sourceText = newSquares[sourceRowIndex][sourceColIndex];
    newSquares[sourceRowIndex][sourceColIndex] = newSquares[targetRowIndex][targetColIndex];
    newSquares[targetRowIndex][targetColIndex] = sourceText;

    setSquares(newSquares);

    console.log(data_key_record)
      // Check rows for matching elements
    for (let row = 0; row < gridSize; row++) {
      const counting_record: Record<number,number>={};
      for (let col = 0; col < gridSize; col++) {

        const key: keyof typeof data_key_record = newSquares[row][col];
        const answer_row:number[]|undefined = data_key_record.hasOwnProperty(key) ? [...data_key_record[key]] : undefined;
        if (answer_row === undefined) {
          console.log("answer_row is undefined. Ending the program.");
          throw new Error("answer_row is undefined");
        } else {
          console.log("answer_row:",answer_row)
        }
        for(const ans of answer_row){
          if (counting_record.hasOwnProperty(ans)) {
            counting_record[ans]++;
          } else {
            counting_record[ans]=1;
          }
        }
      }
      //colour matches
      const [max_key, max_value] = find_max_key_value_pair(counting_record)
      if(max_value===5){
        //colour the row
        console.log("colour",max_key,max_value,counting_record)
      } else if (max_value>2){
        //highlight the row yellow
        console.log("highlight",max_key,max_value,counting_record)
      } else {
        console.log("else",max_key,max_value,counting_record)
      }

    }
  };

  const gridStyle:React.CSSProperties = {
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

  return (
    <div>
      <h1>Grid Page</h1>
      <div style={outerStyle}>
        <div style={gridStyle}>{squares.map((row, rowIndex) =>
            row.map((text, colIndex) => (
              <Square
                key={`${rowIndex}-${colIndex}`}
                text={text}
                rowIndex={rowIndex}
                colIndex={colIndex}
                handleDrop={handleDrop}
              />
            ))
          )}
        </div>
      </div>
      <div>
        <Link to="/">Go back to Main Page</Link>
      </div>
    </div>
  );
};

export default Original;
