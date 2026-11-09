import { useEffect, useMemo, useRef, useState } from "react";
import { FiCopy, FiRefreshCw } from "react-icons/fi";
import { predefinedColors } from "./data/predefinedColors";
import {
    cssColorToHex,
    getRandomHex,
    hexToRgb,
    normalizeHex,
    rgbToHsl,
} from "./utils/color";
import styles from "./styles.module.css";

const STORAGE_KEY = "a2rp-color-picker-current-color";
const DEFAULT_COLOR = "#7C3AED";

const getInitialColor = () => {
    try {
        const saved = window.localStorage.getItem(STORAGE_KEY);

        return normalizeHex(saved) || DEFAULT_COLOR;
    } catch {
        return DEFAULT_COLOR;
    }
};

const ColorPicker = () => {
    const [color, setColor] = useState(getInitialColor);
    const [inputValue, setInputValue] = useState(color);
    const [copiedValue, setCopiedValue] = useState("");
    const [copyError, setCopyError] = useState(false);
    const [storageAvailable, setStorageAvailable] = useState(true);

    const colorListRef = useRef(null);
    const colorItemRefs = useRef({});

    const colors = useMemo(
        () =>
            predefinedColors
                .map((name) => ({
                    name,
                    hex: cssColorToHex(name),
                }))
                .filter((item) => item.hex),
        [],
    );

    const activeColor = colors.find((item) => item.hex === color);

    const rgb = hexToRgb(color);
    const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    useEffect(() => {
        try {
            window.localStorage.setItem(STORAGE_KEY, color);
        } catch {
            setStorageAvailable(false);
        }
    }, [color]);

    useEffect(() => {
        if (!activeColor) return;

        const list = colorListRef.current;
        const item = colorItemRefs.current[activeColor.name];

        if (!list || !item) return;

        list.scrollTo({
            top: item.offsetTop - list.clientHeight / 2 + item.clientHeight / 2,
            behavior: "smooth",
        });
    }, [activeColor]);

    const updateColor = (value) => {
        const normalized = normalizeHex(value);

        if (!normalized) return;

        setColor(normalized);
        setInputValue(normalized);
    };

    const handleHexChange = (value) => {
        const nextValue = value.toUpperCase();

        setInputValue(nextValue);

        const normalized = normalizeHex(nextValue);

        if (normalized) {
            setColor(normalized);
        }
    };

    const copyValue = async (value) => {
        setCopyError(false);

        try {
            await navigator.clipboard.writeText(value);
            setCopiedValue(value);

            window.setTimeout(() => {
                setCopiedValue("");
            }, 1200);
        } catch {
            setCopyError(true);
        }
    };

    const colorValues = [
        {
            label: "HEX",
            value: color,
        },
        {
            label: "RGB",
            value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        },
        {
            label: "HSL",
            value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        },
    ];

    return (
        <section className={styles.wrapper}>
            <div className={styles.header}>
                <div className={styles.headerInfo}>
                    <span className={styles.label}>COLOR PICKER</span>

                    <h1 className={styles.title}>Choose your color</h1>

                    <p className={styles.text}>
                        Pick a predefined CSS color or create your own.
                    </p>

                    {!storageAvailable && (
                        <p className={styles.notice} role="status">
                            Browser storage is unavailable. Your selection will
                            not be saved after you leave this page.
                        </p>
                    )}
                </div>

                <button
                    className={styles.randomButton}
                    type="button"
                    onClick={() => updateColor(getRandomHex())}
                >
                    <FiRefreshCw />
                    Random Color
                </button>
            </div>

            <div className={styles.workspace}>
                <aside className={styles.colorsPanel}>
                    <div className={styles.panelHeader}>
                        <div>
                            <h2 className={styles.panelTitle}>
                                Predefined Colors
                            </h2>

                            <p className={styles.panelText}>
                                {colors.length} CSS colors
                            </p>
                        </div>
                    </div>

                    <div ref={colorListRef} className={styles.colorList}>
                        {colors.map((item) => {
                            const active = item.hex === color;

                            return (
                                <button
                                    key={item.name}
                                    ref={(element) => {
                                        colorItemRefs.current[item.name] =
                                            element;
                                    }}
                                    className={`${styles.colorItem} ${
                                        active ? styles.active : ""
                                    }`}
                                    type="button"
                                    onClick={() => updateColor(item.hex)}
                                >
                                    <span
                                        className={styles.swatch}
                                        style={{
                                            backgroundColor: item.hex,
                                        }}
                                    />

                                    <span className={styles.colorInfo}>
                                        <strong>{item.name}</strong>
                                        <span>{item.hex}</span>
                                    </span>
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className={styles.editorPanel}>
                    <div className={styles.preview}>
                        <div
                            className={styles.previewColor}
                            style={{
                                backgroundColor: color,
                            }}
                        />

                        <div className={styles.previewDetails}>
                            <span>Selected Color</span>

                            <strong>
                                {activeColor?.name || "Custom Color"}
                            </strong>

                            <code>{color}</code>
                        </div>
                    </div>

                    <div className={styles.controls}>
                        <div className={styles.control}>
                            <label htmlFor="color-picker-native">
                                Color Picker
                            </label>

                            <input
                                id="color-picker-native"
                                className={styles.nativePicker}
                                type="color"
                                value={color}
                                onChange={(event) =>
                                    updateColor(event.target.value)
                                }
                            />
                        </div>

                        <div className={styles.control}>
                            <label htmlFor="color-picker-hex">HEX Color</label>

                            <input
                                id="color-picker-hex"
                                className={styles.hexInput}
                                type="text"
                                value={inputValue}
                                maxLength={7}
                                spellCheck="false"
                                onChange={(event) =>
                                    handleHexChange(event.target.value)
                                }
                                onBlur={() => setInputValue(color)}
                            />
                        </div>
                    </div>

                    <div className={styles.values}>
                        {colorValues.map((item) => (
                            <div key={item.label} className={styles.valueItem}>
                                <div className={styles.valueInfo}>
                                    <span>{item.label}</span>

                                    <code>{item.value}</code>
                                </div>

                                <button
                                    className={styles.copyButton}
                                    type="button"
                                    onClick={() => copyValue(item.value)}
                                >
                                    <FiCopy />

                                    {copiedValue === item.value
                                        ? "Copied"
                                        : "Copy"}
                                </button>
                            </div>
                        ))}
                    </div>

                    {copyError && (
                        <p className={styles.notice} role="status">
                            Clipboard access failed. You can select and copy
                            the value manually.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default ColorPicker;
