import React from "react";
import { render, unmountComponentAtNode } from "react-dom";
import Alternative from "./Alternative";
import { create } from "react-test-renderer";
import { act } from "react-dom/test-utils";

describe("Alternative component", () => {
  describe("snapshot", () => {
    it("matches the snapshot", () => {
      const alternative = create(<Alternative alternative={{}} />);
      expect(alternative.toJSON()).toMatchSnapshot();
    });
  });
  describe("unit tests", () => {
    let container;

    beforeEach(() => {
      container = document.createElement("div");
      document.body.appendChild(container);
    });

    afterEach(() => {
      unmountComponentAtNode(container);
      container.remove();
      container = null;
    });
    it("doesn't have classes correct, incorrect, or selected by default", () => {
      act(() => {
        render(<Alternative alternative={{ type: "text" }} />, container);
      });
      const button = container.querySelector("button");
      expect(button.className).toEqual(expect.not.stringContaining("correct"));
      expect(button.className).toEqual(expect.not.stringContaining("selected"));
      expect(button.className).toEqual(
        expect.not.stringContaining("incorrect")
      );
    });
    it("has class correct if @correct == true , and class selected if @selected == true", () => {
      act(() => {
        render(
          <Alternative alternative={{ type: "text" }} selected correct />,
          container
        );
      });
      const button = container.querySelector("button");
      expect(button.className).toEqual(expect.stringContaining("correct"));
      expect(button.className).toEqual(expect.stringContaining("selected"));
    });
    it("has class incorrect if correct === false", () => {
      act(() => {
        render(
          <Alternative alternative={{ type: "text" }} correct={false} />,
          container
        );
      });
      const button = container.querySelector("button");
      expect(button.className).toEqual(expect.stringContaining("incorrect"));
    });
  });
});
