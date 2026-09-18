import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
    FiCheck,
    FiCopy,
    FiDroplet,
    FiRefreshCw,
    FiSearch,
    FiX,
} from "react-icons/fi";
import { predefinedColors } from "../../data/predefinedColors";
import {
    getContrastColor,
    getRandomHex,
    hexToRgb,
    normalizeHex,
    rgbToHex,
    rgbToHsl,
} from "../../utils/color";
import styles from "./styles.module.css";

const DEFAULT_COLOR = "#7C3AED";

const STORAGE_KEY = "a2rp-color-picker-current-color";

const getInitialColor = () => {
    if (typeof window === "undefined") {
        return DEFAULT_COLOR;
    }

    const savedColor = window.localStorage.getItem(STORAGE_KEY);

    return normalizeHex(savedColor) || DEFAULT_COLOR;
};

const copyText = async (value) => {
    await navigator.clipboard.writeText(value);
};

const ValueRow = ({ label, value, copyKey, copied, onCopy }) => {
    return (
        <div className={styles.valueRow}>
            <div className={styles.valueInfo}>
                <span className={styles.valueLabel}>{label}</span>

                <code className={styles.valueText}>{value}</code>
            </div>

            <button
                type="button"
                className={styles.copyButton}
                onClick={() => onCopy(copyKey, value)}
                aria-label={`Copy ${label}`}
            >
                {copied === copyKey ? <FiCheck /> : <FiCopy />}
            </button>
        </div>
    );
};

