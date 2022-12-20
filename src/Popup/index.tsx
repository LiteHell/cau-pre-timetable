import classnames from 'classnames';
import { ReactNode } from 'react';
import styles from './popup.module.css';
import { AiOutlineClose } from "react-icons/ai";

type PopupOptions = {
    children: ReactNode | ReactNode[];
    title: string;
    active: boolean;
    onCloseButtonClick: () => void;
}
export default function Popup(opts: PopupOptions) {
    return <div className={classnames(styles.popup, {[styles.isActive]: opts.active})}>
        <div className={styles.header}>
            <div className={styles.title}>
                {opts.title}
            </div>
            <button className={styles.close} onClick={opts.onCloseButtonClick}>
                <AiOutlineClose></AiOutlineClose>
            </button>
        </div>
        <div className={styles.content}>
            {opts.children}
        </div>
    </div>;
}