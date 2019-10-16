import React from "react";
import ReactDOM from "react-dom";
import CategoryPicker from "./CategoryPicker";
import { create } from "react-test-renderer";

describe("CategoryPicker component", () => {
  it("matches the snapshot", () => {
    const categoryPicker = create(<CategoryPicker categories={categories} />);
    expect(categoryPicker.toJSON()).toMatchSnapshot();
  });
});
