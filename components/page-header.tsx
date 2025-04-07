export function PageHeader({
  header,
  description,
}: {
  header: string;
  description?: string;
}) {
  return (
    <div className="flex flex-col mb-6 lg:mb-8">
      <h1 className="text-2xl">{header}</h1>
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}
