import React from 'react-lite';
import ReactDOM from 'react-lite';
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
