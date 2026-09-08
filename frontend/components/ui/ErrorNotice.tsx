type Props = { message: string; onRetry?: () => void };

export default function ErrorNotice({ message, onRetry }: Props) {
  return <div role="alert" className="card-surface p-5 my-5 border-cinnamon-500">
    <p className="text-bark-500 font-semibold">{message}</p>
    {onRetry && <button type="button" onClick={onRetry} className="btn-outline mt-4">ניסיון נוסף</button>}
  </div>;
}
