import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import seedrandom from 'seedrandom';
import { useDrag, useDrop, DragSourceMonitor } from 'react-dnd';
import ModeToggleButton from './light_dark_mode_toggle';
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
  0: '#50BFE6', //blizzard blue
  1: '#FF355E', //radical red
  2: '#66FF66', //screaming green
  3: '#FF00CC', //hot magenta
  4: '#FF9933', //neon carrot
  5: 'linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 1))',
};

const default_color='#F6F6F6';
const default_border_color='#bdbdbd';
const highlight_color='yellow';
const special_color=colors_data_record[5];

const row_to_clue_name_record: Record<number, string> = {
  0: 'Terraforming Mars', //blizzard blue
  1: 'Chernobyl', //radical red
  2: 'Arrival', //screaming green
  3: 'Promised Neverland', //hot magenta
  4: 'Foundation', //neon carrot
  5: 'Alien',
};

let clues_solved:number=0;
let revealed_clues:{ clue_number: number, clue_name: string }[] = [];

class Clue {
  private clue_number: number;
  private color: string;
  private cards: string[];
  private solved: boolean;
  private clue_name: string;

  constructor(clue_number: number, color: string, cards: string[], clue_name:string) {
    this.clue_number = clue_number;
    this.color = color;
    this.cards = cards;
    this.clue_name=clue_name;
    this.solved = false;
  }

  get clueNumber(): number {
    return this.clue_number;
  }

  set clueNumber(value: number) {
    this.clue_number = value;
  }

  get clueColor(): string {
    return this.color;
  }

  set clueColor(value: string) {
    this.color = value;
  }

  get clueCards(): string[] {
    return this.cards;
  }

  set clueCards(value: string[]) {
    this.cards = value;
  }

  get isSolved(): boolean {
    return this.solved;
  }

  markAsSolved(): void {
    this.solved = true;
  }

  markAsUnsolved(): void {
    this.solved = false;
  }
}

class ClueStorage {
  private clues:Clue[];

  constructor() {
    this.clues=[]
    for (let i = 0; i < normal_data_array.length; i++) {
      let row:string[] = normal_data_array[i];
      let clue_number:number = i;
      let color:string = colors_data_record[clue_number];
      let cards:string[] = row.slice();
      let name:string = row_to_clue_name_record[clue_number];
      const clue:Clue=new Clue(clue_number,color,cards,name);
      this.addClue(clue);
    }
    
    const clue_number:number = normal_data_array.length;
    const color:string = colors_data_record[clue_number];
    const cards:string[] = hidden_data_array.slice();
    const name:string = row_to_clue_name_record[clue_number];
    const clue:Clue=new Clue(clue_number,color,cards,name);
    this.addClue(clue);
  }

  addClue(clue: Clue): void {
    this.clues.push(clue);
  }

  removeClue(clue: Clue): void {
    const index = this.clues.indexOf(clue);
    if (index !== -1) {
      this.clues.splice(index, 1);
    }
  }

  getClues(): Clue[] {
    return this.clues;
  }

  getUnsolvedClues(): Clue[] {
    return this.clues.filter((clue) => !clue.isSolved);
  }

  getSolvedClues(): Clue[] {
    return this.clues.filter((clue) => clue.isSolved);
  }

  getNumSolvedClues(): number {
    return this.clues.filter((clue) => clue.isSolved).length;
  }

  getAllSolved(): boolean {
    return this.clues.every((clue) => clue.isSolved);
  }

  setSolved(card:string,color:string):void{
    const clues:Clue[]=this.getUnsolvedClues();
    for (const clue of clues) {
      if(clue.clueColor === color && clue.clueCards.includes(card)){
        clue.markAsSolved()
        return;
      }
    }
  }

  setUnsolved(card:string):void{
    const clues:Clue[]=this.getClues();
    for (const clue of clues) {
      if(clue.clueCards.includes(card)){
        clue.markAsUnsolved();
        return;
      }
    }
  }

  setAllUnsolved():void{
    const clues: Clue[] = this.getClues();
    for (const clue of clues) {
      clue.markAsUnsolved();
    }
  }

