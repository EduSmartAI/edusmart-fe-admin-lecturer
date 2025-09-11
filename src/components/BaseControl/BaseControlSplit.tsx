// src/components/BaseControl/BaseControlSplit.tsx
import React, { CSSProperties, memo, ReactNode } from "react";
import { Splitter } from "antd";
import { Flex, Typography } from "antd";

interface DescProps {
  text?: string | number;
}
const Desc: React.FC<DescProps> = memo(({ text }) => (
  <Flex justify="center" align="center" style={{ height: "100%" }}>
    <Typography.Text
      type="secondary"
      style={{ whiteSpace: "nowrap", margin: 0 }}
    >
      {text}
    </Typography.Text>
  </Flex>
));
Desc.displayName = "Desc";

type Layout = "horizontal" | "vertical";
interface SplitContainerProps {
  items?: Array<string | number>;
  children?: ReactNode | ReactNode[];
  layout?: Layout;
  style?: CSSProperties;
  panelStyle?: CSSProperties;
}

const BaseControlSplit: React.FC<SplitContainerProps> = memo(
  ({ items, children, layout = "vertical", style, panelStyle }) => {
    const panels =
      items && items.length > 0
        ? items.map((t, i) => <Desc key={i} text={t} />)
        : React.Children.toArray(children || []);

    return (
      <Splitter
        layout={layout}
        style={{
          height: "100%",
          display: "flex",
          flexDirection: layout === "vertical" ? "column" : "row",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
          ...style,
        }}
      >
        {panels.map((content, idx) => (
          <Splitter.Panel
            key={idx}
            style={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              ...panelStyle,
            }}
          >
            {content}
          </Splitter.Panel>
        ))}
      </Splitter>
    );
  },
);

BaseControlSplit.displayName = "BaseControlSplit";
export default BaseControlSplit;
