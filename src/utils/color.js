const clamp = (value, min, max) => {
    return Math.min(Math.max(Number(value), min), max);
};

export const normalizeHex = (value) => {
    if (typeof value !== "string") {
        return null;
    }

    let hex = value.trim().replace("#", "");

    if (/^[0-9a-fA-F]{3}$/.test(hex)) {
        hex = hex
            .split("")
            .map((character) => character + character)
            .join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
        return null;
    }

    return `#${hex.toUpperCase()}`;
};

export const hexToRgb = (hex) => {
    const normalizedHex = normalizeHex(hex);

    if (!normalizedHex) {
        return null;
    }

    const value = normalizedHex.slice(1);

    return {
        r: parseInt(value.slice(0, 2), 16),
        g: parseInt(value.slice(2, 4), 16),
        b: parseInt(value.slice(4, 6), 16),
    };
};

export const rgbToHex = (r, g, b) => {
    const toHex = (value) => {
        return clamp(value, 0, 255).toString(16).padStart(2, "0").toUpperCase();
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const rgbToHsl = (r, g, b) => {
    const red = clamp(r, 0, 255) / 255;
    const green = clamp(g, 0, 255) / 255;
    const blue = clamp(b, 0, 255) / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);
    const difference = max - min;

    let hue = 0;
    let saturation = 0;

    const lightness = (max + min) / 2;

    if (difference !== 0) {
        saturation =
            lightness > 0.5
                ? difference / (2 - max - min)
                : difference / (max + min);

        switch (max) {
            case red:
                hue = (green - blue) / difference + (green < blue ? 6 : 0);
                break;

            case green:
                hue = (blue - red) / difference + 2;
                break;

            default:
                hue = (red - green) / difference + 4;
                break;
        }

        hue /= 6;
    }

    return {
        h: Math.round(hue * 360),
        s: Math.round(saturation * 100),
        l: Math.round(lightness * 100),
    };
};

export const hslToRgb = (h, s, l) => {
    const hue = ((Number(h) % 360) + 360) % 360;
    const saturation = clamp(s, 0, 100) / 100;
    const lightness = clamp(l, 0, 100) / 100;

    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;

    const hueSection = hue / 60;

    const x = chroma * (1 - Math.abs((hueSection % 2) - 1));

    const match = lightness - chroma / 2;

    let red = 0;
    let green = 0;
    let blue = 0;

    if (hueSection >= 0 && hueSection < 1) {
        red = chroma;
        green = x;
    } else if (hueSection >= 1 && hueSection < 2) {
        red = x;
        green = chroma;
    } else if (hueSection >= 2 && hueSection < 3) {
        green = chroma;
        blue = x;
    } else if (hueSection >= 3 && hueSection < 4) {
        green = x;
        blue = chroma;
    } else if (hueSection >= 4 && hueSection < 5) {
        red = x;
        blue = chroma;
    } else {
        red = chroma;
        blue = x;
    }

    return {
        r: Math.round((red + match) * 255),
        g: Math.round((green + match) * 255),
        b: Math.round((blue + match) * 255),
    };
};

export const getRandomHex = () => {
    const value = Math.floor(Math.random() * 0xffffff);

    return `#${value.toString(16).padStart(6, "0").toUpperCase()}`;
};

export const getContrastColor = (hex) => {
    const rgb = hexToRgb(hex);

    if (!rgb) {
        return "#FFFFFF";
    }

    const luminance = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;

    return luminance > 150 ? "#000000" : "#FFFFFF";
};
