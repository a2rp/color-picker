let colorContext = null;

export const normalizeHex = (value) => {
    const hex = String(value).trim().replace("#", "");

    if (/^[0-9a-f]{3}$/i.test(hex)) {
        return `#${hex
            .split("")
            .map((char) => char + char)
            .join("")
            .toUpperCase()}`;
    }

    if (/^[0-9a-f]{6}$/i.test(hex)) {
        return `#${hex.toUpperCase()}`;
    }

    return null;
};

export const hexToRgb = (hex) => {
    const value = normalizeHex(hex);

    if (!value) {
        return { r: 0, g: 0, b: 0 };
    }

    const number = Number.parseInt(value.slice(1), 16);

    return {
        r: (number >> 16) & 255,
        g: (number >> 8) & 255,
        b: number & 255,
    };
};

export const rgbToHsl = (r, g, b) => {
    const red = r / 255;
    const green = g / 255;
    const blue = b / 255;

    const max = Math.max(red, green, blue);
    const min = Math.min(red, green, blue);

    let h = 0;
    let s = 0;

    const l = (max + min) / 2;
    const delta = max - min;

    if (delta !== 0) {
        s = delta / (1 - Math.abs(2 * l - 1));

        if (max === red) h = 60 * (((green - blue) / delta) % 6);
        if (max === green) h = 60 * ((blue - red) / delta + 2);
        if (max === blue) h = 60 * ((red - green) / delta + 4);
    }

    if (h < 0) h += 360;

    return {
        h: Math.round(h),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
    };
};

export const getRandomHex = () =>
    `#${Math.floor(Math.random() * 0xffffff)
        .toString(16)
        .padStart(6, "0")
        .toUpperCase()}`;

export const cssColorToHex = (color) => {
    if (typeof document === "undefined") return null;

    if (!colorContext) {
        colorContext = document.createElement("canvas").getContext("2d");
    }

    if (!colorContext) return null;

    colorContext.fillStyle = "#000000";
    colorContext.fillStyle = color;

    return normalizeHex(colorContext.fillStyle);
};
