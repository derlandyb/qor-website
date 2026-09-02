import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TextField, TextAreaField, SelectField } from "./FormField";

describe("TextField", () => {
  test("GIVEN a label and value WHEN it renders THEN the input is accessible by its label", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<TextField id="name" label="Nome" value="" onChange={onChange} />);

    await user.type(screen.getByLabelText("Nome"), "A");

    expect(onChange).toHaveBeenCalled();
  });

  test("GIVEN an error WHEN it renders THEN the error text is shown as an alert", () => {
    render(<TextField id="email" label="E-mail" value="" onChange={jest.fn()} error="E-mail inválido." />);

    expect(screen.getByRole("alert")).toHaveTextContent("E-mail inválido.");
  });
});

describe("TextAreaField", () => {
  test("GIVEN a label WHEN it renders THEN the textarea is accessible by its label", () => {
    render(<TextAreaField id="bio" label="Bio" value="" onChange={jest.fn()} />);

    expect(screen.getByLabelText("Bio").tagName).toBe("TEXTAREA");
  });
});

describe("SelectField", () => {
  test("GIVEN options WHEN it renders THEN every option is present plus the placeholder", () => {
    render(
      <SelectField
        id="city"
        label="Cidade"
        value=""
        onChange={jest.fn()}
        options={[
          { value: "vitoria", label: "Vitória" },
          { value: "serra", label: "Serra" },
        ]}
      />,
    );

    const select = screen.getByLabelText("Cidade");
    expect(select).toHaveTextContent("Selecione");
    expect(select).toHaveTextContent("Vitória");
    expect(select).toHaveTextContent("Serra");
  });
});
