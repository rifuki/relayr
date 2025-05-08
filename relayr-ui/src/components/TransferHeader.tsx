interface TransferHeaderProps {
  title: string;
  description: string;
}
export default function TransferHeader({
  title,
  description,
}: TransferHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