const ColorPicker = () => {
    const initialColor = useMemo(() => getInitialColor(), []);

    const [hex, setHex] = useState(initialColor);

    const [hexInput, setHexInput] = useState(initialColor);

    const [alpha, setAlpha] = useState(100);

    const [search, setSearch] = useState("");

    const [copied, setCopied] = useState("");

    const colorListRef = useRef(null);

    const colorItemRefs = useRef(new Map());

    const rgb = useMemo(() => hexToRgb(hex), [hex]);

    const hsl = useMemo(() => rgbToHsl(rgb.r, rgb.g, rgb.b), [rgb]);

    const alphaDecimal = Number((alpha / 100).toFixed(2));

    const selectedColor = useMemo(
        () =>
            predefinedColors.find(
                (color) => color.hex.toUpperCase() === hex.toUpperCase(),
            ),
        [hex],
    );

    const selectedName = selectedColor?.name || "Custom Color";

    const filteredColors = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return predefinedColors;
        }

        return predefinedColors.filter(
            (color) =>
                color.name.toLowerCase().includes(query) ||
                color.hex.toLowerCase().includes(query),
        );
    }, [search]);

    const values = useMemo(
        () => ({
            hex,
            rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
            rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alphaDecimal})`,
            hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
            hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${alphaDecimal})`,
        }),
        [alphaDecimal, hex, hsl, rgb],
    );

    const previewTextColor = getContrastColor(hex);

    const setColorItemRef = useCallback((key, node) => {
        if (node) {
            colorItemRefs.current.set(key, node);

            return;
        }

        colorItemRefs.current.delete(key);
    }, []);

    const scrollSelectedToCenter = useCallback(() => {
        if (!selectedColor) {
            return;
        }

        const container = colorListRef.current;

        const selectedItem = colorItemRefs.current.get(selectedColor.name);

        if (!container || !selectedItem) {
            return;
        }

        const containerRect = container.getBoundingClientRect();

        const itemRect = selectedItem.getBoundingClientRect();

        const targetTop =
            container.scrollTop +
            itemRect.top -
            containerRect.top -
            container.clientHeight / 2 +
            itemRect.height / 2;

        container.scrollTo({
            top: Math.max(0, targetTop),
            behavior: "smooth",
        });
    }, [selectedColor]);

    useEffect(() => {
        window.localStorage.setItem(STORAGE_KEY, hex);
    }, [hex]);

    useEffect(() => {
        const frame = window.requestAnimationFrame(() => {
            scrollSelectedToCenter();
        });

        return () => {
            window.cancelAnimationFrame(frame);
        };
    }, [filteredColors, scrollSelectedToCenter]);

    const updateColor = (value) => {
        const normalized = normalizeHex(value);

        if (!normalized) {
            return;
        }

        setHex(normalized);
        setHexInput(normalized);
    };

    const handleHexCommit = () => {
        const normalized = normalizeHex(hexInput);

        if (!normalized) {
            setHexInput(hex);

            return;
        }

        updateColor(normalized);
    };

    const handleRgbChange = (channel, value) => {
        const nextRgb = {
            ...rgb,
            [channel]: Number(value),
        };

        updateColor(rgbToHex(nextRgb.r, nextRgb.g, nextRgb.b));
    };

    const handleRandom = () => {
        updateColor(getRandomHex());
    };

    const handleCopy = async (key, value) => {
        try {
            await copyText(value);

            setCopied(key);

            window.setTimeout(() => {
                setCopied("");
            }, 1200);
        } catch {
            setCopied("");
        }
    };

    return (
        <section className={styles.wrapper}>
            <header className={styles.header}>
                <div>
                    <span className={styles.label}>Developer Color Tool</span>

                    <h1 className={styles.title}>Color Picker</h1>

                    <p className={styles.text}>
                        Browse predefined CSS color names or create your own
                        color with precise controls.
                    </p>
                </div>

                <button
                    type="button"
                    className={styles.randomButton}
                    onClick={handleRandom}
                >
                    <FiRefreshCw />

                    <span>Random</span>
                </button>
            </header>

            <div className={styles.workspace}>
                <aside className={styles.colorsPanel}>
                    <div className={styles.colorsHeader}>
                        <div>
                            <span>CSS Colors</span>

                            <strong>Predefined Colors</strong>
                        </div>

                        <span className={styles.count}>
                            {filteredColors.length}
                        </span>
                    </div>

                    <div className={styles.search}>
                        <FiSearch />

                        <input
                            type="search"
                            value={search}
                            onChange={(event) => setSearch(event.target.value)}
                            placeholder="Search color..."
                            aria-label="Search predefined colors"
                        />

                        {search && (
                            <button
                                type="button"
                                onClick={() => setSearch("")}
                                aria-label="Clear search"
                            >
                                <FiX />
                            </button>
                        )}
                    </div>

                    <div ref={colorListRef} className={styles.colorList}>
                        {filteredColors.map((color) => {
                            const active =
                                color.hex.toUpperCase() === hex.toUpperCase();

                            return (
                                <button
                                    key={`${color.name}-${color.hex}`}
                                    ref={(node) =>
                                        setColorItemRef(color.name, node)
                                    }
                                    type="button"
                                    className={`${styles.colorItem} ${
                                        active ? styles.active : ""
                                    }`}
                                    onClick={() => updateColor(color.hex)}
                                >
                                    <span
                                        className={styles.colorSwatch}
                                        style={{
                                            backgroundColor: color.hex,
                                        }}
                                    />

                                    <span className={styles.colorInfo}>
                                        <strong>{color.name}</strong>

                                        <small>{color.hex}</small>
                                    </span>

                                    {active && <FiCheck />}
                                </button>
                            );
                        })}
                    </div>
                </aside>

                <div className={styles.editor}>
                    <div
                        className={styles.preview}
                        style={{
                            backgroundColor: hex,
                            color: previewTextColor,
                        }}
                    >
                        <FiDroplet />

                        <span className={styles.previewName}>
                            {selectedName}
                        </span>

                        <strong>{hex}</strong>

                        <span>{values.rgb}</span>
                    </div>

                    <section className={styles.valuesSection}>
                        <div className={styles.sectionTitle}>
                            <span>Selected Color</span>

                            <h2>Color Values</h2>
                        </div>

                        <div className={styles.valuesGrid}>
                            <ValueRow
                                label="NAME"
                                value={selectedName}
                                copyKey="name"
                                copied={copied}
                                onCopy={handleCopy}
                            />

                            <ValueRow
                                label="HEX"
                                value={values.hex}
                                copyKey="hex"
                                copied={copied}
                                onCopy={handleCopy}
                            />

                            <ValueRow
                                label="RGB"
                                value={values.rgb}
                                copyKey="rgb"
                                copied={copied}
                                onCopy={handleCopy}
                            />

                            <ValueRow
                                label="RGBA"
                                value={values.rgba}
                                copyKey="rgba"
                                copied={copied}
                                onCopy={handleCopy}
                            />

                            <ValueRow
                                label="HSL"
                                value={values.hsl}
                                copyKey="hsl"
                                copied={copied}
                                onCopy={handleCopy}
                            />

                            <ValueRow
                                label="HSLA"
                                value={values.hsla}
                                copyKey="hsla"
                                copied={copied}
                                onCopy={handleCopy}
                            />
                        </div>
                    </section>

                    <section className={styles.controlsSection}>
                        <div className={styles.sectionTitle}>
                            <span>Adjust</span>

                            <h2>Color Controls</h2>
                        </div>

                        <div className={styles.primaryControls}>
                            <label className={styles.nativePicker}>
                                <span>Visual Picker</span>

                                <input
                                    type="color"
                                    value={hex}
                                    onChange={(event) =>
                                        updateColor(event.target.value)
                                    }
                                />
                            </label>

                            <div className={styles.hexControl}>
                                <label htmlFor="hex-input">HEX</label>

                                <div>
                                    <input
                                        id="hex-input"
                                        type="text"
                                        value={hexInput}
                                        maxLength={7}
                                        onChange={(event) =>
                                            setHexInput(event.target.value)
                                        }
                                        onBlur={handleHexCommit}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter") {
                                                event.currentTarget.blur();
                                            }
                                        }}
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleCopy("input-hex", hex)
                                        }
                                    >
                                        {copied === "input-hex" ? (
                                            <FiCheck />
                                        ) : (
                                            <FiCopy />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className={styles.sliders}>
                            <div className={styles.slider}>
                                <div>
                                    <span>Red</span>

                                    <strong>{rgb.r}</strong>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={rgb.r}
                                    onChange={(event) =>
                                        handleRgbChange("r", event.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.slider}>
                                <div>
                                    <span>Green</span>

                                    <strong>{rgb.g}</strong>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={rgb.g}
                                    onChange={(event) =>
                                        handleRgbChange("g", event.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.slider}>
                                <div>
                                    <span>Blue</span>

                                    <strong>{rgb.b}</strong>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="255"
                                    value={rgb.b}
                                    onChange={(event) =>
                                        handleRgbChange("b", event.target.value)
                                    }
                                />
                            </div>

                            <div className={styles.slider}>
                                <div>
                                    <span>Alpha</span>

                                    <strong>{alpha}%</strong>
                                </div>

                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={alpha}
                                    onChange={(event) =>
                                        setAlpha(Number(event.target.value))
                                    }
                                />
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </section>
    );
};

export default ColorPicker;
