import { Alert, Spinner, Box, ui } from "@adamjanicki/ui";
import { Tooltip } from "@adamjanicki/ui-extended";
import BigBadge from "src/components/BigBadge";
import Link from "src/components/Link";
import Page from "src/components/Page";
import TypeBadge from "src/components/TypeBadge";
import useListPokemon from "src/hooks/useListPokemon";
import { getEffectiveBadgeInfo } from "src/pages/ViewPokemon";
import { padDexNumber } from "src/utils/helpers";

export default function Dex() {
  const { pokemon, loading, error } = useListPokemon();

  if (error || (!loading && !pokemon)) {
    return (
      <Wrapper>
        <Alert type="error">
          {error || "There was an error fetching from the API"}
        </Alert>
      </Wrapper>
    );
  }

  if (loading || !pokemon)
    return (
      <Wrapper>
        <Box vfx={{ width: "full" }}>
          <Spinner />
        </Box>
      </Wrapper>
    );

  return (
    <Wrapper>
      <Box
        vfx={{
          axis: "y",
          border: true,
          radius: "rounded",
          shadow: "subtle",
          backgroundColor: "default",
          padding: "xs",
        }}
      >
        {pokemon.map((mon, i) => {
          const { name, sprite, baseTotal, effectiveBaseTotal, key } = mon;
          const [badgeType, tooltipContent] = getEffectiveBadgeInfo(mon);
          return (
            <Link
              to={`/dex/${key}`}
              key={key}
              vfx={{
                axis: "x",
                align: "center",
                justify: "between",
                width: "full",
                color: "inherit",
                paddingY: "xs",
                paddingX: "m",
                borderTop: i > 0,
              }}
            >
              <Box vfx={{ axis: "x", align: "center", gap: "xs" }}>
                <ui.strong vfx={{ fontSize: "m" }}>
                  {padDexNumber(i + 1)}
                </ui.strong>
                <ui.img src={sprite} width={60} height={60} />
                <ui.strong vfx={{ fontSize: "m" }} style={{ width: "12ch" }}>
                  {name}
                </ui.strong>
                <Box vfx={{ axis: "x", gap: "xs", align: "center" }}>
                  {mon.type.map((type) => (
                    <TypeBadge type={type} key={type} />
                  ))}
                </Box>
              </Box>
              <Box vfx={{ axis: "x", align: "center", gap: "s" }}>
                <Tooltip offset={4} tooltipContent={tooltipContent}>
                  <BigBadge type={badgeType} vfx={{ italics: true }}>
                    {String(effectiveBaseTotal)}
                  </BigBadge>
                </Tooltip>
                <ui.strong>{baseTotal}</ui.strong>
              </Box>
            </Link>
          );
        })}
      </Box>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <Page documentTitle="Dex">
      <Box vfx={{ axis: "y", gap: "l", paddingY: "l", width: "full" }}>
        <ui.h1
          className="page-title-text"
          vfx={{ fontWeight: 9, margin: "none" }}
        >
          Dex
        </ui.h1>
        {children}
      </Box>
    </Page>
  );
}
