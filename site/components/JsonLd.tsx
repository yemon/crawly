type Props = { data: string };

export function JsonLd({ data }: Props) {
  return (
    <script
      type="application/ld+json"
      // JSON is already stringified by the caller. This is safe because we
      // control the payload — no user input flows in.
      dangerouslySetInnerHTML={{ __html: data }}
    />
  );
}
