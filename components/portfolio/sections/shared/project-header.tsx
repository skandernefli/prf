export function ProjectHeader({
  number,
  category,
  description,
}: {
  number: string;
  category: string;
  description: string;
}) {
  return (
    <>
      <p className="case-study-kicker">
        {number} / {category}
      </p>
      <p className="case-study-description">{description}</p>
    </>
  );
}
