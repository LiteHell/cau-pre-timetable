import styles from './warningSection.module.css';

export default function WarningSection() {
    return <section className={styles.warning}>
        정식공개일 전에 크롤링한 것이므로 일부 부정확할 수 있습니다.
    </section>;
}