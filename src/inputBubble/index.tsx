import classnames from 'classnames';
import styles from './inputBubble.module.css';

type InputBubbleOptions = {
    value: string | number | null;
    acceptsNumberOnly?: boolean;
    name: string;
    promptMessage?: string;
    onChange: (newValue: string | number | null) => void
} & (
    {
        acceptsNumberOnly: true,
        value: number | null,
        onChange: (newValue: number | null) => void
    } | {
        acceptsNumberOnly?: false | undefined,
        value: string | null,
        onChange: (newValue: string | null) => void
    }
);

export default function inputButton({ name, promptMessage, onChange, value, ...opts}: InputBubbleOptions) {
    const hasValue = value !== null && value !== '';
    const acceptsNumberOnly = opts.acceptsNumberOnly ?? false;

    const onClick = () => {
        while (true) {
            const newValue = prompt(promptMessage ?? `새 ${name} 검색어을 입력하세요.\n검색어를 비우리는 경우 빈 칸으로 입력하세요.`);
            if (newValue === '' || newValue === null) {
                return onChange(acceptsNumberOnly ? null : '');
            }
            if (acceptsNumberOnly) {
                const parsed = parseInt(newValue);
                if (isNaN(parsed)) {
                    alert('숫자를 입력해야 합니다.');
                    continue;
                }
                return onChange(parsed);
            } else {
                return onChange(newValue);
            }
        }
    };

    return <button type="button" className={classnames(styles.inputBubble, {[styles.hasValue]: hasValue})} onClick={onClick}>
        {hasValue ? `${name}: ${value}`: name}
    </button>
}
