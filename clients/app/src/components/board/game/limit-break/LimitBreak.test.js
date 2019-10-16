import React from "react";
import ReactDOM from "react-dom";
import LimitBreak from "./LimitBreak";
import { create } from "react-test-renderer";

describe("LimitBreak component", () => {
  it("matches the snapshot", () => {
    const limitBreak = create(<LimitBreak level={50} max={100} />);
    expect(limitBreak.toJSON()).toMatchSnapshot();
  });
});
