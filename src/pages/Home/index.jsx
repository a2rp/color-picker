import ColorPicker from "../../components/ColorPicker";
import styles from "./styles.module.css";

const Home = () => {
    return (
        <main className={styles.wrapper}>
            <ColorPicker />
        </main>
    );
};

export default Home;
