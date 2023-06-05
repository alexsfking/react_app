import React from 'react';
import { Link } from 'react-router-dom';
import seedrandom from 'seedrandom';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
//import { HTML5Backend } from 'react-dnd-html5-backend';

const normal_data_array: string[][] = [
  ['Card drafting', 'Mining operations', 'Victory points', 'Colonies', 'Red planet'],
  ['Disaster', 'HBO', 'Exclusion Zone', 'Cover-up', 'Craig Mazin'],
  ['Linguistics', 'Extraterrestrial', 'Amy Adams', 'Nonlinear storytelling', 'Human experience'],
  ['Orphans', 'Grace Field', 'Emma', 'Mother', 'Disturbing truth'],
  ['Collapse', 'Societal Evolution', 'Terminus', 'Time Jumps', 'Survival']
];
const hidden_data_array: string[] = ['Mining operations', 'Disaster', 'Extraterrestrial', 'Mother', 'Survival'];

const colors_data_record: Record<number, string> = {
  0: "#50BFE6", //blizzard blue
  1: "#FF355E", //radical red
  2: "#66FF66", //screaming green
  3: "#FF00CC", //hot magenta
  4: "#FF9933", //neon carrot
  5: "silver",
};

const default_color='#F6F6F6';
const highlight_color='yellow';
const special_color=colors_data_record[5];

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
  color?: string; // Add color prop
  borderColor?: string;

  // keep track of what colours each square has
  color_list?: string[];

}

function Square({ text, rowIndex, colIndex, handleDrop, isMatching, color, borderColor, color_list }: SquareProps): React.ReactElement {
  const [{ isDragging }, dragRef] = useDrag(
    () => ({
      type: 'square',
      item: { rowIndex, colIndex },
      collect: (monitor: DragSourceMonitor) => {
        console.log('isDragging:', monitor.isDragging());
        return {
          isDragging: monitor.isDragging(),
        };
      },
    }),
    []
  );


  const [, dropRef] = useDrop({
    accept: 'square',
    drop: (item) => {
      console.log('Drop event:', item, rowIndex, colIndex);
      handleDrop(item, rowIndex, colIndex);
    }
  });

  const opacity = isDragging ? 0.5 : 1;
  const squareSize = 120;

  const squareStyle: React.CSSProperties = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    opacity,
    fontSize: '16px',
    fontWeight: 'bold',
    backgroundColor: isMatching ? highlight_color : color || default_color, // Apply the specified color or default to transparent
    borderColor: isMatching ? highlight_color : borderColor || default_color, // Add borderColor
    borderTop: 'none', // Add separate border properties
    borderRight: 'none',
    borderLeft: 'none',
    borderRadius: '8%',
    boxShadow: `inset 0 0 5px rgba(0, 0, 0, 0.3),
                0px 0px 5px rgba(0, 0, 0, 0.3)`,
    margin: '5px',
    borderBottom: '5px solid rgba(0, 0, 0, 0.3)', // Add small border at the bottom

  };

  console.log('Square props:', { text, rowIndex, colIndex, handleDrop, isMatching, color });

  return (
    <div ref={dropRef}>
      <div ref={dragRef} style={squareStyle} draggable={true}>
        {text}
      </div>
    </div>
  );
}

