import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OtpCodeInput } from "./OtpCodeInput";

describe("OtpCodeInput", () => {
  afterEach(() => {
    jest.useRealTimers();
  });

  test("GIVEN non-digit characters WHEN typed THEN onChange receives only the digits", async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    render(<OtpCodeInput value="" onChange={onChange} onResend={jest.fn()} />);

    await user.type(screen.getByLabelText("Código de verificação"), "a1b2");

    expect(onChange).toHaveBeenLastCalledWith("2");
  });

  test("GIVEN an error WHEN it renders THEN the error is shown as an alert", () => {
    render(<OtpCodeInput value="" onChange={jest.fn()} error="Código inválido ou expirado." onResend={jest.fn()} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Código inválido ou expirado.");
  });

  test("GIVEN the resend cooldown is active WHEN it renders THEN the Reenviar button is not shown", () => {
    render(<OtpCodeInput value="" onChange={jest.fn()} onResend={jest.fn()} resendCooldownSeconds={30} />);

    expect(screen.getByText(/reenviar em 30s/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Reenviar" })).not.toBeInTheDocument();
  });

  test("GIVEN the cooldown has elapsed WHEN Reenviar is clicked THEN onResend fires and the cooldown restarts", async () => {
    const user = userEvent.setup();
    const onResend = jest.fn().mockResolvedValue(undefined);
    render(<OtpCodeInput value="" onChange={jest.fn()} onResend={onResend} resendCooldownSeconds={0} />);

    await user.click(screen.getByRole("button", { name: "Reenviar" }));

    expect(onResend).toHaveBeenCalled();
  });
});
