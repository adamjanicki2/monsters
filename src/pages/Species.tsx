import { Alert, assertDefined, Spinner } from "@adamjanicki/ui";
import { useParams } from "react-router";
import JsonTree from "src/components/JsonTree";
import Page from "src/components/Page";
import useGetPokemon from "src/hooks/useGetPokemon";

export default function Species() {
  const params = useParams<{ name: string }>();
  const name = assertDefined(params.name);
  const data = useGetPokemon(name);

  return (
    <Page title={data.pokemon?.key || name}>
      <InnerContent {...data} name={name} />
    </Page>
  );
}

function InnerContent({
  pokemon,
  loading,
  error,
  name,
}: ReturnType<typeof useGetPokemon> & { name: string }) {
  if (loading) {
    return <Spinner />;
  }

  if (error || !pokemon) {
    return (
      <Alert type="error">
        {error || `No data could be found for '${name}'`}
      </Alert>
    );
  }

  return <JsonTree>{pokemon}</JsonTree>;
}
