import React from 'react';
import ReactDOM from 'react-dom';
import Palette from "./palette";

function App() {
    return (
        <div>
            <h1>Palette</h1>
            <Palette />
        </div>
    );
}

ReactDOM.render(<App />, document.getElementById('root'));