  revealClue(card:string, color:string):void{
    const clues:Clue[]=this.getClues();
    for (const clue of clues) {
      if(clue.clueColor===color && clue.clueCards.includes(card)){
        const revealedClue = {
          clue_number: clue.clueNumber,
          clue_name: row_to_clue_name_record[clue.clueNumber]
        };
        if(!revealed_clues.some(clueObj => clueObj.clue_number === revealedClue.clue_number)) {
          revealed_clues.push(revealedClue);
        }
        return;
      }
    }
  }

  hideClue(card:string, color:string):void{
    const clues:Clue[]=this.getClues();
    for (const clue of clues) {
      if(clue.clueColor===color && clue.clueCards.includes(card)){
        const index = revealed_clues.findIndex(clueObj => clueObj.clue_number === clue.clueNumber);
        if (index !== -1) {
          revealed_clues.splice(index, 1);
        }
        return;
      }
    }
  }
}


//swap counter
const max_swaps:number = 30;
let swap_count:number = 0;
let remaining_swaps:number = max_swaps;

let data_key_record: Record<string,number[]>={};

//swap counter
function increment_swaps(){
  swap_count++;
}

function is_max_swaps(){
  if(remaining_swaps<=0){
    return true;
  } else {
    return false;
  }
}

function calculate_remaining_swaps(){
  remaining_swaps=max_swaps-swap_count;
}

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
  borderBottomColor?: string;

  // keep track of what colours each square has
  color_list?: string[];

}

