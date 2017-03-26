const isBuild = process.argv[2] === 'build';

const { FuseBox, CSSPlugin, SassPlugin, RawPlugin, BabelPlugin } = require("fuse-box");


// Create FuseBox Instance
let fuse = new FuseBox({
    homeDir: "src/",
    sourcemaps: true,
    outFile: "./build/out.js",
    plugins: [
        [SassPlugin(), CSSPlugin()],
        RawPlugin(['.less']),
        BabelPlugin(),
    ]
});

if (isBuild) {
    fuse.bundle(">index.js");
} else {
    fuse.devServer(">index.js");
}
