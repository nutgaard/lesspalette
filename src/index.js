/** @jsx preact.h */
import preact from 'preact';
import Palette from "./palette";

function App() {
    return (
        <div>
            <h1>Palette</h1>
            <Palette />
        </div>
    );
}

preact.render(<App />, document.getElementById('root'));
