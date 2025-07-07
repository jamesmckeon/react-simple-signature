

export interface ClearButtonProps {
    className: string | null;
    onClick: () => void;
    title: string | null;
}

export default function ClearButton({
    className = null,
    onClick,
    title
}: ClearButtonProps) {

    return (
        <button
            className={className ?? ''}
            type="button"
            onClick={onClick}
            title={title ?? ''}
        >
            &#x2715;
        </button>
    );
}