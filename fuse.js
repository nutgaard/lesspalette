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

fuse.devServer(">index.js");