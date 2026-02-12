import { Alert, Box, Spinner, Table, ui, usePathParams } from "@adamjanicki/ui";
import { useMemo, useState } from "react";
import CategoryIcon from "src/components/CategoryIcon";
import Header, { Subheader } from "src/components/Header";
import Page from "src/components/Page";
import SimpleTable from "src/components/SimpleTable";
import TypeBadge from "src/components/TypeBadge";
import moves, { type MoveKey } from "src/data/moves";
import useGetMove from "src/hooks/useGetMove";
import NotFound from "src/pages/NotFound";
import type { Move as MoveType } from "src/utils/types";
import { capitalize } from "src/utils/helpers";

export default function Move() {
  const params = usePathParams();
  const key = params.slug as string;
  const localMove = moves[key as MoveKey] as MoveType | undefined;
  const { move, loading, error } = useGetMove({
    key,
    skip: !localMove,
  });

  if (!localMove) {
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
  const [{ key: sortKey, direction: sortDirection }, setSort] = useState<{
    key?: PokemonSortKey;
    direction: "none" | "asc" | "desc";
  }>({ direction: "none" });

  const sortedPokemon = useMemo(() => {
    if (!sortKey || sortDirection === "none") return move.learnedBy;
    const directionMultiplier = sortDirection === "asc" ? 1 : -1;
    return [...move.learnedBy].sort(
      (a, b) => compareValues(a[sortKey], b[sortKey]) * directionMultiplier,
    );
  }, [move.learnedBy, sortDirection, sortKey]);

  const tableItems = useMemo(
    () => sortedPokemon.map((pokemon) => ({ ...pokemon, id: pokemon.key })),
    [sortedPokemon],
  );

  return (
    <>
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
              <ui.span
                vfx={{ axis: "x", align: "center", gap: "s" }}
                style={{ textTransform: "capitalize" }}
              >
                {move.category}
                <CategoryIcon category={move.category} />
              </ui.span>,
            ],
            ["Power", move.power || "—"],
            ["Accuracy", move.accuracy || "—"],
            ["PP", move.pp],
            move.priority
              ? [
                  "Priority",
                  move.priority > 0 ? `+${move.priority}` : move.priority,
                ]
              : null,
            ["Target", capitalize(move.target)],
            ["Generation", move.generation],
          ]}
        />

        <Box vfx={{ axis: "y", gap: "s" }}>
          <Subheader>Description</Subheader>
          <ui.p vfx={{ margin: "none" }}>{move.desc}</ui.p>
        </Box>
      </Box>

      {move.learnedBy.length > 0 && (
        <Box
          vfx={{
            axis: "y",
            gap: "m",
            padding: "m",
            border: true,
            radius: "rounded",
            backgroundColor: "default",
            shadow: "subtle",
          }}
        >
          <Subheader>{`Learned By Level-Up: ${move.learnedBy.length}`}</Subheader>
          <Table
            vfx={{ border: false, shadow: "none", width: "full" }}
            gutters
            items={tableItems}
            columns={[
              {
                key: "name",
                header: "Name",
                render: (item) => (
                  <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
                    <ui.img
                      src={item.sprite}
                      alt={item.name}
                      style={{ width: 40, height: 40 }}
                    />
                    <ui.strong>{item.name}</ui.strong>
                  </Box>
                ),
                sortable: true,
              },
              {
                key: "type",
                header: "Type",
                render: (item) => (
                  <Box vfx={{ axis: "x", gap: "xs" }}>
                    {item.type.map((type) => (
                      <TypeBadge key={type} type={type} />
                    ))}
                  </Box>
                ),
              },
            ]}
            rowActions={(item) => ({ to: `/dex/${item.key}` })}
            sort={{
              key: sortKey,
              direction: sortDirection,
              onSort: (key, direction) =>
                setSort({
                  key:
                    direction === "none" ? undefined : (key as PokemonSortKey),
                  direction,
                }),
            }}
          />
        </Box>
      )}
    </>
  );
}

type PokemonSortKey = "dexNumber" | "name";

const compareValues = (a: unknown, b: unknown) => {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a).localeCompare(String(b), undefined, {
    numeric: true,
    sensitivity: "base",
  });
};
