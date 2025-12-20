import { UnstyledButton } from "@adamjanicki/ui";
import { classNames } from "@adamjanicki/ui/functions";
import { useState } from "react";
import { UnstyledLink } from "src/components/Link";
import "src/components/json-tree.css";

type Props = {
  children: Record<string, any>;
  className?: string;
};

export default function JsonTree({ children, className }: Props) {
  return (
    <div
      className={classNames("json-tree monospace", className)}
      style={{
        whiteSpace: "pre-wrap",
        overflowX: "scroll",
        overflowY: "hidden",
      }}
    >
      <Tree>{children}</Tree>
    </div>
  );
}

type TreeProps = {
  children: any;
  includeComma?: boolean;
};

function Tree({ children: data, includeComma = false }: TreeProps) {
  const [collapsed, setCollapsed] = useState(false);
  const type = typeof data;
  const comma = includeComma ? <span className="json-comma">,</span> : null;

  // Array
  if (Array.isArray(data)) {
    const arraySize = data.length;
    return (
      <>
        <span className="json-token">
          <UnstyledButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "[…" : "["}
          </UnstyledButton>
        </span>
        {arraySize > 0 && !collapsed && (
          <div className="json-elements-container">
            {data.map((node, index) => (
              <div key={index}>
                <Tree includeComma={index < data.length - 1}>{node}</Tree>
              </div>
            ))}
          </div>
        )}
        <span className="json-token">{"]"}</span>
        {comma}{" "}
        {collapsed && (
          <span className="json-comment">
            {"//"} {arraySize} {arraySize > 1 ? "elements" : "element"}
          </span>
        )}
      </>
    );
  }
  // Object
  else if (type === "object" && data) {
    const entries = Object.entries(data);
    const objectSize = entries.length;
    return (
      <>
        <span className="json-token">
          <UnstyledButton onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? "{…" : "{"}
          </UnstyledButton>
        </span>
        {entries.length > 0 && !collapsed && (
          <div className="json-elements-container">
            {entries.map(([key, value], i) => (
              <div key={i}>
                <span className="json-key">"{key}":</span>{" "}
                <Tree includeComma={i < entries.length - 1}>{value}</Tree>
              </div>
            ))}
          </div>
        )}
        <span className="json-token">{"}"}</span>
        {comma}{" "}
        {collapsed && (
          <span className="json-comment">
            {"//"} {objectSize} {objectSize > 1 ? "entries" : "entry"}
          </span>
        )}
      </>
    );
  }
  // leaves
  return (
    <>
      <Primitive>{data}</Primitive>
      {comma}
    </>
  );
}

type PrimitiveType =
  | string
  | boolean
  | number
  | Function
  | BigInt
  | Symbol
  | null
  | undefined;

function Primitive({ children: data }: { children: PrimitiveType }) {
  const type = typeof data;
  let node: React.ReactNode = `${data}`;
  let className = "";
  if (type === "string") {
    if (isValidUrl(data as string)) {
      node = (
        <>
          "
          <UnstyledLink target="_blank" rel="noreferrer" to={data as string}>
            {data as string}
          </UnstyledLink>
          "
        </>
      );
      className = "json-primitive-string-url";
    } else {
      node = `"${data}"`;
    }
  }

  // default leaf
  return (
    <span
      className={classNames(`json-primitive json-primitive-${type}`, className)}
    >
      {node}
    </span>
  );
}

const urlRegex = // eslint-disable-next-line
  /^https?:\/\/(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&\/=]*)$/;
const isValidUrl = (str: string) => urlRegex.test(str);
