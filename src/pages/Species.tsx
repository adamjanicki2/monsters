import { Spinner } from "@adamjanicki/ui";
import JsonTree from "src/components/JsonTree";
import PageWrapper from "src/components/PageWrapper";
import usePokemon from "src/hooks/usePokemon";

type Props = {
  dexNo: number;
  name: string;
};

export default function Species({ name, dexNo }: Props) {
  const { pokemon } = usePokemon(name);

  return (
    <PageWrapper title={name}>
      {pokemon ? <JsonTree>{pokemon}</JsonTree> : <Spinner />}
    </PageWrapper>
  );
}
