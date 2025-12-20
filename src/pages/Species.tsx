import { Spinner } from "@adamjanicki/ui";
import JsonTree from "src/components/JsonTree";
import Page from "src/components/Page";
import usePokemon from "src/hooks/usePokemon";

type Props = {
  dexNo: number;
  name: string;
};

export default function Species({ name }: Props) {
  const { pokemon } = usePokemon(name);

  return (
    <Page title={name}>
      {pokemon ? <JsonTree>{pokemon}</JsonTree> : <Spinner />}
    </Page>
  );
}
