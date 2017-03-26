import React, {PureComponent} from "react";
import lessvars from "lessvars";
import convert from "color-convert";
import colornames from "color-name";
import "./index.scss";
import lesssrc from "./example.less";

class ObjectFilter {
    static entry(filter) {
        return ([key, value]) => filter([key, value]);
    }

    static key(filter) {
        return ([key]) => filter(key);
    }

    static value(filter) {
        return ([_, value]) => filter(value);
    }
}

class ColorUtils {
    static rgb = /rgb\((\d+), (\d+), (\d+)\)/;
    static map = {
        'keyword': ColorUtils.isKeyword,
        'hex': ColorUtils.isHex,
        'rgb': ColorUtils.isRgb
    };

    static isKeyword(value) {
        return !!colornames[value];
    }

    static isHex(value) {
        return value.startsWith('#');
    }

    static isRgb(value) {
        return value.startsWith('rgb(');
    }

    static isColor(value) {
        return ColorUtils.isKeyword(value) || ColorUtils.isHex(value) || ColorUtils.isRgb(value);
    }

    static colorType(value) {
        return Object.entries(ColorUtils.map)
            .find(([key, predicate]) => {
                return predicate(value);
            })[0];
    }

    static colorParse(value) {
        const type = ColorUtils.colorType(value);

        if (type === 'rgb') {
            const [match, r, g, b] = ColorUtils.rgb.exec(value);
            return [r, g, b];
        }
        return value;
    }

    static print(format, value) {
        if (typeof value === 'string') {
            if (format === 'hex' && !value.startsWith('#')) {
                return `#${value}`.toLocaleLowerCase();
            }
            return value.toLocaleLowerCase();
        }

        let prettyvalues;
        if (format === 'hsl') {
            prettyvalues = value.map((v, i) => (i > 0) ? `${v}%` : v);
        } else {
            prettyvalues = value;
        }

        return `${format}(${prettyvalues.join(', ')})`.toLowerCase();
    }

    static convert(format, value) {
        const type = ColorUtils.colorType(value);

        if (type === format) {
            return value;
        }
        return ColorUtils.print(format, convert[type][format](ColorUtils.colorParse(value)));
    }
}

class ColorSort {
    static hueAbs(hue) {
        if (Math.abs(hue) <= 180) return Math.abs(hue);
        return ColorSort.hueAbs(hue - 360);
    }

    static sortByHue(var1, var2) {
        const type1 = ColorUtils.colorType(var1[1]);
        const type2 = ColorUtils.colorType(var2[1]);
        const [h1, s1, l1] = convert[type1].hsl(ColorUtils.colorParse(var1[1]));
        const [h2, s2, l2] = convert[type2].hsl(ColorUtils.colorParse(var2[1]));
        const sort1 = ColorSort.hueAbs(h1) + 1 * s1 - l1;
        const sort2 = ColorSort.hueAbs(h2) + 1 * s2 - l2;

        return sort1 - sort2;
    }

    static sortByLuma(var1, var2) {
        const type1 = ColorUtils.colorType(var1[1]);
        const type2 = ColorUtils.colorType(var2[1]);
        const [r1, g1, b1] = convert.lab.rgb(convert[type1].lab(ColorUtils.colorParse(var1[1])));
        const [r2, g2, b2] = convert.lab.rgb(convert[type2].lab(ColorUtils.colorParse(var2[1])));
        const sort1 = 0.299 * r1 + 0.587 * g1 + 0.114 * b1;
        const sort2 = 0.299 * r2 + 0.587 * g2 + 0.114 * b2;

        return sort2 - sort1;
    }

    static hueGroup(hue) {
        return Math.floor(ColorSort.hueAbs(hue) / 30);
    }

    static lumaGroup(v) {
        return Math.floor(v / 10);
    }

    static sortHSL(var1, var2) {
        const type1 = ColorUtils.colorType(var1[1]);
        const type2 = ColorUtils.colorType(var2[1]);
        const [h1, s1, l1] = convert[type1].hsl(ColorUtils.colorParse(var1[1]));
        const [h2, s2, l2] = convert[type2].hsl(ColorUtils.colorParse(var2[1]));

        const hGroup1 = ColorSort.hueGroup(h1);
        const hGroup2 = ColorSort.hueGroup(h2);

        if (hGroup1 !== hGroup2) {
            return hGroup1 - hGroup2;
        }
        const sGroup1 = ColorSort.lumaGroup(s1);
        const sGroup2 = ColorSort.lumaGroup(s2);

        if (sGroup1 !== sGroup2) {
            return sGroup1 - sGroup2;
        }

        const lGroup1 = ColorSort.lumaGroup(l1);
        const lGroup2 = ColorSort.lumaGroup(l2);

        if (lGroup1 !== lGroup2) {
            return lGroup1 - lGroup2;
        }
    }
}

function PaletteElement([name, color]) {
    return (
        <div key={name} className="palette__element">
            <div className="palette__color" style={{backgroundColor: color}}/>
            <div className="palette__meta">
                <div className="palette__metaentry fullwidth">
                    <span className="palette__metaentry-header">Variable</span>
                    <span className="palette__metaentry-value">@{name}</span>
                </div>
                <div className="palette__metaentry">
                    <span className="palette__metaentry-header">HEX</span>
                    <span className="palette__metaentry-value">{ColorUtils.convert('hex', color)}</span>
                </div>
                <div className="palette__metaentry">
                    <span className="palette__metaentry-header">RGB</span>
                    <span className="palette__metaentry-value">{ColorUtils.convert('rgb', color)}</span>
                </div>
                <div className="palette__metaentry">
                    <span className="palette__metaentry-header">HSL</span>
                    <span className="palette__metaentry-value">{ColorUtils.convert('hsl', color)}</span>
                </div>
            </div>
        </div>
    );
}

function combine(l1, l2) {
    return l1
        .map((v1) => l2.map((v2) => Array.isArray(v2) ? [v1, ...v2] : [v1,v2]))
        .reduce((a, l) => [...a, ...l], []);
}
function range(start, end, skip, inclusive: false) {
    return new Array(((end-start) / skip) + (inclusive ? 1 : 0))
        .fill(0)
        .map((_, i) => i * skip);
}

function generate() {
    const rgb = range(0, 255, 3 * 17, true);

    return combine(rgb, combine(rgb, rgb)).map(([r, g, b], i) => ({ [`var${i}`]: `rgb(${r}, ${g}, ${b})` }))
        .reduce((acc, obj) => ({...acc, ...obj}), {});
}

console.log('generate();', generate());

class Palette extends PureComponent {
    constructor(props) {
        super(props);

        this.state = { vars: generate() };
    }

    componentDidMount() {
        // lessvars(lesssrc).then((vars) => this.setState({vars}));
    }

    render() {
        if (!this.state.vars) {
            return <p>Loading...</p>
        }

        const colors = Object.entries(this.state.vars)
            .filter(ObjectFilter.value(ColorUtils.isColor))
            .sort(ColorSort.sortByLuma)
            .map(PaletteElement);

        return (
            <div className="palette">
                {colors}
            </div>
        );
    }
}

Palette.propTypes = {};

export default Palette;