function Square({ text, rowIndex, colIndex, handleDrop, isMatching, color, borderBottomColor, color_list }: SquareProps): React.ReactElement {
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
    background: isMatching ? highlight_color : color || default_color, // Apply the specified color or default to transparent
    borderTop: 'none', // Add separate border properties
    borderRight: 'none',
    borderLeft: 'none',
    borderRadius: '8%',
    boxShadow: `inset 0 0 5px rgba(0, 0, 0, 0.3),
                0px 0px 5px rgba(0, 0, 0, 0.3)`,
    margin: '5px',
    borderBottomWidth: '5px',
    borderBottomStyle: 'solid',
    borderBottomColor: borderBottomColor !== undefined ? borderBottomColor : default_border_color,

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

function RevealedCluesComponent(): React.ReactElement {
  const [revealedClues, setRevealedClues] = useState<{ clue_number: number; clue_name: string }[]>([
    { clue_number: 0, clue_name: 'Hidden' },
    { clue_number: 1, clue_name: 'Hidden' },
    { clue_number: 2, clue_name: 'Hidden' },
    { clue_number: 3, clue_name: 'Hidden' },
    { clue_number: 4, clue_name: 'Hidden' },
    { clue_number: 5, clue_name: 'Hidden' },
  ]);
  // Add any additional logic or functions related to the component here

  const hidden:React.CSSProperties = {
    display: 'none',
  };

  return (
    <div>
    <h2>Revealed Clues</h2>
    <ul>
      {revealedClues.map((clue) => (
        <li key={clue.clue_number} style={clue.clue_name === 'Hidden' ? hidden : {}}>
          Clue #{clue.clue_number}: {clue.clue_name}
        </li>
      ))}
    </ul>
  </div>
  );
}


function Original():React.ReactElement{
  const gridSize = 5;
  const squareSize = 120;

  //light dark toggle.
  const [isDarkMode, setIsDarkMode] = useState(true);
  const handleModeToggle = () => {
    setIsDarkMode(!isDarkMode);
  };

  interface SquareData {
    text: string;
    color?: string;
    border_bottom_color?: string;

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

  //create clue classes
  const clue_storage:ClueStorage=new ClueStorage();

  const clear_colors = (newSquares: any[]) => {
    //clue_storage.setUnsolved();
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        newSquares[row][col] = {
          text: newSquares[row][col].text,
          color: default_color,
          borderBottomColor: default_color,
          color_list: [],
        };
      }
    }
  };

  function check_for_special_color(newSquares: SquareData[][]):boolean {
    for (let row = 0; row < gridSize; row++) {
      for (let col = 0; col < gridSize; col++) {
        if(newSquares[row][col].color===special_color){
          return true;
        }
      }
    }
    return false;
  }

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
        let bot:string = default_border_color;
        let color_array:string[]=newSquares[row][col].color_list ?? [];
        if(color_array && color_array.length!==0){
          if(color_array.length===1){
            top=color_array[0];
            bot=default_color;
          } else if (color_array.length>1){
            if(color_array.map(String).includes(String(special_color))){
              top=special_color;
              bot = color_array.find((color) => color !== default_color && color !== special_color) ?? default_border_color;
            } else {
              top = color_array.find((color) => color !== default_color) ?? default_color;
              bot = color_array.find((color) => color !== default_color && color !== top) ?? default_border_color;
            }
          }
        }
        console.log("color_all_squares ", top, bot, newSquares[row][col])
        const colors_data_record_values:string[] = Object.values(colors_data_record);
        if(bot!==default_border_color && bot!==special_color && bot!==highlight_color && !colors_data_record_values.includes(bot)){
          console.log("strange error ",top,bot);
          bot=default_border_color;
        }
        if(top!==default_color && top!==highlight_color){
          clue_storage.setSolved(newSquares[row][col].text,top);
          clue_storage.revealClue(newSquares[row][col].text,top);
        } else {
          clue_storage.setUnsolved(newSquares[row][col].text);
          if(!check_for_special_color(newSquares)){
            clue_storage.hideClue(newSquares[row][col].text,special_color);
          } else {
            //get the first color of two possible colours (the second can only be special_colour)
            const colour_array:number[]=data_key_record[newSquares[row][col].text];
            clue_storage.hideClue(newSquares[row][col].text,colors_data_record[colour_array[0]]);
          }
        }
        clues_solved=clue_storage.getNumSolvedClues();
        newSquares[row][col] = {
          text: newSquares[row][col].text,
          color: top,
          border_bottom_color: bot,
        }
      }
    }
  }

  const handleDrop = (item:any, targetRowIndex:number, targetColIndex:number) => {
    
    console.log('handleDrop called');
    console.log('item:', item);
    console.log('targetRowIndex:', targetRowIndex);
    console.log('targetColIndex:', targetColIndex);

    if(is_max_swaps()){
      console.log("Finished");
      return;
    }
    increment_swaps();
    calculate_remaining_swaps();

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
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%',
  };

  const containerStyle:React.CSSProperties ={
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    width:'100%',
  };

  const clueSwapContainerStyle:React.CSSProperties = {
    //position: 'relative', // Add relative positioning
    display: 'flex',
    //flexDirection: 'row',
    //alignItems:'revert',
    //justifyContent: 'flex-end',
    //alignItems: 'center',
    //marginTop: '16px', // Add margin-top to create space between the grids and the clue container
    width: '100%',
  };

  const clueSolvedStyle:React.CSSProperties = {
    display: 'flex',
    //flexDirection: 'row',
    //alignItems: 'flex-start',
    flexGrow: 1,
    justifyContent: 'center',
    width: '100%',
    //display: 'flex',
    //justifyContent: 'center',
    //alignItems: 'center',
  };

  const swapStyle:React.CSSProperties = {
    display: 'flex',
    //flexDirection: 'row',
    //alignItems: 'flex-end', /* Align swaps to the right */
    justifyContent: 'center',
    width: '100%',
    //display: 'flex',
    //justifyContent: 'center',
    //alignItems: 'center',
  };

  const clueRevealContainerStyle:React.CSSProperties = {
    display: 'flex',
    width: '100%',
  };

  const clueRevealStyle:React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    width: '100%',
  };

  console.log("squares: ",squares)

  return (
    <div className={isDarkMode ? 'dark-mode' : 'light-mode'}>
      <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
        <ModeToggleButton isDarkMode={isDarkMode} onToggle={handleModeToggle} />
      </div>
      <h1>Grid</h1>
      <div style={outerStyle}>
        <div style={containerStyle}>
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
                  borderBottomColor={square.border_bottom_color}
                />
              ))
            )}
          </div>
          <div style={clueSwapContainerStyle}>
            <div style={clueSolvedStyle}>
                <h2>Clues: {clues_solved}/6</h2>
            </div>
            <div style={swapStyle}>
                <h2>Swaps: {remaining_swaps}</h2>
            </div>
          </div>
          <div style={clueRevealContainerStyle}>
            <div style={clueRevealStyle}>
              <RevealedCluesComponent />
            </div>
          </div>
        </div>
      </div>
      <div>
        <Link to="/">Go back to Main Page</Link>
      </div>
    </div>
  );


};

export default Original;
