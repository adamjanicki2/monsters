import {
  Alert,
  assertDefined,
  Box,
  Spinner,
  ui,
  usePathParams,
} from "@adamjanicki/ui";
import Header, { Subheader } from "src/components/Header";
import Page from "src/components/Page";
import SimpleTable from "src/components/SimpleTable";
import TypeBadge from "src/components/TypeBadge";
import moves, { type MoveKey } from "src/data/moves";
import useGetMove from "src/hooks/useGetMove";
import NotFound from "src/pages/NotFound";
import type { Move as MoveType } from "src/utils/types";

export default function Move() {
  const params = usePathParams();
  const key = assertDefined(params.slug);
  const localMove = moves[key as MoveKey];
  const accuracy = localMove?.accuracy as true | number | undefined;
  const { move, loading, error } = useGetMove({ key, accuracy });

  if (accuracy === undefined) {
    return <NotFound />;
  }

  const name = localMove.name;

  if (error || (!loading && !move)) {
    return (
      <Page documentTitle={`Error: ${name}`}>
        <Alert type="error">
          {error || `No data could be found for '${name}'`}
        </Alert>
      </Page>
    );
  }

  return (
    <Page documentTitle={name}>
      <Box vfx={{ axis: "y", gap: "l", paddingY: "l", width: "full" }}>
        <Header>{name}</Header>
        {loading || !move ? (
          <Box vfx={{ width: "full" }}>
            <Spinner />
          </Box>
        ) : (
          <MoveInfo move={move} />
        )}
      </Box>
    </Page>
  );
}

function MoveInfo({ move }: { move: MoveType }) {
  return (
    <Box
      vfx={{
        axis: "y",
        gap: "m",
        wrap: true,
        padding: "m",
        border: true,
        radius: "rounded",
        backgroundColor: "default",
        shadow: "subtle",
      }}
    >
      <Subheader>Move Info</Subheader>

      <SimpleTable
        rows={[
          ["Type", <TypeBadge type={move.type} />],
          [
            "Category",
            <ui.span style={{ textTransform: "capitalize" }}>
              {move.category}
            </ui.span>,
          ],
          ["Accuracy", move.accuracy === true ? "∞" : move.accuracy],
          ["Power", move.power === 0 ? "—" : move.power],
          ["PP", move.pp],
          move.zPower > 0 ? ["Z Power", move.zPower] : null,
        ]}
      />

      <Box vfx={{ axis: "y", gap: "s" }}>
        <Subheader>Description</Subheader>
        <ui.p vfx={{ margin: "none" }}>{move.desc}</ui.p>
      </Box>
    </Box>
  );
}
