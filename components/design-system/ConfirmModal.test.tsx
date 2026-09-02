import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConfirmModal } from "./ConfirmModal";

describe("ConfirmModal", () => {
  test("GIVEN open=false WHEN it renders THEN nothing is shown", () => {
    render(<ConfirmModal open={false} title="Excluir conta?" onConfirm={jest.fn()} onCancel={jest.fn()} />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  test("GIVEN open=true WHEN it renders THEN the title and description are shown", () => {
    render(
      <ConfirmModal
        open
        title="Excluir conta?"
        description="Esta ação não pode ser desfeita."
        onConfirm={jest.fn()}
        onCancel={jest.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveTextContent("Excluir conta?");
    expect(screen.getByText("Esta ação não pode ser desfeita.")).toBeInTheDocument();
  });

  test("GIVEN the confirm button WHEN clicked THEN onConfirm fires", async () => {
    const user = userEvent.setup();
    const onConfirm = jest.fn();
    render(<ConfirmModal open title="Excluir conta?" onConfirm={onConfirm} onCancel={jest.fn()} />);

    await user.click(screen.getByRole("button", { name: "Confirmar" }));

    expect(onConfirm).toHaveBeenCalled();
  });

  test("GIVEN the cancel button WHEN clicked THEN onCancel fires", async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(<ConfirmModal open title="Excluir conta?" onConfirm={jest.fn()} onCancel={onCancel} />);

    await user.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onCancel).toHaveBeenCalled();
  });
});
