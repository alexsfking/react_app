import React from 'react';
import { Link } from 'react-router-dom';

function Original(){
  const gridSize = 5;
  const squareSize = 120;

  const squareStyle:React.CSSProperties = {
    width: `${squareSize}px`,
    height: `${squareSize}px`,
    border: '1px solid black',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
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

  const squares = [];

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const text = `${i}-${j}`;

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
