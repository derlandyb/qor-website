import { render, screen } from "@testing-library/react";
import { GenreTag } from "./GenreTagSet";

describe("GenreTag", () => {
  test.each([
    ["Rock", "bg-[#FF8A1E]/15", "text-[#FF8A1E]"],
    ["Samba", "bg-[#FF2E7E]/15", "text-[#FF2E7E]"],
    ["Sertanejo", "bg-[#FF2E7E]", "text-[#12141D]"],
    ["Eletrônico", "bg-[#B14EFF]/15", "text-[#B14EFF]"],
    ["Reggae", "bg-[#2EC5FF]/15", "text-[#2EC5FF]"],
  ] as const)("GIVEN genre %s WHEN it renders THEN it uses %s and %s", (name, bgClass, textClass) => {
    render(<GenreTag name={name} />);
    const tag = screen.getByText(name);
    expect(tag).toHaveClass(bgClass, textClass);
  });

  test("GIVEN an unrecognized genre name WHEN it renders THEN it falls back to the neutral outline style", () => {
    render(<GenreTag name="Forró" />);
    const tag = screen.getByText("Forró");
    expect(tag).toHaveClass("border", "text-[#9A9FB0]");
  });
});
