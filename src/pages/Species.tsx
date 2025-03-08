import PageWrapper from "src/components/PageWrapper";
import useFetch from "src/hooks/useFetch";

type Props = {
  dexNo: number;
  name: string;
};

export default function Species({ name, dexNo }: Props) {
  const { data } = useFetch(`/pokemon/${dexNo}`);

  return (
    <PageWrapper title={name}>
      <code>{name}</code>
      <pre>
        <code>{JSON.stringify(data || {})}</code>
      </pre>
    </PageWrapper>
  );
}