function Original():React.ReactElement{
  const gridSize = 5;
  const squareSize = 120;

  interface SquareData {
    text: string;
    color?: string;
    border_color?: string;

    // keep track of what colours each square has
    color_list?: string[];
  }

  const [squares, set_squares] = React.useState<SquareData[][]>(() => {
    const shuffled_data_array: string[][] = shuffle_array(normal_data_array, 'myseed124');
    const squareDataArray: SquareData[][] = shuffled_data_array.map(row => row.map(text => ({ text })));
    return squareDataArray;
  });

  //create the answer key record
  create_data_key_record(normal_data_array, hidden_data_array)

  const clear_colors = (newSquares: any[]) => {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newSquares[row][col] = {
          text: newSquares[row][col].text,
          color: default_color,
          borderColor: default_color,
          color_list: [],
        };
      }
    }
  };

  function check_rows_for_matching_elements(newSquares: SquareData[][]) {
    for (let row = 0; row < gridSize; row++) {
      const counting_record: Record<number, number> = {};
      for (let col = 0; col < gridSize; col++) {

        const key: keyof typeof data_key_record = newSquares[row][col].text;
        const answer_row: number[] | undefined = data_key_record.hasOwnProperty(key) ? [...data_key_record[key]] : undefined;
        if (answer_row === undefined) {
          console.log("answer_row is undefined. Ending the program.");
          throw new Error("answer_row is undefined");
        } else {
          console.log("answer_row:", answer_row);
        }
        for (const ans of answer_row) {
          if (counting_record.hasOwnProperty(ans)) {
            counting_record[ans]++;
          } else {
            counting_record[ans] = 1;
          }
        }
      }
      //colour matches - row
      const [max_key, max_value] = find_max_key_value_pair<number>(counting_record);
      if (max_value === 5) {
        //colour the row
        color_row(newSquares, row, max_key);
        console.log("colour", max_key, max_value, counting_record);
      } else if (max_value > 2) {
        //highlight the row yellow
        highlight_row(newSquares, row, max_key);
        console.log("highlight", max_key, max_value, counting_record);
      } else {
        //do nothing
        console.log("else", max_key, max_value, counting_record);
      }

    }
  }

  function check_columns_for_matching_elements(newSquares: SquareData[][]) {
    for (let col = 0; col < gridSize; col++) {
      const counting_record: Record<number, number> = {};
      for (let row = 0; row < gridSize; row++) {
        const key: keyof typeof data_key_record = newSquares[row][col].text;
        const answer_row: number[] | undefined = data_key_record.hasOwnProperty(key) ? [...data_key_record[key]] : undefined;
        if (answer_row === undefined) {
          console.log("answer_row is undefined. Ending the program.");
          throw new Error("answer_row is undefined");
        } else {
          console.log("answer_row:", answer_row);
        }
        for (const ans of answer_row) {
          if (counting_record.hasOwnProperty(ans)) {
            counting_record[ans]++;
          } else {
            counting_record[ans] = 1;
          }
        }
      }

      //colour matches - col
      const [max_key, max_value] = find_max_key_value_pair<number>(counting_record);
      if (max_value === 5) {
        //colour the column
        color_column(newSquares, col, max_key);
        console.log("colour", max_key, max_value, counting_record);
      } else if (max_value > 2) {
        //highlight the column yellow
        highlight_column(newSquares, col, max_key);
        console.log("highlight", max_key, max_value, counting_record);
      } else {
        //do nothing
        console.log("else", max_key, max_value, counting_record);
      }
    };
  }

  const color_row = (newSquares: any[], row: number, color: number) => {
    newSquares[row].forEach((_:number, col:number) => {
      newSquares[row][col].color_list.push(colors_data_record[color]);
      newSquares[row][col] = {
        text: newSquares[row][col].text,
        color_list: newSquares[row][col].color_list,
      };
    });
  };
  
  const highlight_row = (newSquares: any[], row: number, highlightValue: number) => {
    newSquares[row].forEach((_:number, col:number) => {
      const key: keyof typeof data_key_record = newSquares[row][col].text;
      const answer_row: number[] | undefined = data_key_record.hasOwnProperty(key) ? [...data_key_record[key]] : undefined;
      if (answer_row === undefined) {
        console.log("answer_row is undefined. Ending the program.");
        throw new Error("answer_row is undefined");
      }
      if (answer_row.map(String).includes(String(highlightValue))) {
        newSquares[row][col].color_list.push(highlight_color);
        newSquares[row][col] = {
          text: newSquares[row][col].text,
          color_list: newSquares[row][col].color_list,
        }
      }
    });
  };

  const color_column = (newSquares: any[], col: number, color: number) => {
    newSquares.forEach((row: any[]) => {
      row[col].color_list.push(colors_data_record[color]);
      row[col] = {
        text: row[col].text,
        color_list: row[col].color_list,
      };
    });
  };

  const highlight_column = (newSquares: any[], col: number, highlightValue: number) => {
    newSquares.forEach((row: any[]) => {
      const key: keyof typeof data_key_record = row[col].text;
      const answer_column: number[] | undefined = data_key_record.hasOwnProperty(key) ? [...data_key_record[key]] : undefined;
      if (answer_column === undefined) {
        console.log("answer_column is undefined. Ending the program.");
        throw new Error("answer_column is undefined");
      }
      if (answer_column.map(String).includes(String(highlightValue))) {
        row[col].color_list.push(highlight_color);
        row[col] = {
          text: row[col].text,
          color_list: row[col].color_list,
        }
      }
    });
  };

  function color_all_squares(newSquares: SquareData[][]) {
    for (let row:number = 0; row < gridSize; row++) {
      for (let col:number = 0; col < gridSize; col++) {
        let top:string = default_color;
        let bot:string = default_color;
        let color_array:string[]=newSquares[row][col].color_list ?? [];
        if(color_array && color_array.length!==0){
          if(color_array.length===1){
            top=color_array[0];
            bot=default_color;
          } else if (color_array.length>1){
            if(color_array.map(String).includes(String(special_color))){
              top=special_color;
              bot = color_array.find((color) => color !== default_color && color !== special_color) ?? default_color;
            } else {
              top = color_array.find((color) => color !== default_color) ?? default_color;
              bot = color_array.find((color) => color !== default_color && color !== top) ?? default_color;
            }
          }
        }
        console.log("color_all_squares ", top, bot, newSquares[row][col])
        const colors_data_record_values:string[] = Object.values(colors_data_record);
        if(bot!==default_color || bot!==special_color || !colors_data_record_values.includes(bot)){
          console.log("strange error ",top,bot);
          bot=default_color;
        }
        newSquares[row][col] = {
          text: newSquares[row][col].text,
          color: top,
          border_color: bot,
        }
      }
    }
  }

  const handleDrop = (item:any, targetRowIndex:number, targetColIndex:number) => {
    
    console.log('handleDrop called');
    console.log('item:', item);
    console.log('targetRowIndex:', targetRowIndex);
    console.log('targetColIndex:', targetColIndex);

    const { rowIndex: sourceRowIndex, colIndex: sourceColIndex } = item;

    const newSquares = [...squares];
    const sourceText = newSquares[sourceRowIndex][sourceColIndex];
    newSquares[sourceRowIndex][sourceColIndex] = newSquares[targetRowIndex][targetColIndex];
    newSquares[targetRowIndex][targetColIndex] = sourceText;

    set_squares(newSquares);

    //remove all colours
    clear_colors(newSquares);

    console.log(data_key_record)

    // Check rows for matching elements
    check_rows_for_matching_elements(newSquares);

    //match columns
    check_columns_for_matching_elements(newSquares);

    //
    color_all_squares(newSquares);
  };

  const gridStyle:React.CSSProperties = {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    width: `${gridSize * squareSize+50}px`,
  };

  const outerStyle:React.CSSProperties = {
    display: 'flex',
    justifyContent: 'center',
    width:'100%',
  };

  console.log("squares: ",squares)

  return (
    <div>
      <h1>Grid Page</h1>
      <div style={outerStyle}>
        <div style={gridStyle}>
          {squares.map((row, rowIndex) =>
            row.map((square, colIndex) => (
              <Square
                key={`${rowIndex}-${colIndex}`}
                text={square.text}
                rowIndex={rowIndex}
                colIndex={colIndex}
                handleDrop={handleDrop}
                color={square.color}
                borderColor={square.border_color}
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
